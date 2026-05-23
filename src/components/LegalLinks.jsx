const linkStyle = {
  color: "#dbeafe",
  textDecoration: "none",
  borderBottom: "1px solid rgba(219, 234, 254, 0.45)",
  paddingBottom: "2px"
};

export function LegalFooterLinks() {
  return (
    <nav
      aria-label="روابط قانونية"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "14px",
        flexWrap: "wrap",
        marginTop: "12px",
        fontSize: "0.88rem"
      }}
    >
      <a href="/privacy" style={linkStyle}>سياسة الخصوصية</a>
      <a href="/terms" style={linkStyle}>شروط الاستخدام</a>
      <a href="/data-deletion" style={linkStyle}>طلب حذف البيانات</a>
    </nav>
  );
}

export function LegalFloatingLinks() {
  const chipStyle = {
    color: "#0f172a",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(15,23,42,0.12)",
    borderRadius: "999px",
    padding: "9px 12px",
    textDecoration: "none",
    boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
    fontSize: "0.82rem",
    fontWeight: 800
  };

  return (
    <nav
      aria-label="روابط الخصوصية قبل تسجيل الدخول"
      style={{
        position: "fixed",
        left: "16px",
        bottom: "16px",
        zIndex: 50,
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        direction: "rtl",
        maxWidth: "calc(100vw - 32px)"
      }}
    >
      <a href="/privacy" style={chipStyle}>الخصوصية</a>
      <a href="/terms" style={chipStyle}>الشروط</a>
      <a href="/data-deletion" style={chipStyle}>حذف البيانات</a>
    </nav>
  );
}
