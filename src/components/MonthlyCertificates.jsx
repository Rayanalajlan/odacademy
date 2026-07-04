import { useEffect, useMemo, useState } from "react";
import {
  getOrCreateMonthlyCertificates,
  MONTHLY_MILESTONES
} from "../lib/monthlyCertificateService";
import { buildVerificationUrl, copyTextSafely } from "../lib/masteryCertificateService";

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDate(value) {
  if (!value) return "غير صادر بعد";

  try {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return "غير محدد";
  }
}

function buildMonthlyLinkedInPost(record) {
  const monthNumber = safeNumber(record?.month_number, 1);
  const title = record?.month_title || `إنجاز الشهر ${monthNumber}`;
  const verificationUrl = buildVerificationUrl(record?.verification_slug || record?.certificate_code);

  return `الحمد لله، أنجزت ${title} ضمن رحلتي في منسقة للتطوير التنظيمي.

شهر جديد خلصته بخطوات صغيرة لكنها ثابتة: قراءة، تطبيق، اختبار، وربط المفاهيم بسياق العمل السعودي.

الشيء الجميل في الرحلة أنها ما تكتفي بالمعلومة، بل تدربك تسأل السؤال الصح قبل تقفز للحل.

شكرًا لمنصة منسقة على هذه التجربة المرتبة والثرية.

${record?.verification_enabled ? `رابط التحقق: ${verificationUrl}` : ""}

#التطوير_التنظيمي
#التعلم_المستمر
#منسقة
#منسقة_للتطوير_التنظيمي`;
}

function escapeSvgText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

function downloadSvgAsJpeg(svg, filename, width = 1600, height = 1000) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("تعذر إنشاء ملف JPEG."));
            return;
          }

          downloadBlob(blob, filename);
          resolve(true);
        },
        "image/jpeg",
        0.94
      );
    };

    image.onerror = () => {
      reject(new Error("تعذر تحميل تصميم الشهادة."));
    };

    image.src = url;
  });
}

function printElementAsSinglePage(elementId, title = "munsaqah-monthly-certificate") {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("تعذر العثور على تصميم الشهادة للطباعة.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) {
    alert("تعذر فتح نافذة الطباعة. تأكد من السماح بالنوافذ المنبثقة.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
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
      font-family: Tahoma, Arial, sans-serif;
    }
    .print-root {
      width: 297mm;
      height: 210mm;
      display: grid;
      place-items: center;
      background: #fff;
      overflow: hidden;
    }
    .monthly-certificate-preview {
      width: 297mm !important;
      height: 210mm !important;
      max-width: 297mm !important;
      max-height: 210mm !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 28mm !important;
      box-sizing: border-box !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      display: grid !important;
      align-content: center !important;
    }
  </style>
</head>
<body>
  <main class="print-root">${element.outerHTML}</main>
  <script>
    window.onload = () => {
      window.focus();
      window.print();
      setTimeout(() => window.close(), 600);
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

export default function MonthlyCertificates({
  userName = "متدرب",
  completedDays = 0,
  totalDays = 168
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [copiedPostMonth, setCopiedPostMonth] = useState("");

  const safeCompletedDays = Math.max(0, Math.min(safeNumber(totalDays, 168), safeNumber(completedDays)));

  async function syncMonthlyCertificates() {
    setLoading(true);
    setError("");

    try {
      const data = await getOrCreateMonthlyCertificates({
        userName,
        completedDays: safeCompletedDays,
        totalDays
      });

      setRecords(data);
    } catch (syncError) {
      console.warn("تعذر مزامنة شهادات الإنجاز الشهرية:", syncError);
      setError(syncError?.message || "تعذر مزامنة شهادات الإنجاز الشهرية الآن.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    syncMonthlyCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName, safeCompletedDays, totalDays]);

  const unlockedCount = useMemo(() => {
    return records.filter((record) => record.status === "issued").length;
  }, [records]);

  async function copyVerification(record) {
    const url = buildVerificationUrl(record.verification_slug || record.certificate_code);
    const ok = await copyTextSafely(url);

    if (ok) {
      setCopiedSlug(record.verification_slug || record.certificate_code);
      setTimeout(() => setCopiedSlug(""), 2400);
    } else {
      alert("لم يتم نسخ رابط التحقق تلقائيًا. انسخه يدويًا من البطاقة.");
    }
  }

  async function copyLinkedInPost(record) {
    const ok = await copyTextSafely(buildMonthlyLinkedInPost(record));

    if (ok) {
      setCopiedPostMonth(record.month_number);
      setTimeout(() => setCopiedPostMonth(""), 2400);
      return;
    }

    alert("لم يتم نسخ نص لينكدإن تلقائيًا. انسخه يدويًا من بطاقة الشهادة.");
  }

  function shareMonthlyOnLinkedIn(record) {
    copyLinkedInPost(record);

    const url = record?.verification_enabled
      ? buildVerificationUrl(record.verification_slug || record.certificate_code)
      : "https://munsaqah.rayansalajlan.workers.dev/";

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "width=760,height=680"
    );
  }

  function printMonthlyCertificate(record) {
    printElementAsSinglePage(`monthly-certificate-${record.month_number}`, `شهادة الشهر ${record.month_number}`);
  }

  async function downloadMonthlyCertificateImage(record) {
    const title = record.month_title || `شهادة إنجاز الشهر ${record.month_number}`;
    const subtitle = record.month_subtitle || "محطة شهرية في رحلة منسقة للتطوير التنظيمي";
    const safeName = escapeSvgText(userName || "متدرب");
    const safeCode = escapeSvgText(record.certificate_code || "");
    const safeDate = escapeSvgText(formatDate(record.issued_at));
    const safeTitle = escapeSvgText(title);
    const safeSubtitle = escapeSvgText(subtitle);
    const verificationUrl = buildVerificationUrl(record.verification_slug || record.certificate_code);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" direction="rtl">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".5" stop-color="#fbf9ff"/>
      <stop offset="1" stop-color="#f3efff"/>
    </linearGradient>
    <radialGradient id="violetGlow" cx="50%" cy="12%" r="72%">
      <stop offset="0" stop-color="#ddd6fe" stop-opacity=".72"/>
      <stop offset="1" stop-color="#ddd6fe" stop-opacity="0"/>
    </radialGradient>
    <pattern id="softPattern" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M0 34 L34 0 M-9 9 L9 -9 M25 43 L43 25" stroke="#d8cff8" stroke-opacity=".18" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="1000" fill="#5f4ec4"/>
  <rect x="22" y="22" width="1556" height="956" rx="28" fill="url(#paper)"/>
  <rect x="22" y="22" width="1556" height="956" rx="28" fill="url(#violetGlow)"/>
  <rect x="40" y="40" width="1520" height="920" rx="20" fill="url(#softPattern)" opacity=".7"/>
  <rect x="44" y="44" width="1512" height="912" rx="22" fill="none" stroke="#6d5bd0" stroke-width="3"/>
  <rect x="62" y="62" width="1476" height="876" rx="18" fill="none" stroke="#d8b56d" stroke-width="2" stroke-opacity=".75"/>
  <path d="M62 190 C128 184 116 106 194 62 L62 62 Z M1538 190 C1472 184 1484 106 1406 62 L1538 62 Z M62 810 C128 816 116 894 194 938 L62 938 Z M1538 810 C1472 816 1484 894 1406 938 L1538 938 Z" fill="#ede9ff" stroke="#c7b6ef" stroke-width="2"/>
  <path d="M91 168 C138 150 145 104 199 83 M1509 168 C1462 150 1455 104 1401 83 M91 832 C138 850 145 896 199 917 M1509 832 C1462 850 1455 896 1401 917" fill="none" stroke="#d8b56d" stroke-width="2" stroke-opacity=".75"/>
  <text x="800" y="125" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="54" font-weight="900" fill="#6d5bd0">منسقة</text>
  <text x="800" y="160" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="22" font-weight="800" fill="#6d5bd0">Munsaqah</text>
  <text x="800" y="220" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="25" font-weight="800" fill="#1f1b4d">منسقة للتطوير التنظيمي</text>
  <rect x="650" y="250" width="300" height="48" rx="24" fill="#efe9fb" stroke="#c4b5fd" stroke-width="2"/>
  <text x="800" y="281" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="22" font-weight="900" fill="#6d5bd0">الشهر ${record.month_number}</text>
  <text x="800" y="365" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="58" font-weight="900" fill="#2c236c">${safeTitle}</text>
  <text x="800" y="420" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="30" font-weight="900" fill="#6d5bd0">${safeSubtitle}</text>
  <rect x="310" y="455" width="980" height="92" rx="28" fill="#ffffff" stroke="#d8b56d" stroke-width="2"/>
  <rect x="330" y="469" width="940" height="64" rx="20" fill="none" stroke="#c4b5fd" stroke-width="2"/>
  <text x="800" y="514" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="44" font-weight="900" fill="#2c236c">${safeName}</text>
  <text x="800" y="615" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="800" fill="#1f1b4d">أكمل محطة شهرية موثقة ضمن رحلة منسقة، بخطوات تعليمية وتطبيقية</text>
  <text x="800" y="654" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="24" font-weight="800" fill="#1f1b4d">تبني فهمًا أعمق للمنظمة وأثرًا أوضح في الممارسة.</text>
  <circle cx="800" cy="770" r="72" fill="#5f4ec4" stroke="#d8b56d" stroke-width="8"/>
  <text x="800" y="789" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="48" font-weight="900" fill="#ffffff">م</text>
  <text x="460" y="850" text-anchor="end" font-family="Arial, Tahoma, sans-serif" font-size="21" font-weight="800" fill="#1f1b4d">رقم الشهادة: ${safeCode}</text>
  <text x="1140" y="850" text-anchor="start" font-family="Arial, Tahoma, sans-serif" font-size="21" font-weight="800" fill="#1f1b4d">تاريخ الإصدار: ${safeDate}</text>
  <rect x="230" y="900" width="1140" height="40" rx="20" fill="#ffffff" stroke="#c4b5fd" stroke-width="2"/>
  <text x="800" y="926" text-anchor="middle" font-family="Arial, Tahoma, sans-serif" font-size="17" font-weight="700" fill="#6d5bd0">للتحقق من صحة الشهادة: ${escapeSvgText(verificationUrl)}</text>
</svg>`;

    try {
      await downloadSvgAsJpeg(svg, `munsaqah-month-${record.month_number}-${record.certificate_code || "certificate"}.jpg`);
    } catch (error) {
      alert(error?.message || "تعذر تحميل الشهادة بصيغة JPEG.");
    }
  }

  const displayRecords = records.length
    ? records
    : MONTHLY_MILESTONES.map((milestone) => ({
        certificate_type: "monthly",
        month_number: milestone.monthNumber,
        month_title: milestone.title,
        month_subtitle: milestone.subtitle,
        required_days: milestone.requiredDays,
        completed_days: safeCompletedDays,
        total_days: totalDays,
        status: safeCompletedDays >= milestone.requiredDays ? "issued" : "locked",
        verification_enabled: false
      }));

  return (
    <section className="monthly-certificates mastery-no-print" aria-label="شهادات الإنجاز الشهرية">
      <style>{`
        .monthly-certificates {
          margin-top: 24px;
          border-radius: 32px;
          padding: 24px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,252,.94));
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .monthly-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .monthly-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          background: #efe9fb;
          color: #6d28d9;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .monthly-head h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.35;
          font-weight: 950;
        }

        .monthly-head p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.9;
          font-size: 14px;
          font-weight: 760;
        }

        .monthly-status {
          min-width: 150px;
          border-radius: 24px;
          padding: 16px;
          text-align: center;
          background: #18102e;
          color: #fff;
          box-shadow: 0 18px 38px rgba(28, 17, 48,.14);
        }

        .monthly-status strong {
          display: block;
          color: #a7f3d0;
          font-size: 34px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .monthly-status span {
          display: block;
          color: #c9bdf0;
          font-size: 12px;
          font-weight: 850;
        }

        .monthly-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .monthly-card {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 16px 38px rgba(28, 17, 48,.06);
        }

        .monthly-card.issued {
          border-color: rgba(16,185,129,.28);
          background:
            radial-gradient(circle at top left, rgba(16,185,129,.12), transparent 35%),
            #ffffff;
        }

        .monthly-card.locked {
          background: #f4f0fb;
        }

        .monthly-card-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .monthly-badge {
          min-width: 58px;
          height: 48px;
          padding: 0 12px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(139, 92, 246,.18);
        }

        .monthly-lock {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 950;
          background: #efe9fb;
          color: #5b4f78;
          border: 1px solid rgba(167, 139, 250,.25);
        }

        .monthly-card.issued .monthly-lock {
          background: #ecfdf5;
          color: #065f46;
          border-color: rgba(16,185,129,.24);
        }

        .monthly-card h3 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.55;
          font-weight: 950;
        }

        .monthly-card p {
          margin: 0 0 12px;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .monthly-mini {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .monthly-mini div {
          border-radius: 16px;
          padding: 11px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.14);
        }

        .monthly-mini span {
          display: block;
          color: #7a6c9a;
          font-size: 10px;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .monthly-mini strong {
          display: block;
          color: #18102e;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 950;
          word-break: break-word;
        }

        .monthly-progress {
          height: 10px;
          border-radius: 999px;
          background: #e0d8f5;
          overflow: hidden;
          margin-top: 12px;
        }

        .monthly-progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6, #10b981);
        }

        .monthly-certificate-preview {
          margin-top: 14px;
          border-radius: 24px;
          padding: 22px 18px;
          color: #18102e;
          background:
            radial-gradient(circle at 50% 0%, rgba(196,181,253,.38), transparent 40%),
            linear-gradient(135deg, #ffffff, #fbf9ff);
          border: 2px solid rgba(216, 181, 109, .44);
          box-shadow: inset 0 0 0 1px rgba(109,91,208,.16);
          text-align: center;
        }

        .monthly-certificate-preview span {
          display: block;
          color: #6d5bd0;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0;
          text-transform: none;
          margin-bottom: 8px;
        }

        .monthly-certificate-preview h4 {
          margin: 0 0 8px;
          color: #2c236c;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 950;
        }

        .monthly-certificate-preview p {
          margin: 0;
          color: #1f1b4d;
          font-size: 12px;
          line-height: 1.8;
        }

        .monthly-certificate-code {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(109, 91, 208, .20);
          color: #3b2f76;
          font-size: 11px;
          font-weight: 900;
          word-break: break-word;
        }

        .monthly-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
          justify-content: center;
          direction: rtl;
        }

        .monthly-button {
          border: none;
          cursor: pointer;
          border-radius: 16px;
          padding: 11px 13px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          color: #fff;
          background: linear-gradient(135deg,#8b5cf6,#3b1d6e);
          min-width: 118px;
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .monthly-button.linkedin {
          background: linear-gradient(135deg, #0a66c2, #084c8f);
          color: #fff;
          min-width: 184px;
        }

        .monthly-linkedin-icon {
          width: 22px;
          height: 22px;
          margin-inline-end: 6px;
          border-radius: 6px;
          display: inline-grid;
          place-items: center;
          background: #fff;
          color: #0077b5;
          font-family: Arial, sans-serif;
          font-size: 13px;
          font-weight: 950;
          line-height: 1;
        }

        .monthly-button.ghost {
          background: #efe9fb;
          color: #18102e;
          border: 1px solid rgba(167, 139, 250,.22);
        }

        .monthly-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .monthly-warning {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px 16px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          font-weight: 850;
          line-height: 1.8;
        }

        body.od-theme-dark .monthly-certificates {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .18), transparent 34%),
            linear-gradient(145deg, rgba(24, 16, 46, .96), rgba(17, 9, 35, .96));
          border-color: rgba(196, 181, 253, .24);
          box-shadow: 0 18px 55px rgba(0, 0, 0, .28);
        }

        body.od-theme-dark .monthly-kicker,
        body.od-theme-dark .monthly-button.ghost {
          color: #f8f4ff;
          background: rgba(255, 255, 255, .08);
          border: 1px solid rgba(196, 181, 253, .22);
        }

        body.od-theme-dark .monthly-head h2,
        body.od-theme-dark .monthly-card h3,
        body.od-theme-dark .monthly-mini strong,
        body.od-theme-dark .monthly-certificate-preview h4,
        body.od-theme-dark .monthly-certificate-code {
          color: #f8f4ff;
        }

        body.od-theme-dark .monthly-head p,
        body.od-theme-dark .monthly-card p,
        body.od-theme-dark .monthly-mini span,
        body.od-theme-dark .monthly-certificate-preview p {
          color: #c9bdf0;
        }

        body.od-theme-dark .monthly-status {
          background: rgba(255, 255, 255, .08);
          border: 1px solid rgba(196, 181, 253, .20);
        }

        body.od-theme-dark .monthly-card {
          background: rgba(255, 255, 255, .07);
          border-color: rgba(196, 181, 253, .18);
          box-shadow: 0 16px 38px rgba(0, 0, 0, .18);
        }

        body.od-theme-dark .monthly-card.issued {
          background:
            radial-gradient(circle at top left, rgba(16,185,129,.16), transparent 35%),
            rgba(255, 255, 255, .07);
          border-color: rgba(16,185,129,.30);
        }

        body.od-theme-dark .monthly-card.locked {
          background: rgba(255, 255, 255, .05);
        }

        body.od-theme-dark .monthly-lock,
        body.od-theme-dark .monthly-mini div {
          color: #d8b4fe;
          background: rgba(139, 92, 246, .14);
          border-color: rgba(196, 181, 253, .18);
        }

        body.od-theme-dark .monthly-card.issued .monthly-lock {
          color: #a7f3d0;
          background: rgba(16,185,129,.14);
          border-color: rgba(16,185,129,.28);
        }

        body.od-theme-dark .monthly-progress {
          background: rgba(255, 255, 255, .10);
        }

        body.od-theme-dark .monthly-certificate-preview {
          color: #f8f4ff;
          background:
            radial-gradient(circle at 0% 0%, rgba(16,185,129,.18), transparent 36%),
            radial-gradient(circle at 100% 100%, rgba(139,92,246,.22), transparent 36%),
            linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
          border-color: rgba(196, 181, 253, .24);
        }

        body.od-theme-dark .monthly-certificate-preview span {
          color: #d8b4fe;
        }

        body.od-theme-dark .monthly-certificate-code {
          border-top-color: rgba(196, 181, 253, .18);
        }

        @media (max-width: 980px) {
          .monthly-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .monthly-head,
          .monthly-grid {
            grid-template-columns: 1fr;
          }

          .monthly-status {
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>

      <div className="monthly-head">
        <div>
          <span className="monthly-kicker">المرحلة الثانية والعشرون · محطات الإنجاز الشهرية</span>
          <h2>شهادات إنجاز شهرية قبل وثيقة الإتقان النهائية</h2>
          <p>
            بدل انتظار نهاية الرحلة كاملة، يحصل المتدرب على شهادة إنجاز موثقة
            عند إكمال كل شهر تعليمي من 4 أسابيع. هذه الشهادات مرتبطة بتقدمه الفعلي داخل
            المنصة وتظهر تدريجيًا مع الإنجاز.
          </p>

          <div className="monthly-actions">
            <button
              type="button"
              className="monthly-button"
              onClick={syncMonthlyCertificates}
              disabled={loading}
            >
              {loading ? "جارٍ مزامنة الشهادات..." : "تحديث شهاداتي الشهرية"}
            </button>
          </div>
        </div>

        <div className="monthly-status">
          <strong>{unlockedCount}/6</strong>
          <span>شهادات شهرية مفتوحة</span>
        </div>
      </div>

      {error ? <div className="monthly-warning">{error}</div> : null}

      <div className="monthly-grid">
        {displayRecords.map((record) => {
          const requiredDays = safeNumber(record.required_days, 28);
          const percent = Math.min(100, Math.round((safeCompletedDays / requiredDays) * 100));
          const issued = record.status === "issued";
          const canVerify = issued && record.verification_enabled;
          const copied =
            copiedSlug &&
            copiedSlug === (record.verification_slug || record.certificate_code);

          return (
            <article
              className={`monthly-card ${issued ? "issued" : "locked"}`}
              key={record.month_number}
            >
              <div className="monthly-card-top">
                <div className="monthly-badge">شهر {record.month_number}</div>
                <span className="monthly-lock">{issued ? "مفتوحة" : "مقفلة"}</span>
              </div>

              <h3>{record.month_title}</h3>
              <p>{record.month_subtitle}</p>

              <div className="monthly-progress" aria-label={`تقدم الشهر ${record.month_number}`}>
                <i style={{ width: `${percent}%` }} />
              </div>

              <div className="monthly-mini">
                <div>
                  <span>شرط الفتح</span>
                  <strong>{Math.min(safeCompletedDays, requiredDays)} / {requiredDays} يومًا</strong>
                </div>

                <div>
                  <span>تاريخ الإصدار</span>
                  <strong>{issued ? formatDate(record.issued_at) : "بعد إكمال الشرط"}</strong>
                </div>

                <div>
                  <span>رقم الشهادة</span>
                  <strong>{issued ? record.certificate_code : "يظهر بعد الفتح"}</strong>
                </div>
              </div>

              {issued ? (
                <>
                  <div
                    className="monthly-certificate-preview"
                    id={`monthly-certificate-${record.month_number}`}
                  >
                    <span>شهادة إنجاز شهرية</span>
                    <h4>{record.month_title}</h4>
                    <p>
                      تُمنح هذه الشهادة إلى {userName || "المتدرب"} تقديرًا لإكمال محطة شهرية
                      في رحلة منسقة للتطوير التنظيمي؛ محطة جمعت بين الفهم والتطبيق والاختبار
                      وبناء لغة مهنية أعمق لقراءة المنظمات.
                    </p>
                    <div className="monthly-certificate-code">
                      {record.certificate_code}
                    </div>
                  </div>

                  <div className="monthly-actions">
                    <button
                      type="button"
                      className="monthly-button"
                      onClick={() => downloadMonthlyCertificateImage(record)}
                    >
                      تحميل JPEG
                    </button>
                    <button
                      type="button"
                      className="monthly-button ghost"
                      onClick={() => printMonthlyCertificate(record)}
                    >
                      حفظ PDF
                    </button>
                    <button
                      type="button"
                      className="monthly-button linkedin"
                      onClick={() => shareMonthlyOnLinkedIn(record)}
                    >
                      <span className="monthly-linkedin-icon" aria-hidden="true">in</span>
                      مشاركة عبر LinkedIn
                    </button>
                  </div>
                </>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
