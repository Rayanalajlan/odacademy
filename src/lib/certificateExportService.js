const TEMPLATE_URL = "/certificates/munsaqah-certificate-template.png";

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
}

function drawRightText(ctx, text, x, y, maxWidth, fontSize, options = {}) {
  ctx.save();
  ctx.font = `${options.weight || 800} ${fontSize}px ${options.family || "Tahoma, Arial, sans-serif"}`;
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = options.color || "#24194f";
  ctx.fillText(safeText(text), x, y, maxWidth);
  ctx.restore();
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

async function buildCertificateCanvas({
  kind = "mastery",
  learnerName,
  title,
  subtitle,
  certificateCode,
  completionDate,
  verificationUrl
}) {
  const template = await loadImage(TEMPLATE_URL);
  const canvas = document.createElement("canvas");
  canvas.width = template.naturalWidth || template.width;
  canvas.height = template.naturalHeight || template.height;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const sx = width / 2000;
  const sy = height / 1250;

  ctx.drawImage(template, 0, 0, width, height);

  if (kind === "monthly") {
    ctx.save();
    roundedRect(ctx, 600 * sx, 300 * sy, 800 * sx, 150 * sy, 28 * sx);
    ctx.fillStyle = "rgba(255,255,255,.90)";
    ctx.fill();
    ctx.strokeStyle = "rgba(216,181,109,.55)";
    ctx.lineWidth = 2 * sx;
    ctx.stroke();
    drawCenteredText(ctx, title, width / 2, 350 * sy, 720 * sx, 42 * sx, {
      color: "#2f236f",
      maxLines: 1
    });
    drawCenteredText(ctx, subtitle, width / 2, 405 * sy, 760 * sx, 20 * sx, {
      weight: 800,
      color: "#4f4389",
      maxLines: 2
    });
    ctx.restore();
  }

  drawCenteredText(ctx, learnerName, width / 2, 540 * sy, 880 * sx, 54 * sx, {
    color: "#24194f",
    maxLines: 1
  });

  drawRightText(ctx, `رقم الوثيقة: ${certificateCode}`, 620 * sx, 1080 * sy, 460 * sx, 24 * sx, {
    color: "#24194f",
    weight: 900
  });
  drawRightText(ctx, `تاريخ الإتمام: ${completionDate}`, 1410 * sx, 1080 * sy, 440 * sx, 24 * sx, {
    color: "#24194f",
    weight: 900
  });
  drawCenteredText(ctx, verificationUrl, width / 2, 1190 * sy, 1120 * sx, 18 * sx, {
    color: "#6d5bd0",
    weight: 800,
    maxLines: 1
  });

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

export async function printCertificatePdf(options) {
  const canvas = await buildCertificateCanvas(options);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.96);
  const printWindow = window.open("", "_blank", "width=1200,height=800");

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
      height: 210mm;
      margin: 0;
      background: #fff;
      overflow: hidden;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    img {
      display: block;
      width: 297mm;
      height: 210mm;
      object-fit: cover;
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
