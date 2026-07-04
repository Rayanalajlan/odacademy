import { useEffect, useMemo, useState } from "react";
import { COURSE_TOTALS } from "../data/courseContent";
import MonthlyCertificates from "./MonthlyCertificates";
import {
  downloadCertificateJpeg,
  printCertificatePdf
} from "../lib/certificateExportService";
import {
  buildVerificationUrl,
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

function escapeSvgText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
    return `الحمد لله، أنهيت رحلة منسقة للتطوير التنظيمي خلال ستة أشهر تعليمية (${totalDays} يومًا).

كانت رحلة ثرية ومرتبة، مو بس دروس واختبارات؛ كانت تدريبًا يوميًا على عقلية ممارس OD: قراءة السياق قبل الحكم، تشخيص السبب قبل الحل، وتصميم تدخل يحترم الإنسان والنظام والأثر.

أكثر فكرة أخذتها معي: المنظمة لا تتغير بكثرة المبادرات، بل بوضوح السؤال، جودة التشخيص، واتصال التعلم بالفعل اليومي.

فخور بهذا الإنجاز، وممتن لكل محطة خلت قراءتي للمنظمات أعمق وأهدأ وأكثر مسؤولية.

رابط التحقق من الوثيقة: ${verificationUrl}

#التطوير_التنظيمي
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

  function shareOnLinkedIn() {
    copyLinkedInPost();

    const profileUrl = "https://www.linkedin.com/in/rayan-alajlan";
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;

    window.open(shareUrl, "_blank", "width=760,height=680");
  }

  async function downloadCertificateImage() {
    if (!isUnlocked) return;

    try {
      await downloadCertificateJpeg({
        kind: "mastery",
        learnerName,
        certificateCode,
        completionDate,
        verificationUrl,
        filename: `munsaqah-mastery-${certificateCode}.jpg`
      });
    } catch (error) {
      alert(error?.message || "تعذر تحميل الشهادة بصيغة JPEG.");
    }
  }

  async function printCertificate() {
    if (!isUnlocked) return;

    try {
      await printCertificatePdf({
        kind: "mastery",
        learnerName,
        certificateCode,
        completionDate,
        verificationUrl,
        title: "وثيقة إتقان منسقة"
      });
    } catch (error) {
      alert(error?.message || "تعذر تجهيز الشهادة بصيغة PDF.");
    }
  }

  return (
    <section className="mastery-page" dir="rtl">
      <style>{`
        .mastery-page {
          min-height: 100vh;
          padding: 40px 18px 70px;
          background:
            radial-gradient(circle at 20% 10%, rgba(139, 92, 246, 0.18), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.12), transparent 26%),
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
          color: #c4b5fd;
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
          background: linear-gradient(135deg, #efe9fb, #f4f0fb);
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
          direction: rtl;
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
          min-width: 150px;
          min-height: 48px;
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
          background: linear-gradient(135deg, #0a66c2, #084c8f);
          color: white;
          box-shadow: 0 16px 34px rgba(10,102,194,0.22);
        }

        .linkedin-icon {
          width: 24px;
          height: 24px;
          border-radius: 7px;
          display: inline-grid;
          place-items: center;
          background: #ffffff;
          color: #0077b5;
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 950;
          line-height: 1;
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
          padding: 12px;
          background:
            linear-gradient(135deg, #6d5bd0, #efe9fb 46%, #d8b56d);
          box-shadow: 0 30px 85px rgba(28, 17, 48, 0.18);
        }

        .certificate-inner {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          min-height: 520px;
          aspect-ratio: 16 / 9;
          padding: 44px;
          background:
            radial-gradient(circle at 50% 0%, rgba(196, 181, 253, .48), transparent 30%),
            radial-gradient(circle at 6% 12%, rgba(216, 181, 109, .18), transparent 24%),
            radial-gradient(circle at 94% 88%, rgba(109, 91, 208, .14), transparent 25%),
            linear-gradient(135deg, #ffffff, #fbf9ff 52%, #f4f0fb);
          color: #18102e;
          border: 2px solid rgba(216, 181, 109, .45);
        }

        .certificate-inner::before {
          content: "";
          position: absolute;
          inset: 16px;
          border-radius: 20px;
          border: 2px solid rgba(109, 91, 208, .22);
          box-shadow: inset 0 0 0 1px rgba(216, 181, 109, .24);
          pointer-events: none;
        }

        .certificate-top {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          border-bottom: 1px solid rgba(109, 91, 208, .18);
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
          background: linear-gradient(135deg, #6d5bd0, #8b5cf6);
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
          color: #6b5a91;
          font-size: 11px;
          font-weight: 800;
        }

        .certificate-code {
          text-align: left;
          color: #3b2f76;
          font-size: 12px;
          font-weight: 900;
          max-width: 360px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,.72);
          border: 1px solid rgba(109,91,208,.16);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.72);
          word-break: break-word;
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
          background: #efe9fb;
          color: #6d5bd0;
          border: 1px solid rgba(109, 91, 208, .22);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0;
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
          background: #ffffff;
          border: 2px solid rgba(216,181,109,.55);
          color: #18102e;
          text-shadow: none;
          font-size: clamp(24px, 4vw, 42px);
          font-weight: 950;
          box-shadow: 0 18px 44px rgba(109, 91, 208, .12);
        }

        .certificate-title p {
          margin: 0 auto;
          max-width: 820px;
          color: #1f1b4d;
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
          background: #ffffff;
          border: 1px solid rgba(109,91,208,.20);
          text-align: center;
        }

        .certificate-pillar strong {
          display: block;
          color: #6d5bd0;
          font-size: 18px;
          margin-bottom: 5px;
        }

        .certificate-pillar span {
          color: #1f1b4d;
          font-weight: 800;
          font-size: 11px;
        }

        .certificate-footer {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: end;
          border-top: 1px solid rgba(109,91,208,.18);
          padding-top: 24px;
        }

        .certificate-footer strong {
          display: block;
          color: #3b2f76;
          margin-bottom: 8px;
        }

        .certificate-footer span,
        .certificate-footer small {
          color: #5b4f78;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 800;
        }

        .signature {
          text-align: left;
        }

        .signature .name {
          color: #6d5bd0;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0;
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
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.13), transparent 35%),
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,252,.94));
          border: 1px solid rgba(167, 139, 250, 0.24);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.09);
        }

        .certificate-verification-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 14px;
          align-items: stretch;
        }

        .certificate-verification-card {
          border-radius: 22px;
          padding: 18px;
          background:
            linear-gradient(135deg, rgba(255,255,255,.92), rgba(239,233,251,.86));
          border: 1px solid rgba(167, 139, 250,.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.62);
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
          font-size: 14px;
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
          border-top: 1px solid rgba(109,91,208,.14);
          color: #5b4f78;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 800;
          word-break: break-word;
        }

        .certificate-verify-line strong {
          color: #047857;
          display: inline;
          margin: 0;
        }

        body.od-theme-dark .mastery-page {
          background:
            radial-gradient(circle at 20% 10%, rgba(139, 92, 246, 0.16), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.10), transparent 26%),
            linear-gradient(180deg, #0e0820 0%, #18102e 52%, #0e0820 100%);
          color: #f8f4ff;
        }

        body.od-theme-dark .mastery-stat,
        body.od-theme-dark .mastery-lock,
        body.od-theme-dark .linkedin-panel,
        body.od-theme-dark .certificate-verification-panel {
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .14), transparent 34%),
            linear-gradient(145deg, rgba(24, 16, 46, .96), rgba(17, 9, 35, .96));
          border-color: rgba(196, 181, 253, .24);
          box-shadow: 0 18px 55px rgba(0, 0, 0, .28);
        }

        body.od-theme-dark .mastery-stat strong,
        body.od-theme-dark .mastery-lock h2,
        body.od-theme-dark .linkedin-panel h3,
        body.od-theme-dark .certificate-verification-card strong {
          color: #f8f4ff;
        }

        body.od-theme-dark .mastery-stat span,
        body.od-theme-dark .mastery-lock p,
        body.od-theme-dark .linkedin-panel p,
        body.od-theme-dark .certificate-verification-card span,
        body.od-theme-dark .certificate-verification-card small {
          color: #c9bdf0;
        }

        body.od-theme-dark .mastery-lock-icon,
        body.od-theme-dark .certificate-verification-card,
        body.od-theme-dark .linkedin-textarea {
          color: #f8f4ff;
          background: rgba(255, 255, 255, .07);
          border-color: rgba(196, 181, 253, .20);
        }

        body.od-theme-dark .linkedin-textarea {
          color: #f8f4ff;
        }

        body.od-theme-dark .mastery-button.ghost {
          color: #f8f4ff;
          background: rgba(255, 255, 255, .08);
          border: 1px solid rgba(196, 181, 253, .22);
        }

        body.od-theme-dark .certificate-code {
          color: #f8f4ff;
          background: rgba(255, 255, 255, .08);
          border-color: rgba(196, 181, 253, .20);
        }

        body.od-theme-dark .certificate-verify-line {
          color: #d9c9ef;
          border-top-color: rgba(196, 181, 253, .18);
        }

        body.od-theme-dark .certificate-verify-line strong {
          color: #a7f3d0;
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

        {/* شهادات الإنجاز الشهرية قبل وثيقة الإتقان النهائية */}
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
                      <div className="brand-mark">م</div>
                      <div>
                        <strong>منسقة للتطوير التنظيمي</strong>
                        <span>رحلة معرفية تطبيقية في فهم المنظمة وبناء الأثر</span>
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
                    <span className="badge">وثيقة إتقان ختامية</span>

                    <h2>إتمام رحلة منسقة للتطوير التنظيمي</h2>

                    <div className="learner">{learnerName}</div>

                    <p>
                      تُمنح هذه الوثيقة لمن أتم رحلة منسقة للتطوير التنظيمي بوصفها سجل إتقان
                      لمسار تطبيقي امتد ستة أشهر؛ مسار بنى قدرة أعمق على قراءة المنظمة كنظام
                      حي، وتحويل البيانات إلى تشخيص، والتشخيص إلى تدخل، والتدخل إلى أثر قابل
                      للقياس والاستدامة. وهي توثيق لإنجاز تعلمي وتطبيقي داخل المنصة، لا شهادة
                      أكاديمية رسمية.
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
                      <strong>منهجية المسار</strong>
                      <span>
                        الفهم قبل الحل، البيانات قبل الحكم، النظام قبل اتهام الأفراد،
                        والأثر قبل كثرة الأنشطة.
                      </span>
                    </div>

                    <div className="signature">
                      <strong>إشراف وإعداد معرفي</strong>
                      <div className="name">ريان العجلان</div>
                      <small>منسقة للتطوير التنظيمي</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mastery-actions mastery-no-print">
                <button className="mastery-button primary" onClick={downloadCertificateImage}>
                  تحميل JPEG
                </button>

                <button className="mastery-button dark" onClick={printCertificate}>
                  حفظ PDF
                </button>

                <button className="mastery-button linkedin" onClick={shareOnLinkedIn}>
                  <span className="linkedin-icon" aria-hidden="true">in</span>
                  مشاركة عبر LinkedIn
                </button>
              </div>
            </div>

            <div className="linkedin-panel mastery-no-print">
              <h3>نص مقترح للمشاركة على لينكدإن</h3>
              <p>
                انسخ النص أو استخدم زر المشاركة. عند فتح لينكدإن الصق النص في
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
