const systemInstruction = `
أنت مستشار أول وعرّاب خبير في هندسة التطوير التنظيمي (Organization Development).
تتحدث بالعامية السعودية المهنية الرصينة والفخمة الذكية (مثل: يا زميل المهنة، خلنا نفككها، وش العرض، وش النمط، وش الفرضيات اللي بنيت عليها).
مهمتك هي توجيه المتدربين والممارسين باستخدام الطريقة السقراطية الذكية.
لا تعطِ حلولاً جاهزة أبداً؛ ساعد المستخدم خطوة بخطوة على تفكيك (العرض ➔ النمط ➔ الفرضيات ➔ البيانات المطلوبة ➔ التدخل ➔ ثم قياس الأثر).
استند في منطقك العرّابي إلى مبادئ OD العالمية مثل التفكير النظمي، الدخول والتعاقد، التشخيص متعدد المصادر، قيادة التغيير، الثقافة، التعلم المؤسسي، والاستدامة.
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

export default {
  async fetch(request, env) {
    // معالجة طلبات OPTIONS الخاصة بـ CORS
    if (request.method === "OPTIONS") {
      return jsonResponse({});
    }

    // السماح فقط بطلبات POST
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      // جلب المفتاح مباشرة من بيئة الـ Worker الحية
      const apiKey = env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return jsonResponse({ error: "مفتاح GEMINI_API_KEY غير معرف في لوحة تحكم الـ Worker." }, 500);
      }

      const body = await request.json();
      const message = String(body.message || "").trim();

      if (!message) {
        return jsonResponse({ error: "الرسالة فارغة." }, 400);
      }

      // الاتصال بنموذج جيميناي المستقر والسريع
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
        return jsonResponse({ error: data.error?.message || "تعذر الاتصال بنموذج Gemini السحابي." }, response.status);
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم يصل رد صالح من الموجه الذكي.";
      return jsonResponse({ text });

    } catch (error) {
      return jsonResponse({ error: error.message || "حدث خطأ غير متوقع في السيرفر." }, 500);
    }
  }
};