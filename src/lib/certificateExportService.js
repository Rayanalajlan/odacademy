const COURSE_TEMPLATE_URL = "/certificates/munsaqah-course-certificate.png";
const MONTHLY_TEMPLATE_URL = "/certificates/munsaqah-monthly-certificate.png";

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

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function cover(ctx, x, y, width, height, radius = 18, fill = "#ffffff") {
  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawCenteredText(ctx, text, x, y, maxWidth, fontSize, options = {}) {
  const {
    weight = 900,
    color = "#2f236f",
    family = "Tahoma, Arial, sans-serif",
    lineHeight = 1.25,
    maxLines = 2
  } = options;

  const words = safeText(text).split(" ");
  const lines = [];
  let currentLine = "";

  ctx.save();
  ctx.font = `${weight} ${fontSize}px ${family}`;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(nextLine).width <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) lines.push(currentLine);

  const visibleLines = lines.slice(0, maxLines);
  const totalHeight = (visibleLines.length - 1) * fontSize * lineHeight;

  visibleLines.forEach((line, index) => {
    ctx.fillText(line, x, y - totalHeight / 2 + index * fontSize * lineHeight);
  });

  ctx.restore();
}

function drawRightText(ctx, text, x, y, maxWidth, fontSize, options = {}) {
  ctx.save();
  ctx.font = `${options.weight || 800} ${fontSize}px ${options.family || "Tahoma, Arial, sans-serif"}`;
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = options.color || "#2f236f";
  ctx.fillText(safeText(text), x, y, maxWidth);
  ctx.restore();
}

function drawMetricValue(ctx, value, x, y, width, fontScale = 1) {
  cover(ctx, x - width / 2, y - 78, width, 76, 10, "#ffffff");
  drawCenteredText(ctx, value, x, y - 38, width - 30, 44 * fontScale, {
    color: "#8b6ff0",
    weight: 950,
    maxLines: 1
  });
}

function drawCourseCertificate(ctx, options, width, height) {
  const sx = width / 2454;
  const sy = height / 1839;
  const learnerName = safeText(options.learnerName, "متدرب");
  const certificateCode = safeText(options.certificateCode, "OD");
  const completionDate = safeText(options.completionDate, "غير محدد");
  const verificationCode = safeText(options.verificationCode, certificateCode);

  cover(ctx, 650 * sx, 725 * sy, 1155 * sx, 160 * sy, 18 * sx, "#f3efff");
  drawCenteredText(ctx, learnerName, width / 2, 805 * sy, 1040 * sx, 62 * sx, {
    color: "#2f236f",
    weight: 950,
    maxLines: 1
  });

  cover(ctx, 850 * sx, 1010 * sy, 760 * sx, 92 * sy, 12 * sx, "#ffffff");
  drawCenteredText(ctx, "مسار منسقة للتطوير التنظيمي", width / 2, 1053 * sy, 660 * sx, 38 * sx, {
    color: "#6d5bd0",
    weight: 900,
    maxLines: 1
  });

  drawMetricValue(ctx, "168", 710 * sx, 1360 * sy, 290 * sx, sx);
  drawMetricValue(ctx, "672", 1030 * sx, 1360 * sy, 290 * sx, sx);
  drawMetricValue(ctx, "24", 1350 * sx, 1360 * sy, 290 * sx, sx);
  drawMetricValue(ctx, "6", 1670 * sx, 1360 * sy, 290 * sx, sx);

  cover(ctx, 185 * sx, 1618 * sy, 520 * sx, 70 * sy, 8 * sx, "#ffffff");
  drawCenteredText(ctx, completionDate, 440 * sx, 1654 * sy, 430 * sx, 27 * sx, {
    color: "#5b4a94",
    weight: 850,
    maxLines: 1
  });

  cover(ctx, 1700 * sx, 1618 * sy, 535 * sx, 70 * sy, 8 * sx, "#ffffff");
  drawCenteredText(ctx, certificateCode, 1962 * sx, 1654 * sy, 430 * sx, 27 * sx, {
    color: "#5b4a94",
    weight: 850,
    maxLines: 1
  });

  cover(ctx, 780 * sx, 1765 * sy, 900 * sx, 44 * sy, 10 * sx, "#ffffff");
  drawCenteredText(ctx, `رقم التحقق: ${verificationCode}`, width / 2, 1787 * sy, 820 * sx, 20 * sx, {
    color: "#6d5bd0",
    weight: 850,
    maxLines: 1
  });
}

function drawMonthlyCertificate(ctx, options, width, height) {
  const sx = width / 2454;
  const sy = height / 1839;
  const learnerName = safeText(options.learnerName, "متدرب");
  const title = safeText(options.title, "شهادة إنجاز شهرية");
  const certificateCode = safeText(options.certificateCode, "ODM");
  const completionDate = safeText(options.completionDate, "غير محدد");
  const monthMatch = title.match(/الشهر\s+(.+)$/);
  const monthLabel = monthMatch?.[1] || title.replace("شهادة إنجاز", "").trim() || "منجز";

  cover(ctx, 650 * sx, 627 * sy, 1155 * sx, 155 * sy, 18 * sx, "#f3efff");
  drawCenteredText(ctx, learnerName, width / 2, 705 * sy, 1040 * sx, 58 * sx, {
    color: "#2f236f",
    weight: 950,
    maxLines: 1
  });

  cover(ctx, 700 * sx, 966 * sy, 1060 * sx, 84 * sy, 16 * sx, "#f4f0ff");
  drawRightText(ctx, monthLabel, 1585 * sx, 1007 * sy, 320 * sx, 33 * sx, {
    color: "#4f4389",
    weight: 950
  });
  drawRightText(ctx, "2026", 1050 * sx, 1007 * sy, 250 * sx, 33 * sx, {
    color: "#4f4389",
    weight: 950
  });

  cover(ctx, 880 * sx, 1170 * sy, 700 * sx, 80 * sy, 12 * sx, "#ffffff");
  drawCenteredText(ctx, "مسار منسقة للتطوير التنظيمي", width / 2, 1209 * sy, 610 * sx, 34 * sx, {
    color: "#6d5bd0",
    weight: 900,
    maxLines: 1
  });

  drawMetricValue(ctx, "112", 1620 * sx, 1420 * sy, 290 * sx, sx);
  drawMetricValue(ctx, "28", 1230 * sx, 1420 * sy, 290 * sx, sx);
  drawMetricValue(ctx, "4", 840 * sx, 1420 * sy, 290 * sx, sx);

  cover(ctx, 185 * sx, 1618 * sy, 520 * sx, 70 * sy, 8 * sx, "#ffffff");
  drawCenteredText(ctx, completionDate, 440 * sx, 1654 * sy, 430 * sx, 27 * sx, {
    color: "#5b4a94",
    weight: 850,
    maxLines: 1
  });

  cover(ctx, 1700 * sx, 1618 * sy, 535 * sx, 70 * sy, 8 * sx, "#ffffff");
  drawCenteredText(ctx, certificateCode, 1962 * sx, 1654 * sy, 430 * sx, 27 * sx, {
    color: "#5b4a94",
    weight: 850,
    maxLines: 1
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
    drawMonthlyCertificate(ctx, options, canvas.width, canvas.height);
  } else {
    drawCourseCertificate(ctx, options, canvas.width, canvas.height);
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
