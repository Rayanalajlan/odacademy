import { useState } from "react";

const BRAND_LOGO_CANDIDATES = [
  "/brand/munsaqah-approved-horizontal.png",
  "/brand/munsaqah-horizontal-official.png",
  "/logo-horizontal.png",
  "/brand/logo-horizontal.svg",
  "/logo-horizontal.svg"
];

const styles = {
  page: {
    minHeight: "100vh",
    direction: "rtl",
    background:
      "radial-gradient(circle at 100% 0%, rgba(183,148,244,0.20), transparent 34%), radial-gradient(circle at 0% 100%, rgba(126,96,205,0.12), transparent 30%), linear-gradient(180deg, #fbf7ff 0%, #f6efff 48%, #fffafc 100%)",
    color: "#211336",
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
    color: "#211336",
    background: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(126,96,205,0.16)",
    borderRadius: "24px",
    padding: "10px 14px",
    boxShadow: "0 16px 42px rgba(60,37,98,0.08)"
  },
  logo: {
    width: "150px",
    maxWidth: "44vw",
    height: "auto",
    maxHeight: "58px",
    objectFit: "contain",
    display: "block",
    filter: "none"
  },
  fallbackLogo: {
    width: "58px",
    height: "58px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #efe7ff, #ffffff)",
    border: "1px solid rgba(126,96,205,0.18)",
    color: "#5b2bbd",
    fontWeight: 900
  },
  brandTitle: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: 950,
    color: "#211336"
  },
  brandSub: {
    margin: "4px 0 0",
    fontSize: "0.82rem",
    color: "#6d607d",
    fontWeight: 800
  },
  nav: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  navLink: {
    color: "#5b2bbd",
    textDecoration: "none",
    border: "1px solid rgba(126,96,205,0.18)",
    borderRadius: "999px",
    padding: "9px 13px",
    background: "rgba(255,255,255,0.78)",
    fontSize: "0.9rem",
    fontWeight: 900,
    boxShadow: "0 10px 28px rgba(60,37,98,0.06)"
  },
  card: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,247,255,0.92))",
    color: "#211336",
    borderRadius: "30px",
    padding: "clamp(22px, 4vw, 44px)",
    boxShadow: "0 24px 70px rgba(60,37,98,0.14)",
    border: "1px solid rgba(126,96,205,0.16)"
  },
  eyebrow: {
    margin: 0,
    color: "#5b2bbd",
    fontWeight: 950,
    letterSpacing: "0.02em"
  },
  title: {
    margin: "10px 0 12px",
    fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
    lineHeight: 1.2,
    color: "#211336"
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
    color: "#6d607d",
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
  const logoSrc = BRAND_LOGO_CANDIDATES[logoIndex];

  function handleLogoError() {
    setLogoIndex((current) => current + 1);
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <a href="/" style={styles.brand} aria-label="العودة إلى الصفحة الرئيسية">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="شعار منسقة"
                style={styles.logo}
                onError={handleLogoError}
              />
            ) : (
              <span style={styles.fallbackLogo} aria-hidden="true">م</span>
            )}

            <div>
              <p style={styles.brandTitle}>منسقة</p>
              <p style={styles.brandSub}>منصة تعليمية للتطوير التنظيمي</p>
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
          © 2026 — منصة منسقة. جميع الحقوق محفوظة.
        </footer>
      </div>
    </main>
  );
}
