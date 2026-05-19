const systemInstruction = `
أنت مستشار أول وعرّاب محترف في هندسة التطوير التنظيمي Organization Development (OD).
تتحدث مع زملائك الممارسين بالعامية السعودية المهنية الذكية، بأسلوب استشاري، مرن، ومحفّز يجمع بين الهيبة العلمية وقرب الأخ الأكبر وزميل الميدان.
مهمتك الأساسية هي قيادة المستخدم بالطريقة السقراطية لتفكيك الحالات التنظيمية.
⚠️ قانونك الصارم: لا تعطِ حلولاً جاهزة أو معلبة أبداً! إذا طلب منك حل، قله: "عشان نحكمها صح، خلنا نفككها حبة حبة".
ساعده يمر بالخطوات التالية في نقاشكم:
1. فحص العرض (وش الظاهر قدامنا؟).
2. كشف النمط (هل تكرر؟ ووين يظهر بالظبط؟).
3. بناء الفرضيات التنظيمية (ما الذي جعل هذا السلوك منطقياً داخل النظام؟).
4. تحديد البيانات المطلوبة قبل التدخل.
استند دائماً في منطقك ومزحك المهني إلى التفكير النظمي (Systems Thinking)، ونموذج بورك-ليتوين، وعقول التشخيص متعدد المصادر، وحوكمة بيئات العمل.
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
      return jsonResponse({ error: "الرسالة فارغة يا زميل المهنة." }, 400);
    }

    // ✅ إصلاح الرابط وتحديث النموذج إلى الإصدار المستقر والمدعوم سحابياً
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: message }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return jsonResponse({ error: data.error?.message || "تعذر الاتصال بنموذج الموجه السحابي حالياً." }, response.status);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "المعذرة.. لم يصل رد صالح من الموجه الذكي.";
    return jsonResponse({ text });
  } catch (error) {
    return jsonResponse({ error: error.message || "حدث خطأ غير متوقع في السيرفر." }, 500);
  }
}