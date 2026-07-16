const COURSE_TEMPLATE_URL = "/certificates/munsaqah-course-certificate.png";
const MONTHLY_TEMPLATE_URL = "/certificates/munsaqah-monthly-certificate.png";

// إحداثيات الخانات مُستخرجة آليًا من قالبي PNG بدقّة البكسل (فحص لوني للنصوص
// النائبة والمربعات)، لا بالتخمين. لذلك تُغطّى النصوص النائبة بالكامل وتُوضع
// القيم في مركز كل خانة دون أي تراكب. القالبان بمقاس 2454×1839.

function safeText(value, fallback = "") {
  return String(value || fallback).replace(/\s+/g, " ").trim();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذر تحميل قالب الشهادة."));
    image.src = src;
  });
}

// يقرأ اللون الفعلي لخلفية الخانة من نقطة خالية من النص، فيصبح القناع بلا حواف ظاهرة.
function sampleFill(ctx, x, y) {
  try {
    const [r, g, b] = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return "#ffffff";
  }
}

// يمسح مستطيلًا بلون خلفية الخانة (يغطّي النص النائب) دون لمس حدود الخانة أو خطوط التسطير.
function maskRect(ctx, x, y, width, height, fill) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

// يختار حجم خط يجعل النص ضمن العرض المتاح (لأسماء وأرقام طويلة).
function fitFontSize(ctx, text, family, weight, startSize, maxWidth) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && size > 12) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

function drawCenteredValue(ctx, text, cx, cy, maxWidth, size, options = {}) {
  const {
    weight = 900,
    color = "#2f236f",
    family = '"Tajawal", "Tahoma", Arial, sans-serif'
  } = options;

  const value = safeText(text);
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  const finalSize = fitFontSize(ctx, value, family, weight, size, maxWidth);
  ctx.font = `${weight} ${finalSize}px ${family}`;
  ctx.fillText(value, cx, cy);
  ctx.restore();
}

function drawCourseCertificate(ctx, options) {
  const learnerName = safeText(options.learnerName, "متدرب");
  const certificateCode = safeText(options.certificateCode, "OD");
  const completionDate = safeText(options.completionDate, "غير محدد");

  const paper = sampleFill(ctx, 1227, 500);
  const nameFill = sampleFill(ctx, 770, 815);

  // اسم المتدرب — الخانة الكبيرة (مركز النص النائب 1263,838)
  maskRect(ctx, 815, 748, 900, 160, nameFill);
  drawCenteredValue(ctx, learnerName, 1263, 833, 900, 62, {
    color: "#2f236f",
    weight: 950
  });

  // اسم المسار (مع تسطير ذهبي أسفله، لا نلمسه)
  maskRect(ctx, 895, 986, 720, 58, paper);
  drawCenteredValue(ctx, "مسار منسقة للتطوير التنظيمي", 1254, 1017, 700, 40, {
    color: "#6d5bd0",
    weight: 900
  });

  // أربع خانات إحصائية — الترتيب من اليسار: 168 / 672 / 24 / 6
  const stats = [
    { cx: 674, value: "168" },
    { cx: 1061, value: "672" },
    { cx: 1448, value: "24" },
    { cx: 1835, value: "6" }
  ];
  const statFill = sampleFill(ctx, 674, 1150);
  stats.forEach(({ cx, value }) => {
    maskRect(ctx, cx - 150, 1268, 300, 96, statFill);
    drawCenteredValue(ctx, value, cx, 1322, 250, 62, {
      color: "#8b6ff0",
      weight: 950
    });
  });

  // تاريخ الإتمام (يسار) — أعلى خط التسطير
  maskRect(ctx, 175, 1636, 590, 70, paper);
  drawCenteredValue(ctx, completionDate, 455, 1672, 560, 28, {
    color: "#5b4a94",
    weight: 800
  });

  // رقم الوثيقة (يمين) — القناع يمتد حتى حافة القالب لتغطية النص النائب كاملًا
  maskRect(ctx, 1355, 1620, 860, 92, paper);
  drawCenteredValue(ctx, certificateCode, 1730, 1668, 780, 26, {
    color: "#5b4a94",
    weight: 800
  });
}

function drawMonthlyCertificate(ctx, options) {
  const learnerName = safeText(options.learnerName, "متدرب");
  const title = safeText(options.title, "شهادة إنجاز شهرية");
  const certificateCode = safeText(options.certificateCode, "ODM");
  const completionDate = safeText(options.completionDate, "غير محدد");
  const monthMatch = title.match(/الشهر\s+(.+)$/);
  const monthLabel = monthMatch?.[1] || title.replace("شهادة إنجاز", "").trim() || "منجز";
  const year = safeText(options.year) || String(new Date().getFullYear());

  const paper = sampleFill(ctx, 1227, 500);
  const nameFill = sampleFill(ctx, 620, 760);

  // اسم المتدرب — القناع يغطّي النص النائب كاملًا رأسيًا (656→876)
  maskRect(ctx, 720, 648, 1070, 236, nameFill);
  drawCenteredValue(ctx, learnerName, 1254, 762, 1000, 60, {
    color: "#2f236f",
    weight: 950
  });

  // الشهر (يمين الصندوق) والسنة (وسطه) — أعلى خطي التسطير
  maskRect(ctx, 1165, 950, 500, 52, paper);
  drawCenteredValue(ctx, monthLabel, 1410, 982, 480, 34, {
    color: "#4f4389",
    weight: 950
  });
  maskRect(ctx, 605, 950, 455, 52, paper);
  drawCenteredValue(ctx, year, 830, 982, 430, 34, {
    color: "#4f4389",
    weight: 950
  });

  // اسم المسار (تسطير ذهبي أسفله)
  maskRect(ctx, 900, 1133, 710, 55, paper);
  drawCenteredValue(ctx, "مسار منسقة للتطوير التنظيمي", 1254, 1164, 690, 36, {
    color: "#6d5bd0",
    weight: 900
  });

  // ثلاث خانات إحصائية — من اليسار: 4 أسابيع / 28 يومًا / 112 ساعة
  const stats = [
    { cx: 843, value: "4" },
    { cx: 1254, value: "28" },
    { cx: 1664, value: "112" }
  ];
  const statFill = sampleFill(ctx, 843, 1220);
  stats.forEach(({ cx, value }) => {
    maskRect(ctx, cx - 150, 1262, 300, 130, statFill);
    drawCenteredValue(ctx, value, cx, 1326, 250, 60, {
      color: "#8b6ff0",
      weight: 950
    });
  });

  // تاريخ الإصدار (يسار) ورقم الوثيقة (يمين)
  maskRect(ctx, 175, 1636, 590, 70, paper);
  drawCenteredValue(ctx, completionDate, 455, 1672, 560, 28, {
    color: "#5b4a94",
    weight: 800
  });
  maskRect(ctx, 1355, 1620, 860, 92, paper);
  drawCenteredValue(ctx, certificateCode, 1730, 1668, 780, 26, {
    color: "#5b4a94",
    weight: 800
  });
}

async function buildCertificateCanvas(options) {
  const template = await loadImage(options.kind === "monthly" ? MONTHLY_TEMPLATE_URL : COURSE_TEMPLATE_URL);
  const canvas = document.createElement("canvas");
  canvas.width = template.naturalWidth || template.width;
  canvas.height = template.naturalHeight || template.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

  if (options.kind === "monthly") {
    drawMonthlyCertificate(ctx, options);
  } else {
    drawCourseCertificate(ctx, options);
  }

  return canvas;
}

export async function downloadCertificateJpeg(options) {
  const canvas = await buildCertificateCanvas(options);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("تعذر إنشاء صورة الشهادة."));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = options.filename || "munsaqah-certificate.jpg";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 800);
        resolve(true);
      },
      "image/jpeg",
      0.95
    );
  });
}

export async function buildCertificateDataUrl(options) {
  const canvas = await buildCertificateCanvas(options);
  return canvas.toDataURL("image/jpeg", 0.96);
}

export async function printCertificatePdf(options) {
  const canvas = await buildCertificateCanvas(options);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    throw new Error("تعذر فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة.");
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${safeText(options.title, "شهادة منسقة")}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    html, body {
      width: 297mm;
      min-height: 210mm;
      margin: 0;
      background: #fff;
      overflow: hidden;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    body {
      display: grid;
      place-items: center;
    }
    img {
      display: block;
      width: 297mm;
      height: 210mm;
      object-fit: contain;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  </style>
</head>
<body>
  <img src="${dataUrl}" alt="شهادة منسقة" />
  <script>
    window.onload = () => {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}
