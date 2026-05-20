// functions/api/mentor.js
// Cloudflare Pages Function للموجه الذكي.
// المسار المتوقع:
// /api/mentor
//
// هذا الملف لا يضع GEMINI_API_KEY في الواجهة.
// يجب أن يكون GEMINI_API_KEY موجودًا في Cloudflare كـ Secret / Encrypted.

const systemInstruction = `
أنت مستشار أول وعرّاب خبير في هندسة التطوير التنظيمي (Organization Development).

تتحدث بالعربية المهنية القريبة من العامية السعودية الرصينة، بأسلوب ذكي وفخم دون مبالغة.
استخدم عبارات مناسبة مثل:
- يا زميل المهنة
- خلنا نفككها
- وش العرض؟
- وش النمط؟
- وش الفرضيات اللي بنيت عليها؟

مهمتك هي توجيه المتدربين والممارسين باستخدام الطريقة السقراطية الذكية.

قواعدك:
1. لا تعطِ حلولًا جاهزة مباشرة.
2. ساعد المستخدم خطوة بخطوة على تفكيك:
   العرض → النمط → الفرضيات → البيانات المطلوبة → التدخل → قياس الأثر.
3. اربط إجاباتك بمبادئ التطوير التنظيمي:
   التفكير النظمي، الدخول والتعاقد، التشخيص متعدد المصادر، قيادة التغيير، الثقافة، التعلم المؤسسي، والاستدامة.
4. اجعل ردك عمليًا ومباشرًا، لكن لا تختصر لدرجة تفقد العمق.
5. عندما يكون سؤال المستخدم عامًا، اسأله سؤالين تشخيصيين قبل اقتراح المسار.
6. عندما يطلب المستخدم مثالًا، أعطه مثالًا تطبيقيًا مختصرًا ثم اسأله كيف ينطبق على حالته.
7. إذا سألك المستخدم عن بناء وصف وظيفي، لا تعطِ نموذجًا جاهزًا فقط؛ وجّهه أولًا إلى فهم الغرض، موقع الدور، المخرجات، الصلاحيات، العلاقات، مؤشرات الأداء، ثم المهارات.
`;

const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    .slice(0, 7000);
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

function buildModelList(env) {
  const configuredModel = getEnvValue(env, "GEMINI_MODEL");

  if (configuredModel) {
    return [
      configuredModel,
      ...DEFAULT_MODELS.filter((model) => model !== configuredModel)
    ];
  }

  return DEFAULT_MODELS;
}

async function callGeminiOnce({ apiKey, model, message }) {
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
        temperature: 0.72,
        topP: 0.9,
        maxOutputTokens: 1200
      }
    })
  });

  const data = await safeJson(response);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      model,
      error:
        data?.error?.message ||
        data?.message ||
        `تعذر الاتصال بنموذج Gemini: ${model}`
    };
  }

  const text = extractGeminiText(data);

  return {
    ok: true,
    model,
    text:
      text ||
      "وصل رد فارغ من الموجه الذكي. أعد صياغة السؤال بتفاصيل أكثر وحاول مرة أخرى."
  };
}

async function callGeminiWithFallbacks({ apiKey, env, message }) {
  const models = buildModelList(env);
  const errors = [];

  for (const model of models) {
    const result = await callGeminiOnce({
      apiKey,
      model,
      message
    });

    if (result.ok) {
      return result;
    }

    errors.push(`${model}: ${result.error}`);

    // إذا كان الخطأ بسبب ضغط أو نموذج غير متاح، جرّب النموذج التالي.
    // أما أخطاء المفتاح غالبًا لن تنجح مع أي نموذج، لكن نترك الرسالة النهائية أوضح.
    if (![400, 404, 429, 500, 502, 503].includes(result.status)) {
      break;
    }
  }

  return {
    ok: false,
    status: 502,
    error:
      errors.join(" | ") ||
      "تعذر الاتصال بالموجه الذكي عبر جميع النماذج المتاحة."
  };
}

// استخدمنا onRequest بدل onRequestPost حتى لا يظهر 405 بسبب اختلاف طريقة الاستدعاء.
// هذه الدالة ستتعامل مع OPTIONS و GET و POST بوضوح.
export async function onRequest({ request, env }) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    // اختبار سريع من المتصفح:
    // افتح /api/mentor
    // إذا ظهر هذا الرد، فهذا يعني أن Cloudflare Function تعمل.
    if (request.method === "GET") {
      return jsonResponse({
        ok: true,
        service: "odacademy-ai-mentor",
        message: "الموجه الذكي متصل على مستوى Cloudflare Function. أرسل POST لاستخدامه.",
        expectedMethod: "POST"
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        {
          ok: false,
          error: `طريقة الطلب ${request.method} غير مدعومة. استخدم POST.`
        },
        405
      );
    }

    const apiKey = getEnvValue(env, "GEMINI_API_KEY");

    if (!apiKey) {
      return jsonResponse(
        {
          ok: false,
          error:
            "مفتاح GEMINI_API_KEY غير موجود في متغيرات Cloudflare. أضفه كـ Secret / Encrypted ثم أعد النشر."
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

    const result = await callGeminiWithFallbacks({
      apiKey,
      env,
      message
    });

    if (!result.ok) {
      return jsonResponse(
        {
          ok: false,
          error: result.error
        },
        result.status || 502
      );
    }

    return jsonResponse({
      ok: true,
      model: result.model,
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