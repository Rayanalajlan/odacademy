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
import "./styles.neo-metric-gauge.css";
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

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is optional; the app must keep working if the browser blocks it.
    });
  });
}
