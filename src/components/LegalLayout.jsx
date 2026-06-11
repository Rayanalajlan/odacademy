import { useEffect, useState } from "react";
import { initializeTheme } from "../lib/themeService";
import ThemeToggle from "./ThemeToggle";

/* شعار منسقة الفاتح يُوضع داخل شريحة بنفسجية غامقة ليظهر بوضوح فوق الخلفية الفاتحة */
const BRAND_LOGO_CANDIDATES = [
  "/brand/munsaqah-approved-icon.png",
  "/brand/munsaqah-icon-official.png",
  "/brand/icon.png",
  "/logo.png",
  "/rayan-logo.png"
];

function LegalNavIcon({ type }) {
  return (
    <span className="legal-nav-icon" aria-hidden="true" style={styles.navIcon}>
      <svg
        viewBox="0 0 24 24"
        style={{ width: "100%", height: "100%", display: "block" }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "home" && (
          <>
            <path d="M4.4 11.2 12 4.6l7.6 6.6" />
            <path d="M6.6 10.2v9h10.8v-9" />
            <path d="M10 19.2v-5h4v5" />
          </>
        )}
        {type === "privacy" && (
          <>
            <path d="M12 3.4 5.2 6.1v5.5c0 4.3 2.8 7.5 6.8 8.9 4-1.4 6.8-4.6 6.8-8.9V6.1z" />
            <path d="M9.5 12.1 11.3 14l3.4-4" />
          </>
        )}
        {type === "terms" && (
          <>
            <path d="M7 3.8h7.2L18 7.6v12.6H7z" />
            <path d="M14 3.8v4h4" />
            <path d="M9.7 12h4.6" />
            <path d="M9.7 15.2h4.6" />
          </>
        )}
        {type === "delete" && (
          <>
            <path d="M5 7h14" />
            <path d="M9 7V5.4c0-.8.6-1.4 1.4-1.4h3.2c.8 0 1.4.6 1.4 1.4V7" />
            <path d="M7.2 7.8 8 20h8l.8-12.2" />
            <path d="M10.3 11v5.2" />
            <path d="M13.7 11v5.2" />
          </>
        )}
      </svg>
    </span>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    direction: "rtl",
    background:
      "radial-gradient(circle at 100% 0%, rgba(124,58,237,0.16), transparent 32%), radial-gradient(circle at 0% 100%, rgba(168,85,247,0.12), transparent 30%), linear-gradient(180deg, #fbf7ff 0%, #f4eefb 48%, #fbf7ff 100%)",
    color: "#2b155f",
    padding: "28px 16px"
  },
  shell: {
    width: "min(1040px, 100%)",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "22px",
    flexWrap: "wrap"
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "#2b155f"
  },
  logoChip: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #3b1d6e 0%, #2b155f 100%)",
    border: "1px solid rgba(124,58,237,0.35)",
    boxShadow: "0 16px 42px rgba(60,37,98,0.18)",
    flex: "0 0 auto"
  },
  logo: {
    width: "34px",
    height: "auto",
    maxHeight: "40px",
    objectFit: "contain",
    display: "block"
  },
  fallbackLogo: {
    color: "#efe7ff",
    fontWeight: 900,
    fontSize: "1.3rem"
  },
  brandTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 950,
    color: "#2b155f"
  },
  brandSub: {
    margin: "4px 0 0",
    fontSize: "0.82rem",
    color: "#6a5d85",
    fontWeight: 800
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap"
  },
  nav: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  themeToggleWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto"
  },
  navLink: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#6d28d9",
    textDecoration: "none",
    border: "1px solid rgba(124,58,237,0.22)",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "rgba(255,255,255,0.86)",
    fontSize: "0.9rem",
    fontWeight: 900,
    boxShadow: "0 10px 28px rgba(60,37,98,0.06)"
  },
  navIcon: {
    width: "19px",
    height: "19px",
    display: "inline-grid",
    placeItems: "center",
    flex: "0 0 auto",
    color: "inherit"
  },
  card: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,247,255,0.94))",
    color: "#2b155f",
    borderRadius: "30px",
    padding: "clamp(22px, 4vw, 44px)",
    boxShadow: "0 24px 70px rgba(60,37,98,0.14)",
    border: "1px solid rgba(124,58,237,0.18)"
  },
  eyebrow: {
    margin: 0,
    color: "#6d28d9",
    fontWeight: 950,
    letterSpacing: "0.02em"
  },
  title: {
    margin: "10px 0 12px",
    fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
    lineHeight: 1.2,
    color: "#2b155f"
  },
  intro: {
    margin: "0 0 28px",
    color: "#5b4a72",
    lineHeight: 1.9,
    fontSize: "1.02rem",
    fontWeight: 750
  },
  footer: {
    marginTop: "20px",
    color: "#6a5d85",
    fontSize: "0.86rem",
    textAlign: "center",
    fontWeight: 800
  }
};

export default function LegalLayout({
  eyebrow = "منسقة",
  title,
  intro,
  children
}) {
  const [logoIndex, setLogoIndex] = useState(0);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const logoSrc = BRAND_LOGO_CANDIDATES[logoIndex];

  useEffect(() => {
    initializeTheme();
  }, []);

  function handleLogoError() {
    setLogoIndex((current) => current + 1);
  }

  function handleDeleteLink(event) {
    event.preventDefault();
    setConfirmDeleteOpen(true);
  }

  return (
    <main className="legal-page" style={styles.page}>
      <div className="legal-shell" style={styles.shell}>
        <header className="legal-header" style={styles.header}>
          <a className="legal-brand" href="/" style={styles.brand} aria-label="العودة إلى الصفحة الرئيسية">
            <span className="legal-logo-chip" style={styles.logoChip}>
              {logoSrc ? (
                <img
                  className="legal-logo"
                  src={logoSrc}
                  alt="شعار منسقة"
                  style={styles.logo}
                  onError={handleLogoError}
                />
              ) : (
                <span className="legal-fallback-logo" style={styles.fallbackLogo} aria-hidden="true">م</span>
              )}
            </span>
            <div>
              <p className="legal-brand-title" style={styles.brandTitle}>منسقة</p>
              <p className="legal-brand-sub" style={styles.brandSub}>منصة تعليمية للتطوير التنظيمي</p>
            </div>
          </a>

          <div className="legal-header-actions" style={styles.headerActions}>
            <nav className="legal-nav" style={styles.nav} aria-label="روابط الصفحات القانونية">
              <a className="legal-nav-link" href="/" style={styles.navLink}>
                <LegalNavIcon type="home" />
                الرئيسية
              </a>
              <a className="legal-nav-link" href="/privacy" style={styles.navLink}>
                <LegalNavIcon type="privacy" />
                سياسة الخصوصية
              </a>
              <a className="legal-nav-link" href="/terms" style={styles.navLink}>
                <LegalNavIcon type="terms" />
                شروط الاستخدام
              </a>
              <a className="legal-nav-link" href="/data-deletion" style={styles.navLink} onClick={handleDeleteLink}>
                <LegalNavIcon type="delete" />
                طلب حذف البيانات
              </a>
            </nav>
            <div className="legal-theme-toggle" style={styles.themeToggleWrap}>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <section className="legal-card legal-content-card" style={styles.card}>
          <p className="legal-eyebrow" style={styles.eyebrow}>{eyebrow}</p>
          <h1 className="legal-title" style={styles.title}>{title}</h1>
          {intro ? <p className="legal-intro" style={styles.intro}>{intro}</p> : null}
          {children}
        </section>

        <footer className="legal-footer" style={styles.footer}>
          © 2026 — جميع الحقوق محفوظة
        </footer>

        {confirmDeleteOpen ? (
          <div
            className="legal-confirm-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="تنبيه قبل طلب حذف البيانات"
            onClick={() => setConfirmDeleteOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "grid",
              placeItems: "center",
              padding: "18px",
              background: "rgba(12, 7, 23, .72)",
              backdropFilter: "blur(10px)"
            }}
          >
            <div
              className="legal-confirm-dialog"
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "min(520px, 100%)",
                borderRadius: "26px",
                padding: "22px",
                background: "#ffffff",
                color: "#18102e",
                border: "1px solid rgba(239, 68, 68, .26)",
                boxShadow: "0 26px 80px rgba(0, 0, 0, .28)",
                textAlign: "right"
              }}
            >
              <h2 style={{ margin: "0 0 10px", color: "#7f1d1d", fontSize: "1.25rem", lineHeight: 1.7 }}>
                تنبيه قبل طلب حذف البيانات
              </h2>
              <p style={{ margin: 0, color: "#463c63", fontSize: ".96rem", lineHeight: 2, fontWeight: 800 }}>
                هذا المسار مخصص لطلب حساس قد يؤدي بعد المراجعة والتحقق إلى حذف
                حسابك، تقدمك، ملاحظاتك، وإنجازاتك داخل منسقة. لا تتابع إلا إذا
                كنت تقصد فعلًا طلب حذف بياناتك.
              </p>
              <div className="legal-confirm-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
                <button
                  className="legal-confirm-cancel"
                  type="button"
                  onClick={() => setConfirmDeleteOpen(false)}
                  style={{
                    border: 0,
                    borderRadius: "16px",
                    padding: "12px 16px",
                    font: "inherit",
                    fontWeight: 900,
                    color: "#463c63",
                    background: "#efe9fb",
                    cursor: "pointer"
                  }}
                >
                  إلغاء
                </button>
                <button
                  className="legal-confirm-continue"
                  type="button"
                  onClick={() => {
                    window.location.href = "/data-deletion";
                  }}
                  style={{
                    border: 0,
                    borderRadius: "16px",
                    padding: "12px 16px",
                    font: "inherit",
                    fontWeight: 900,
                    color: "#ffffff",
                    background: "#991b1b",
                    cursor: "pointer"
                  }}
                >
                  أفهم وأريد المتابعة
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
