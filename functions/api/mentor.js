// functions/api/mentor.js
// هذه دالة Cloudflare Pages Function وليست Worker عادي.
// المسار المتوقع:
// /api/mentor
//
// مهم:
// لا تضع GEMINI_API_KEY داخل React أو داخل ملفات الواجهة.
// ضعه فقط في Cloudflare كـ Secret / Encrypted.

const systemInstruction = `
أنت مستشار أول وعرّاب خبير في هندسة التطوير التنظيمي (Organization Development).

تتحدث بالعربية المهنية القريبة من العامية السعودية الرصينة، بأسلوب ذكي وفخم دون مبالغة.
استخدم عبارات مثل:
- يا زميل المهنة
- خلنا نفككها
- وش العرض؟
- وش النمط؟
- وش الفرضيات اللي بنيت عليها؟

مهمتك هي توجيه المتدربين والممارسين باستخدام الطريقة السقراطية الذكية.

قواعدك:
1. لا تعطِ حلولاً جاهزة مباشرة.
2. ساعد المستخدم خطوة بخطوة على تفكيك:
   العرض → النمط → الفرضيات → البيانات المطلوبة → التدخل → قياس الأثر.
3. اربط إجاباتك بمبادئ التطوير التنظيمي:
   التفكير النظمي، الدخول والتعاقد، التشخيص متعدد المصادر، قيادة التغيير، الثقافة، التعلم المؤسسي، والاستدامة.
4. اجعل ردك عمليًا ومباشرًا، لكن لا تختصر لدرجة تفقد العمق.
5. عندما يكون سؤال المستخدم عامًا، اسأله سؤالين تشخيصيين قبل اقتراح المسار.
6. عندما يطلب المستخدم مثالًا، أعطه مثالًا تطبيقيًا مختصرًا ثم اسأله كيف ينطبق على حالته.
`;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function getEnvValue(env, ...names) {
  for (const name of names) {
    const value = env?.[name];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function cleanUserMessage(value) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, 6000);
}

function extractGeminiText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => part?.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function callGemini({ apiKey, model, message }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemInstruction
          }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: message
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000
      }
    })
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        data?.error?.message ||
        data?.message ||
        "تعذر الاتصال بنموذج Gemini."
    };
  }

  const text = extractGeminiText(data);

  return {
    ok: true,
    text:
      text ||
      "وصل رد فارغ من الموجه الذكي. أعد صياغة السؤال بتفاصيل أكثر وحاول مرة أخرى."
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const apiKey = getEnvValue(env, "GEMINI_API_KEY");

    // تقدر تغيّر النموذج من Cloudflare بإضافة GEMINI_MODEL.
    // لو لم تضفه سيستخدم gemini-2.5-flash.
    const model = getEnvValue(env, "GEMINI_MODEL") || "gemini-2.5-flash";

    if (!apiKey) {
      return jsonResponse(
        {
          ok: false,
          error:
            "مفتاح GEMINI_API_KEY غير موجود في متغيرات Cloudflare. أضفه كـ Secret / Encrypted."
        },
        500
      );
    }

    const body = await request.json().catch(() => ({}));
    const message = cleanUserMessage(body?.message);

    if (!message) {
      return jsonResponse(
        {
          ok: false,
          error: "اكتب رسالة أولًا حتى يستطيع الموجه الذكي الرد عليك."
        },
        400
      );
    }

    const result = await callGemini({
      apiKey,
      model,
      message
    });

    if (!result.ok) {
      return jsonResponse(
        {
          ok: false,
          error: result.error,
          model
        },
        result.status || 502
      );
    }

    return jsonResponse({
      ok: true,
      model,
      text: result.text
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error?.message || "حدث خطأ غير متوقع في خادم الموجه الذكي."
      },
      500
    );
  }
}