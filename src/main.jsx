import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.tokens.css";
import "./styles.css";
import "./styles.theme-fix.css";
import "./styles.dark-system.css";
import "./styles.light-system.css";
import "./styles.experience-3d.css";
import { initExperience3D } from "./lib/experience3d.js";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary title="تعذّر تشغيل المنصة">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// تحسين بصري تدرّجي اختياري (إمالة/مغناطيسية/ظهور عند التمرير).
// لا يلمس أي منطق؛ ويُلغى تلقائيًا عند تفضيل تقليل الحركة.
initExperience3D();

/* ====================================================================
   ختم تشخيصي مؤقّت (BUILD STAMP) — للتأكّد أن النسخة الجديدة تُحمّل فعلًا.
   شارة صغيرة أسفل يسار الشاشة + رسالة في الـConsole. لا يمكن لأي CSS تجاوزها
   (أنماط مضمّنة + z-index أقصى). احذف هذا المقطع لاحقًا بعد التأكّد.
   ==================================================================== */
(function odBuildStamp() {
  try {
    var TAG = "OD3D BUILD v5 — 2026-06-15";
    // eslint-disable-next-line no-console
    console.log("%c✅ " + TAG + " — النسخة الجديدة محمّلة", "background:#7c3aed;color:#fff;padding:4px 10px;border-radius:6px;font-weight:bold;");
    var mount = function () {
      if (document.getElementById("od-build-stamp")) return;
      var b = document.createElement("button");
      b.id = "od-build-stamp";
      b.textContent = "منسقة • تحديث مرئي ✓ v5";
      b.title = "اضغط للإخفاء — هذه شارة تشخيص مؤقّتة";
      b.setAttribute(
        "style",
        [
          "position:fixed", "bottom:14px", "inset-inline-start:14px",
          "z-index:2147483647", "padding:8px 14px", "border:0",
          "border-radius:999px", "cursor:pointer",
          "font:700 13px/1 system-ui,'Kanit',sans-serif",
          "color:#ffffff",
          "background:linear-gradient(123deg,#7c3aed,#a855f7)",
          "box-shadow:0 8px 24px rgba(124,58,237,.45)",
          "direction:rtl"
        ].join(";")
      );
      b.onclick = function () { b.remove(); };
      document.body.appendChild(b);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  } catch (e) {
    /* تشخيص اختياري */
  }
})();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is optional; the app must keep working if the browser blocks it.
    });
  });
}
