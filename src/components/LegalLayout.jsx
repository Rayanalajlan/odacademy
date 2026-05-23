import { useState } from "react";

const BRAND_LOGO_SRC = "/rayan-logo.png";

const styles = {
  page: {
    minHeight: "100vh",
    direction: "rtl",
    background:
      "radial-gradient(circle at top right, rgba(79, 70, 229, 0.16), transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #1e293b 100%)",
    color: "#e5e7eb",
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
    color: "#ffffff"
  },
  logo: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    objectFit: "contain",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    padding: "7px"
  },
  fallbackLogo: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.14)",
    color: "#ffffff",
    fontWeight: 900
  },
  brandTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 900
  },
  brandSub: {
    margin: "4px 0 0",
    fontSize: "0.82rem",
    color: "#cbd5e1"
  },
  nav: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  navLink: {
    color: "#dbeafe",
    textDecoration: "none",
    border: "1px solid rgba(219, 234, 254, 0.22)",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "rgba(15, 23, 42, 0.42)",
    fontSize: "0.9rem"
  },
  card: {
    background: "rgba(255, 255, 255, 0.96)",
    color: "#0f172a",
    borderRadius: "30px",
    padding: "clamp(22px, 4vw, 44px)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.22)"
  },
  eyebrow: {
    margin: 0,
    color: "#4f46e5",
    fontWeight: 900,
    letterSpacing: "0.02em"
  },
  title: {
    margin: "10px 0 12px",
    fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
    lineHeight: 1.2,
    color: "#0f172a"
  },
  intro: {
    margin: "0 0 28px",
    color: "#475569",
    lineHeight: 1.9,
    fontSize: "1.02rem"
  },
  footer: {
    marginTop: "20px",
    color: "#cbd5e1",
    fontSize: "0.86rem",
    textAlign: "center"
  }
};

export default function LegalLayout({
  eyebrow = "OD Academy",
  title,
  intro,
  children
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <a href="/" style={styles.brand} aria-label="العودة إلى الصفحة الرئيسية">
            {logoFailed ? (
              <span style={styles.fallbackLogo} aria-hidden="true">OD</span>
            ) : (
              <img
                src={BRAND_LOGO_SRC}
                alt="شعار ريان العجلان"
                style={styles.logo}
                onError={() => setLogoFailed(true)}
              />
            )}
            <div>
              <p style={styles.brandTitle}>OD Engineering LAB</p>
              <p style={styles.brandSub}>مختبر تعليمي للتطوير التنظيمي</p>
            </div>
          </a>

          <nav style={styles.nav} aria-label="روابط الصفحات القانونية">
            <a href="/" style={styles.navLink}>الرئيسية</a>
            <a href="/privacy" style={styles.navLink}>سياسة الخصوصية</a>
            <a href="/terms" style={styles.navLink}>شروط الاستخدام</a>
            <a href="/data-deletion" style={styles.navLink}>طلب حذف البيانات</a>
          </nav>
        </header>

        <section style={styles.card}>
          <p style={styles.eyebrow}>{eyebrow}</p>
          <h1 style={styles.title}>{title}</h1>
          {intro ? <p style={styles.intro}>{intro}</p> : null}
          {children}
        </section>

        <footer style={styles.footer}>
          © 2026 — منصة OD Academy. جميع الحقوق محفوظة.
        </footer>
      </div>
    </main>
  );
}
