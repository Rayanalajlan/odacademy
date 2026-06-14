import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.tokens.css";
import "./styles.css";
import "./styles.theme-fix.css";
import "./styles.dark-system.css";
import "./styles.light-system.css";
import "./styles.shape-system.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary title="تعذّر تشغيل المنصة">
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is optional; the app must keep working if the browser blocks it.
    });
  });
}
