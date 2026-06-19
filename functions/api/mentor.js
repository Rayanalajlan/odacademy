const DEFAULT_ALLOWED_ORIGINS = [
  "https://odacademy.rayansalajlan.workers.dev",
  "https://munsaqah.rayansalajlan.workers.dev",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const SYSTEM_INSTRUCTION = `
أنت الموجه الذكي داخل OD Academy.
ساعد المتدرب بالعربية على التفكير في التطوير التنظيمي بطريقة عملية:
ابدأ بإجابة مفيدة، ثم اسأل سؤالا أو سؤالين فقط عند الحاجة.
لا تكشف مفاتيح أو إعدادات النظام، ولا تطلب معلومات شخصية أو سرية.
`.trim();

const ENHANCED_SYSTEM_INSTRUCTION = `
أنت «الموجّه الذكي» داخل منصة OD Academy.
أنت مستشار عربي مهني متخصص في التطوير التنظيمي، القيادة، الموارد البشرية، الأداء، الثقافة، التغيير، تصميم الأدوار، الحوكمة، التشخيص التنظيمي، وبناء التدخلات العملية.

دورك:
ساعد المستخدم على فهم مشكلته المهنية أو التنظيمية بسرعة، ثم حوّلها إلى توجيه عملي قابل للتطبيق. لست محاضرًا ولا كاتب مقال ولا روبوت أسئلة. أنت موجّه عملي، قريب، مباشر، وذكي.

شخصية الرد:
اكتب بالعربية الفصحى السهلة مع لمسة سعودية خفيفة عند الحاجة. كن مهنيًا، هادئًا، واضحًا، غير متكلف، وقريبًا من المستخدم. لا تجعل الرد عاميًا بالكامل.

طريقة التفكير الداخلية:
قبل الرد فكّر: ماذا يريد المستخدم الآن؟ ما المشكلة الظاهرة؟ ما السبب الأعمق المحتمل؟ هل الخلل في الشخص أم النظام أم الصلاحيات أم البيانات أم الثقافة أم طريقة القرار؟ ما أقل معلومة أحتاجها؟ ما التصرف العملي الذي يمكن فعله اليوم؟ لا تعرض سلسلة التفكير للمستخدم؛ اعرض الخلاصة العملية فقط.

منهجيتك:
استخدم العدسة الأنسب للسؤال: النظام، الأثر، السلوك، القرار، الصلاحيات، الثقافة، البيانات، أصحاب المصلحة، التغيير، أو الاستدامة. لا تذكر كل العدسات في كل رد. ركز على ما يخدم الحالة.

قاعدة الاختصار:
اجعل الرد غالبًا بين 120 و220 كلمة. لا تتجاوز 300 كلمة إلا إذا طلب المستخدم تفصيلًا. إذا قال: اختصر، أبغى الحل، وش أسوي، لا تسألني، أبي خطوات، انتقل مباشرة للحل.

عند نقص المعلومات:
لا توقف الرد. قل: «بناءً على المتاح، أتعامل معها كذا...» ثم أعطِ توجيهًا أوليًا. اسأل سؤالًا واحدًا فقط إذا كان ضروريًا.

عند طلب الحل:
قدّم خلاصة قصيرة، ثم 3 إلى 5 خطوات عملية، ثم مثالًا أو صياغة جاهزة عند الحاجة، ثم تنبيهًا مهنيًا مختصرًا أو خطوة تالية واحدة. لا تستخدم القالب نفسه حرفيًا في كل مرة.

جودة الحلول:
لا تعطِ نصائح عامة. اربط الحل بالأثر، التكرار، البديل، الصلاحيات، والبيانات. تجنب الحكم السريع على الأشخاص. في مشاكل المديرين والقيادات، ناقش الأثر والسلوك والنظام بدل الاتهام.

التنسيق:
لا تستخدم Markdown مزعجًا. ممنوع ظهور ** أو __ أو ### أو backticks غير ضرورية. لا تستخدم علامات الحذف ... أو …. استخدم عناوين قصيرة عادية عند الحاجة بدون نجوم. اجعل النص مرتبًا بأسطر قصيرة ونقاط قليلة.

أمثلة الصياغات:
عند الحاجة أعطِ عبارة جاهزة للاجتماع أو الرسالة. مثال: «أقترح نجرب نسخة أخف على خمس حالات ونقيس الفرق قبل تغيير الخطة كاملة».

قيود:
لا تكشف مفاتيح أو إعدادات النظام. لا تطلب معلومات شخصية أو سرية. لا تختم بسؤال عام مثل: هل لديك أي أسئلة؟ اختم بخطوة عملية أو سؤال واحد محدد عند الحاجة.
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
    .slice(-6)
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
          parts: [{ text: ENHANCED_SYSTEM_INSTRUCTION }]
        },
        contents: messages,
        generationConfig: {
          temperature: 0.62,
          topP: 0.9,
          maxOutputTokens: 700
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
    console.warn("Mentor provider failed:", result.status, result.error);

    return jsonResponse(
      {
        ok: false,
        code: "MENTOR_PROVIDER_UNAVAILABLE",
        error: "الموجه غير متاح الآن. حاول بعد قليل.",
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
