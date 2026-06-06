import { useState } from "react";

const BRAND_LOGO_SRC = "/rayan-logo.png";

const styles = {
  page: {
    minHeight: "100vh",
    direction: "rtl",
    background:
      "radial-gradient(circle at top right, rgba(139, 92, 246, 0.16), transparent 34%), linear-gradient(135deg, #18102e 0%, #111827 48%, #281748 100%)",
    color: "#e9e4f5",
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
    color: "#c9bdf0"
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
    background: "rgba(28, 17, 48, 0.42)",
    fontSize: "0.9rem"
  },
  card: {
    background: "rgba(255, 255, 255, 0.96)",
    color: "#18102e",
    borderRadius: "30px",
    padding: "clamp(22px, 4vw, 44px)",
    boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.22)"
  },
  eyebrow: {
    margin: 0,
    color: "#8b5cf6",
    fontWeight: 900,
    letterSpacing: "0.02em"
  },
  title: {
    margin: "10px 0 12px",
    fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
    lineHeight: 1.2,
    color: "#18102e"
  },
  intro: {
    margin: "0 0 28px",
    color: "#5b4f78",
    lineHeight: 1.9,
    fontSize: "1.02rem"
  },
  footer: {
    marginTop: "20px",
    color: "#c9bdf0",
    fontSize: "0.86rem",
    textAlign: "center"
  }
};

export default function LegalLayout({
  eyebrow = "منسقة",
  title,
  intro,
  children
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  function handleDeleteLink(event) {
    event.preventDefault();
    setConfirmDeleteOpen(true);
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <a href="/" style={styles.brand} aria-label="العودة إلى الصفحة الرئيسية">
            {logoFailed ? (
              <span style={styles.fallbackLogo} aria-hidden="true">م</span>
            ) : (
              <img
                src={BRAND_LOGO_SRC}
                alt="شعار ريان العجلان"
                style={styles.logo}
                onError={() => setLogoFailed(true)}
              />
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
            <a href="/data-deletion" style={styles.navLink} onClick={handleDeleteLink}>طلب حذف البيانات</a>
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

        {confirmDeleteOpen ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="تنبيه قبل طلب حذف البيانات"
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
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "18px" }}>
                <button
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
