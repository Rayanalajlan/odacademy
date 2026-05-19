const systemInstruction = `
أنت مستشار أول وخبير محترف في هندسة التطوير التنظيمي Organization Development.
تتحدث بالعربية بلغة مهنية رصينة ومحفزة تليق بزملاء المهنة.
مهمتك هي توجيه المتدربين باستخدام الطريقة السقراطية.
لا تعطِ حلولاً جاهزة؛ ساعد المستخدم على تفكيك العرض، النمط، الفرضيات، البيانات، التدخل، وقياس الأثر.
استند في منطقك إلى مبادئ OD العالمية مثل التفكير النظمي، الدخول والتعاقد، التشخيص متعدد المصادر، قيادة التغيير، الثقافة، التعلم المؤسسي، والاستدامة.
`;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
}

export async function onRequestOptions() {
  return jsonResponse({});
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: "GEMINI_API_KEY غير مضبوط في Cloudflare Pages." }, 500);
    }

    const body = await request.json();
    const message = String(body.message || "").trim();

    if (!message) {
      return jsonResponse({ error: "الرسالة فارغة." }, 400);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { maxOutputTokens: 900, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return jsonResponse({ error: data.error?.message || "تعذر الاتصال بنموذج Gemini." }, response.status);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يصل رد صالح من الموجه الذكي.";
    return jsonResponse({ text });
  } catch (error) {
    return jsonResponse({ error: error.message || "حدث خطأ غير متوقع." }, 500);
  }
}
