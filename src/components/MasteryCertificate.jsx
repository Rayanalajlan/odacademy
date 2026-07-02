import { useEffect, useMemo, useState } from "react";
import { COURSE_TOTALS } from "../data/courseContent";
import MonthlyCertificates from "./MonthlyCertificates";
import {
  buildVerificationUrl,
  copyTextSafely,
  getOrCreateMasteryCertificate
} from "../lib/masteryCertificateService";

function clampNumber(value, min, max) {
  const numeric = Number(value || 0);
  if (Number.isNaN(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

function buildCertificateId(userName, completedDays) {
  const cleanName = String(userName || "OD")
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g, "")
    .slice(0, 18);

  const stamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  return `OD-${stamp}-${cleanName || "Learner"}-${completedDays}`;
}

export default function MasteryCertificate({
  userName,
  completedDays = 0,
  setActivePage
}) {
  const [copied, setCopied] = useState(false);
  const [verificationCopied, setVerificationCopied] = useState(false);
  const [certificateRecord, setCertificateRecord] = useState(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState("");

  const totalDays = COURSE_TOTALS?.totalDays || 168;
  const safeCompletedDays = clampNumber(completedDays, 0, totalDays);
  const progress = Math.round((safeCompletedDays / totalDays) * 100);
  const remainingDays = Math.max(0, totalDays - safeCompletedDays);
  const hours = safeCompletedDays * 4;
  const totalHours = totalDays * 4;
  const isUnlocked = safeCompletedDays >= totalDays;

  const learnerName = userName?.trim() || "متدرب";
  const fallbackCertificateId = buildCertificateId(learnerName, safeCompletedDays);
  const certificateCode = certificateRecord?.certificate_code || fallbackCertificateId;
  const verificationSlug =
    certificateRecord?.verification_slug ||
    certificateCode.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-").replace(/^-+|-+$/g, "");
  const verificationUrl = buildVerificationUrl(verificationSlug);
  const verificationEnabled = Boolean(
    certificateRecord?.verification_enabled &&
    certificateRecord?.status === "issued"
  );
  const certificateStatus =
    certificateRecord?.status || (isUnlocked ? "issued" : "locked");

  const completionDate = useMemo(() => {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date());
  }, []);

  useEffect(() => {
    let active = true;

    async function syncCertificate() {
      setCertificateLoading(true);
      setCertificateError("");

      try {
        const record = await getOrCreateMasteryCertificate({
          userName: learnerName,
          completedDays: safeCompletedDays,
          totalDays,
          isUnlocked
        });

        if (active) setCertificateRecord(record);
      } catch (error) {
        console.warn("تعذر مزامنة وثيقة الإتقان:", error);
        if (active) setCertificateError(error?.message || "تعذر مزامنة بيانات الوثيقة.");
      } finally {
        if (active) setCertificateLoading(false);
      }
    }

    syncCertificate();

    return () => {
      active = false;
    };
  }, [learnerName, safeCompletedDays, totalDays, isUnlocked]);


  const linkedInPost = useMemo(() => {
    return `الحمد لله، أنهيت رحلة منسقة الكاملة في التطوير التنظيمي خلال ستة أشهر تعليمية (${totalDays} يومًا).

كانت رحلة ثرية، مو بس محتوى واختبارات، بل تدريب يومي على التفكير المنظومي: كيف نفهم السياق، نشخص السبب الحقيقي، ونصمم تدخل يحترم الناس والعمل والنتيجة.

أكثر شيء طلع معي من التجربة: الحل الجيد يبدأ بسؤال جيد، والأثر الحقيقي يحتاج صبر وقياس وتعلّم مستمر.

فخور بهذا الإنجاز، وممتن لكل محطة صنعت فرقًا في طريقة قراءتي للمنظمات.

شهادة الإتمام: ${verificationUrl}

#التطوير_التنظيمي
#OD
#التعلم_المستمر
#قيادة_التغيير
#منسقة`;
  }, [totalDays, verificationUrl]);

  async function copyLinkedInPost() {
    try {
      await navigator.clipboard.writeText(linkedInPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      alert("لم يتم النسخ تلقائيًا. انسخ النص يدويًا من مربع المشاركة.");
    }
  }

  async function copyVerificationLink() {
    const ok = await copyTextSafely(verificationUrl);

    if (ok) {
      setVerificationCopied(true);
      setTimeout(() => setVerificationCopied(false), 2500);
    } else {
      alert("لم يتم نسخ رابط التحقق تلقائيًا. انسخه يدويًا من البطاقة.");
    }
  }


  function shareOnLinkedIn() {
    copyLinkedInPost();

    const profileUrl = "https://www.linkedin.com/in/rayan-alajlan";
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;

    window.open(shareUrl, "_blank", "width=760,height=680");
  }

  function printCertificate() {
    if (!isUnlocked) return;

    const style = document.createElement("style");
    style.id = "mastery-print-style";
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
        }

        #printable-certificate-frame,
        #printable-certificate-frame * {
          visibility: visible !important;
        }

        #printable-certificate-frame {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 24px !important;
          box-shadow: none !important;
          border: none !important;
          background: #0e0820 !important;
          color: #fff !important;
        }

        .mastery-no-print {
          display: none !important;
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }
      }
    `;

    document.head.appendChild(style);
    window.print();

    setTimeout(() => {
      const helper = document.getElementById("mastery-print-style");
      if (helper) helper.remove();
    }, 1000);
  }

  return (
    <section className="mastery-page" dir="rtl">
      <style>{`
        .mastery-page {
          min-height: 100vh;
          padding: 40px 18px 70px;
          background:
            radial-gradient(circle at 20% 10%, rgba(139, 92, 246, 0.18), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.16), transparent 26%),
            linear-gradient(180deg, #f4f0fb 0%, #efe9fb 48%, #f4f0fb 100%);
          color: #18102e;
          font-family: inherit;
        }

        .mastery-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .mastery-hero {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 34px;
          background:
            linear-gradient(135deg, rgba(28, 17, 48, 0.97), rgba(30, 41, 59, 0.94)),
            radial-gradient(circle at top left, rgba(139, 92, 246, 0.45), transparent 35%);
          color: white;
          box-shadow: 0 24px 70px rgba(28, 17, 48, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mastery-hero::before {
          content: "";
          position: absolute;
          inset: -40%;
          background:
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: rotate(18deg);
          animation: masteryShine 8s linear infinite;
        }

        @keyframes masteryShine {
          0% { transform: translateX(70%) rotate(18deg); }
          100% { transform: translateX(-70%) rotate(18deg); }
        }

        .mastery-hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 26px;
          align-items: center;
        }

        .mastery-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c3b5e8;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .mastery-hero h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 56px);
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .mastery-hero h1 span {
          color: #fbbf24;
        }

        .mastery-hero p {
          margin: 18px 0 0;
          max-width: 760px;
          color: #c9bdf0;
          line-height: 2;
          font-size: 16px;
        }

        .mastery-progress-orb {
          width: 230px;
          height: 230px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          margin-inline: auto;
          background:
            conic-gradient(#a855f7 ${progress * 3.6}deg, rgba(255,255,255,0.12) 0deg);
          box-shadow: inset 0 0 0 14px rgba(28, 17, 48, 0.45), 0 22px 50px rgba(0,0,0,0.22);
        }

        .mastery-progress-inner {
          width: 166px;
          height: 166px;
          border-radius: 50%;
          background: #18102e;
          display: grid;
          place-items: center;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .mastery-progress-inner strong {
          font-size: 42px;
          color: #fff;
          line-height: 1;
        }

        .mastery-progress-inner span {
          color: #9d8fc0;
          font-weight: 800;
          font-size: 13px;
          margin-top: 8px;
        }

        .mastery-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0 24px;
        }

        .mastery-stat {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(167, 139, 250, 0.22);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 18px 45px rgba(28, 17, 48, 0.08);
        }

        .mastery-stat span {
          display: block;
          color: #7a6c9a;
          font-weight: 800;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .mastery-stat strong {
          display: block;
          color: #18102e;
          font-size: 24px;
          font-weight: 950;
        }

        .mastery-lock {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 28px;
          background: white;
          border: 1px solid rgba(167, 139, 250, 0.24);
          box-shadow: 0 18px 60px rgba(28, 17, 48, 0.08);
          margin-top: 22px;
        }

        .mastery-lock-grid {
          display: grid;
          grid-template-columns: 90px 1fr auto;
          gap: 20px;
          align-items: center;
        }

        .mastery-lock-icon {
          width: 84px;
          height: 84px;
          border-radius: 26px;
          display: grid;
          place-items: center;
          font-size: 34px;
          background: linear-gradient(135deg, #efe9fb, #fff7ed);
          border: 1px solid #e0d8f5;
        }

        .mastery-lock h2 {
          margin: 0 0 8px;
          font-size: 24px;
          color: #18102e;
        }

        .mastery-lock p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.9;
        }

        .mastery-track {
          margin-top: 20px;
          height: 14px;
          border-radius: 999px;
          background: #e0d8f5;
          overflow: hidden;
        }

        .mastery-track span {
          display: block;
          height: 100%;
          width: ${progress}%;
          border-radius: 999px;
          background: linear-gradient(90deg, #8b5cf6, #a855f7);
        }

        .mastery-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 22px;
        }

        .mastery-button {
          border: none;
          cursor: pointer;
          border-radius: 18px;
          padding: 14px 20px;
          font-weight: 950;
          font-size: 14px;
          transition: 0.25s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .mastery-button:hover {
          transform: translateY(-2px);
        }

        .mastery-button.primary {
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          color: white;
          box-shadow: 0 16px 34px rgba(139, 92, 246,0.28);
        }

        .mastery-button.dark {
          background: #18102e;
          color: white;
          box-shadow: 0 16px 34px rgba(28, 17, 48,0.18);
        }

        .mastery-button.linkedin {
          background: #0077b5;
          color: white;
          box-shadow: 0 16px 34px rgba(0,119,181,0.20);
        }

        .mastery-button.ghost {
          background: #efe9fb;
          color: #18102e;
        }

        .certificate-stage {
          margin-top: 26px;
          display: ${isUnlocked ? "block" : "none"};
        }

        .certificate-frame {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 18px;
          background:
            linear-gradient(135deg, #a855f7, #8b5cf6, #18102e);
          box-shadow: 0 30px 85px rgba(28, 17, 48, 0.22);
        }

        .certificate-inner {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          min-height: 520px;
          padding: 44px;
          background:
            radial-gradient(circle at 20% 15%, rgba(245, 158, 11, 0.18), transparent 25%),
            radial-gradient(circle at 80% 10%, rgba(139, 92, 246, 0.24), transparent 28%),
            linear-gradient(145deg, #0e0820, #18102e 45%, #111827);
          color: white;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .certificate-inner::before {
          content: "OD";
          position: absolute;
          left: 30px;
          top: 20px;
          font-size: 220px;
          line-height: 1;
          font-weight: 950;
          color: rgba(255,255,255,0.025);
          letter-spacing: -14px;
        }

        .certificate-top {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding-bottom: 24px;
          margin-bottom: 34px;
        }

        .certificate-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          font-weight: 950;
          box-shadow: 0 16px 36px rgba(0,0,0,0.25);
        }

        .certificate-brand strong {
          display: block;
          font-size: 16px;
          letter-spacing: 0.5px;
        }

        .certificate-brand span,
        .certificate-code span {
          display: block;
          margin-top: 4px;
          color: #9d8fc0;
          font-size: 11px;
          font-weight: 800;
        }

        .certificate-code {
          text-align: left;
          color: #e0d8f5;
          font-size: 12px;
          font-weight: 900;
        }

        .certificate-title {
          position: relative;
          text-align: center;
          max-width: 850px;
          margin: 0 auto;
        }

        .certificate-title .badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.28);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1px;
          margin-bottom: 18px;
        }

        .certificate-title h2 {
          margin: 0;
          font-size: clamp(28px, 5vw, 56px);
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .certificate-title .learner {
          margin: 24px auto 18px;
          display: inline-block;
          padding: 10px 28px;
          border-radius: 22px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-size: clamp(24px, 4vw, 42px);
          font-weight: 950;
        }

        .certificate-title p {
          margin: 0 auto;
          max-width: 820px;
          color: #c9bdf0;
          font-size: 15px;
          line-height: 2.05;
          font-weight: 700;
        }

        .certificate-pillars {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 34px 0;
        }

        .certificate-pillar {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          text-align: center;
        }

        .certificate-pillar strong {
          display: block;
          color: #fbbf24;
          font-size: 18px;
          margin-bottom: 5px;
        }

        .certificate-pillar span {
          color: #9d8fc0;
          font-weight: 800;
          font-size: 11px;
        }

        .certificate-footer {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: end;
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 24px;
        }

        .certificate-footer strong {
          display: block;
          color: #e0d8f5;
          margin-bottom: 8px;
        }

        .certificate-footer span,
        .certificate-footer small {
          color: #9d8fc0;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 800;
        }

        .signature {
          text-align: left;
        }

        .signature .name {
          color: #fbbf24;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0.6px;
        }

        .linkedin-panel {
          margin-top: 24px;
          border-radius: 30px;
          padding: 22px;
          background: white;
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .linkedin-panel h3 {
          margin: 0 0 10px;
          color: #18102e;
          font-size: 20px;
        }

        .linkedin-panel p {
          margin: 0 0 14px;
          color: #7a6c9a;
          line-height: 1.8;
        }

        .linkedin-textarea {
          width: 100%;
          min-height: 210px;
          resize: vertical;
          border: 1px solid #c9bdf0;
          border-radius: 22px;
          padding: 18px;
          line-height: 1.9;
          font-family: inherit;
          font-weight: 700;
          color: #18102e;
          background: #f4f0fb;
          outline: none;
        }

        .linkedin-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,0.08);
        }

        .certificate-verification-panel {
          margin: 22px 0;
          border-radius: 30px;
          padding: 22px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 35%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .certificate-verification-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 14px;
          align-items: stretch;
        }

        .certificate-verification-card {
          border-radius: 22px;
          padding: 16px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .certificate-verification-card span {
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 850;
          margin-bottom: 7px;
        }

        .certificate-verification-card strong {
          display: block;
          color: #18102e;
          font-size: 15px;
          line-height: 1.8;
          font-weight: 950;
          word-break: break-word;
        }

        .certificate-verification-card small {
          display: block;
          margin-top: 8px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 760;
        }

        .certificate-verification-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .verify-state {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
        }

        .verify-state.enabled {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid rgba(16,185,129,.25);
        }

        .verify-state.locked {
          background: #efe9fb;
          color: #5b4f78;
          border: 1px solid rgba(167, 139, 250,.25);
        }

        .certificate-verify-line {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.12);
          color: #c9bdf0;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 800;
          word-break: break-word;
        }

        .certificate-verify-line strong {
          color: #fbbf24;
          display: inline;
          margin: 0;
        }

        @media (max-width: 850px) {
          .mastery-hero-content,
          .mastery-lock-grid,
          .certificate-footer,
          .certificate-verification-grid {
            grid-template-columns: 1fr;
          }

          .mastery-progress-orb {
            width: 190px;
            height: 190px;
          }

          .mastery-progress-inner {
            width: 134px;
            height: 134px;
          }

          .mastery-stats,
          .certificate-pillars {
            grid-template-columns: repeat(2, 1fr);
          }

          .certificate-inner {
            padding: 28px 18px;
          }

          .certificate-top {
            flex-direction: column;
          }

          .signature,
          .certificate-code {
            text-align: right;
          }
        }

        @media (max-width: 520px) {
          .mastery-stats,
          .certificate-pillars {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="mastery-shell">
        <div className="mastery-hero mastery-no-print">
          <div className="mastery-hero-content">
            <div>
              <span className="mastery-eyebrow">📜 وثيقة الإتقان</span>
              <h1>
                لا تُمنح الوثيقة عند الدخول،
                <br />
                بل عند اكتمال <span>الرحلة كاملة</span>.
              </h1>
              <p>
                هذه الوثيقة ليست شهادة حضور؛ إنها سجل إتمام لمسار معرفي تطبيقي
                يمتد عبر ستة أشهر في هندسة التطوير التنظيمي، ولا تظهر إلا بعد
                اكتمال جميع أيام الرحلة التعليمية.
              </p>
            </div>

            <div
              className="mastery-progress-orb od-circular-indicator od-indicator-completion"
              style={{ "--od-indicator-progress": `${progress}%` }}
              aria-label="نسبة إتمام الرحلة"
            >
              <div className="mastery-progress-inner">
                <div>
                  <strong>{progress}%</strong>
                  <span>إتمام الرحلة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mastery-stats mastery-no-print">
          <div className="mastery-stat">
            <span>الأيام المكتملة</span>
            <strong>{safeCompletedDays} / {totalDays}</strong>
          </div>
          <div className="mastery-stat">
            <span>الساعات المحتسبة</span>
            <strong>{hours} / {totalHours}</strong>
          </div>
          <div className="mastery-stat">
            <span>الأيام المتبقية</span>
            <strong>{remainingDays}</strong>
          </div>
          <div className="mastery-stat">
            <span>حالة الوثيقة</span>
            <strong>{isUnlocked ? "مفتوحة" : "مقفلة"}</strong>
          </div>
        </div>

        {/* Phase 22: شهادات الإنجاز الشهرية قبل وثيقة الإتقان النهائية */}
        <MonthlyCertificates
          userName={learnerName}
          completedDays={safeCompletedDays}
          totalDays={totalDays}
        />

        <section className="certificate-verification-panel mastery-no-print" aria-label="بيانات التحقق من الوثيقة">
          <div className="certificate-verification-grid">
            <div className="certificate-verification-card">
              <span>رقم الوثيقة</span>
              <strong>{certificateCode}</strong>
              <small>
                {certificateLoading
                  ? "جارٍ مزامنة رقم الوثيقة مع قاعدة البيانات..."
                  : certificateError || "يرتبط هذا الرقم بإنجازك الفعلي داخل الرحلة."}
              </small>
            </div>

            <div className="certificate-verification-card">
              <span>حالة التحقق العام</span>
              <strong>
                <i className={`verify-state ${verificationEnabled ? "enabled" : "locked"}`}>
                  {verificationEnabled ? "مفعّل بعد الإكمال" : "غير مفعّل قبل الإكمال"}
                </i>
              </strong>
              <small>
                {isUnlocked
                  ? "يمكن مشاركة رابط التحقق بعد صدور الوثيقة."
                  : "سيظهر رابط التحقق بعد إكمال جميع أيام الرحلة."}
              </small>

              {isUnlocked && (
                <div className="certificate-verification-actions">
                  <button type="button" className="mastery-button ghost" onClick={copyVerificationLink}>
                    {verificationCopied ? "تم نسخ رابط التحقق ✅" : "نسخ رابط التحقق"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {!isUnlocked && (
          <div className="mastery-lock mastery-no-print">
            <div className="mastery-lock-grid">
              <div className="mastery-lock-icon">🔒</div>

              <div>
                <h2>وثيقة الإتقان لم تُفتح بعد</h2>
                <p>
                  أكمل جميع أيام الرحلة التعليمية أولًا. بقي أمامك{" "}
                  <strong>{remainingDays}</strong> يومًا حتى تُفتح الوثيقة
                  تلقائيًا. هذا الإقفال مقصود حتى تبقى الوثيقة مرتبطة بالإنجاز
                  الفعلي لا بمجرد دخول الصفحة.
                </p>
              </div>

              <button
                className="mastery-button primary"
                onClick={() => setActivePage?.("journey")}
              >
                العودة إلى رحلتك التعليمية 🧭
              </button>
            </div>

            <div className="mastery-track">
              <span />
            </div>
          </div>
        )}

        {isUnlocked && (
          <>
            <div className="certificate-stage">
              <div id="printable-certificate-frame" className="certificate-frame">
                <div className="certificate-inner">
                  <div className="certificate-top">
                    <div className="certificate-brand">
                      <div className="brand-mark">RA</div>
                      <div>
                        <strong>OD Engineering LAB</strong>
                        <span>مختبر التطوير التنظيمي المستقل</span>
                      </div>
                    </div>

                    <div className="certificate-code">
                      <strong>رقم الوثيقة: {certificateCode}</strong>
                      <span>تاريخ الإتمام: {completionDate}</span>
                      <div className="certificate-verify-line">
                        حالة التحقق: <strong>{verificationEnabled ? "مفعّل" : "قيد التفعيل"}</strong>
                        <br />
                        {verificationEnabled ? verificationUrl : "يُفعّل الرابط عند صدور الوثيقة."}
                      </div>
                    </div>
                  </div>

                  <div className="certificate-title">
                    <span className="badge">وثيقة إتقان معرفي وتطبيقي</span>

                    <h2>إتمام رحلة هندسة التطوير التنظيمي</h2>

                    <div className="learner">{learnerName}</div>

                    <p>
                      تُمنح هذه الوثيقة تقديرًا لإتمام رحلة معرفية تطبيقية
                      امتدت ستة أشهر كاملة، شملت التشخيص التنظيمي، تصميم
                      المنظمة، الأدوار والأوصاف الوظيفية، قيادة التغيير،
                      الثقافة التنظيمية، التعلم المؤسسي، قياس الأثر،
                      واستدامة تدخلات التطوير التنظيمي.
                    </p>
                  </div>

                  <div className="certificate-pillars">
                    <div className="certificate-pillar">
                      <strong>{totalDays}</strong>
                      <span>يومًا تعليميًا</span>
                    </div>
                    <div className="certificate-pillar">
                      <strong>{totalHours}</strong>
                      <span>ساعة تعلم محتسبة</span>
                    </div>
                    <div className="certificate-pillar">
                      <strong>24</strong>
                      <span>أسبوعًا تطبيقيًا</span>
                    </div>
                    <div className="certificate-pillar">
                      <strong>6</strong>
                      <span>أشهر إتقان</span>
                    </div>
                  </div>

                  <div className="certificate-footer">
                    <div>
                      <strong>المرجعيات العلمية للمسار</strong>
                      <span>
                        Cummings & Worley • Donald Anderson • Burke-Litwin •
                        Peter Senge • Hackman & Oldham
                      </span>
                    </div>

                    <div className="signature">
                      <strong>اعتماد معرفي مستقل</strong>
                      <div className="name">Rayan Alajlan</div>
                      <small>SHRM-SCP • SPHRi • CPTD • PMP</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mastery-actions mastery-no-print">
                <button className="mastery-button dark" onClick={printCertificate}>
                  طباعة الوثيقة / حفظ PDF 🖨️
                </button>

                <button className="mastery-button ghost" onClick={copyVerificationLink}>
                  {verificationCopied ? "تم نسخ رابط التحقق ✅" : "نسخ رابط التحقق"}
                </button>

                <button className="mastery-button ghost" onClick={copyLinkedInPost}>
                  {copied ? "تم نسخ نص البوست ✅" : "نسخ نص بوست LinkedIn ✍️"}
                </button>

                <button className="mastery-button linkedin" onClick={shareOnLinkedIn}>
                  فتح LinkedIn للمشاركة 🔗
                </button>
              </div>
            </div>

            <div className="linkedin-panel mastery-no-print">
              <h3>نص مقترح للمشاركة على LinkedIn</h3>
              <p>
                انسخ النص أو استخدم زر المشاركة. عند فتح LinkedIn الصق النص في
                المنشور ثم انشره.
              </p>

              <textarea
                className="linkedin-textarea"
                value={linkedInPost}
                readOnly
                aria-label="نص مقترح لمنشور لينكدإن"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
