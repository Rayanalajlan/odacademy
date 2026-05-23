// =========================================================
// OD Academy - Phase 18 App.jsx Integration Snippet
// =========================================================
// لا تستبدل App.jsx كاملًا بهذا الملف.
// استخدم هذه المقاطع لإضافة مسارات الخصوصية والشروط وطلب حذف البيانات
// داخل ملف App.jsx الحالي بدون حذف إصلاحاتك السابقة.
// =========================================================

// 1) أضف هذه الاستيرادات أعلى App.jsx مع الاستيرادات الحالية:
import LegalPageRouter, { isLegalPath } from "./components/LegalPageRouter";
import { LegalFooterLinks, LegalFloatingLinks } from "./components/LegalLinks";

// 2) داخل دالة App()، بعد حساب verificationSlug أو قرب بداية الدالة، أضف:
const legalPageRequested = isLegalPath();

// 3) قبل شرط صفحة التحقق /verify، أضف:
if (legalPageRequested) {
  return <LegalPageRouter />;
}

// 4) داخل شرط عدم تسجيل الدخول، أضف LegalFloatingLinks بعد AuthGate.
// مثال عام، لا تنس المحافظة على خصائص AuthGate الموجودة عندك:
if (!authenticated) {
  return (
    <>
      <AuthGate
        onAuthenticated={handleAuthenticatedFromOldAuthGate}
        onEnter={handleEnter}
      />

      <LegalFloatingLinks />
    </>
  );
}

// 5) داخل الفوتر النهائي في App.jsx، أضف:
<LegalFooterLinks />
