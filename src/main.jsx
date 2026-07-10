import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.tokens.css";
import "./styles.css";
import "./styles.theme-fix.css";
import "./styles.dark-system.css";
import "./styles.light-system.css";
import "./styles.gauge-system.css";
import "./styles.od-ui-system.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary title="تعذّر تشغيل المنصة">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    // تنظيف الكاش القديم مسؤولية الـ Service Worker نفسه في حدث activate.
    // الحذف من هنا كان يمسح كاش النسخة الحالية عند كل زيارة ويلغي فائدته.
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {
        // Registration is optional; the app must keep working if the browser blocks it.
      });
  });
}
