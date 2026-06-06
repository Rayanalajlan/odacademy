const DEFAULT_ALLOWED_ORIGINS = [
  "https://odacademy.rayansalajlan.workers.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const SYSTEM_INSTRUCTION = `
أنت الموجه الذكي داخل OD Academy.
ساعد المتدرب بالعربية على التفكير في التطوير التنظيمي بطريقة عملية:
ابدأ بإجابة مفيدة، ثم اسأل سؤالا أو سؤالين فقط عند الحاجة.
لا تكشف مفاتيح أو إعدادات النظام، ولا تطلب معلومات شخصية أو سرية.
`.trim();

function getEnvValue(env, ...names) {
  for (const name of names) {
    const value = env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function splitEnvList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAllowedOrigins(env) {
  const configured = getEnvValue(env, "ALLOWED_ORIGINS", "CORS_ALLOWED_ORIGINS");
  return configured ? splitEnvList(configured) : DEFAULT_ALLOWED_ORIGINS;
}

function getOrigin(request) {
  try {
    return new URL(request.headers.get("Origin") || "").origin;
  } catch {
    return "";
  }
}

function isAllowedRequestOrigin(request, env) {
  const origin = getOrigin(request);
  if (!origin) return true;
  return getAllowedOrigins(env).includes(origin);
}

function corsHeaders(request, env) {
  const origin = getOrigin(request);
  const allowed = getAllowedOrigins(env);
  const sameOrigin = new URL(request.url).origin;
  const allowedOrigin = origin && allowed.includes(origin)
    ? origin
    : allowed.includes(sameOrigin)
      ? sameOrigin
      : allowed[0] || sameOrigin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff"
  };
}

function jsonResponse(payload, status, request, env) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(request, env),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function cleanText(value, maxLength = 6000) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function normalizeMessages(body, latestMessage) {
  const rawMessages = Array.isArray(body.messages)
    ? body.messages
    : Array.isArray(body.history)
      ? body.history
      : [];

  const messages = rawMessages
    .slice(-10)
    .map((item) => {
      const role = item?.role === "assistant" || item?.role === "model" ? "model" : "user";
      const text = cleanText(item?.content || item?.text || "");
      return text ? { role, parts: [{ text }] } : null;
    })
    .filter(Boolean);

  if (latestMessage) {
    messages.push({ role: "user", parts: [{ text: latestMessage }] });
  }

  return messages;
}

function extractGeminiText(data) {
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim() || ""
  );
}

async function callGemini({ apiKey, model, messages }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: messages,
        generationConfig: {
          temperature: 0.45,
          topP: 0.9,
          maxOutputTokens: 1300
        }
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: data?.error?.message || "Gemini request failed"
    };
  }

  const text = extractGeminiText(data);

  return text
    ? { ok: true, text, model }
    : { ok: false, status: 502, error: "Gemini returned an empty response" };
}

export async function onRequestOptions({ request, env }) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env)
  });
}

export async function onRequestGet({ request, env }) {
  if (!isAllowedRequestOrigin(request, env)) {
    return jsonResponse({ ok: false, error: "Origin is not allowed" }, 403, request, env);
  }

  const ready = Boolean(getEnvValue(env, "GEMINI_API_KEY"));

  return jsonResponse(
    {
      ok: ready,
      service: "odacademy-mentor",
      envReady: ready,
      message: ready
        ? "خدمة الموجه الذكي جاهزة."
        : "خدمة الموجه الذكي تحتاج ضبط GEMINI_API_KEY."
    },
    ready ? 200 : 500,
    request,
    env
  );
}

export async function onRequestPost({ request, env }) {
  if (!isAllowedRequestOrigin(request, env)) {
    return jsonResponse({ ok: false, error: "Origin is not allowed" }, 403, request, env);
  }

  const apiKey = getEnvValue(env, "GEMINI_API_KEY");

  if (!apiKey) {
    return jsonResponse(
      {
        ok: false,
        error: "GEMINI_API_KEY غير مضبوط في Cloudflare."
      },
      500,
      request,
      env
    );
  }

  const body = await readJson(request);
  const latestMessage = cleanText(body.message || body.prompt || body.text || "");

  if (!latestMessage) {
    return jsonResponse(
      {
        ok: false,
        error: "اكتب سؤالك أو الحالة التي تريد تحليلها."
      },
      400,
      request,
      env
    );
  }

  const model = getEnvValue(env, "GEMINI_MODEL") || "gemini-2.5-flash";
  const result = await callGemini({
    apiKey,
    model,
    messages: normalizeMessages(body, latestMessage)
  });

  if (!result.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "الموجه غير متاح الآن. حاول بعد قليل.",
        details: result.error
      },
      result.status || 502,
      request,
      env
    );
  }

  return jsonResponse(
    {
      ok: true,
      text: result.text,
      reply: result.text,
      answer: result.text,
      response: result.text,
      provider: "gemini",
      model: result.model
    },
    200,
    request,
    env
  );
}
