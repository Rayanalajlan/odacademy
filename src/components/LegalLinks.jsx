const legalLinks = [
  {
    href: "/privacy",
    label: "سياسة الخصوصية",
    shortLabel: "الخصوصية",
    icon: "privacy"
  },
  {
    href: "/terms",
    label: "شروط الاستخدام",
    shortLabel: "الشروط",
    icon: "terms"
  },
  {
    href: "/data-deletion",
    label: "طلب حذف البيانات",
    shortLabel: "حذف البيانات",
    icon: "delete"
  }
];

function LegalIcon({ type }) {
  return (
    <span className="legal-link-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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

const legalLinksStyles = `
  .legal-footer-links,
  .legal-floating-links {
    direction: rtl;
  }

  .legal-footer-links {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 2px;
    width: 100%;
  }

  .legal-footer-link,
  .legal-floating-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    border-radius: 999px;
    text-decoration: none;
    font-size: .88rem;
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
  }

  .legal-footer-link {
    color: #382a58 !important;
    background: rgba(255, 255, 255, .88) !important;
    border: 1px solid rgba(139, 92, 246, .22) !important;
    padding: 0 14px;
    box-shadow: 0 10px 24px rgba(28, 17, 48, .08);
  }

  .legal-footer-link:hover,
  .legal-floating-link:hover {
    transform: translateY(-1px);
  }

  .legal-link-icon {
    width: 19px;
    height: 19px;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    color: inherit !important;
  }

  .legal-link-icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  body.od-theme-dark .legal-footer-link {
    color: #efe9ff !important;
    background: rgba(241, 236, 251, .10) !important;
    border-color: rgba(196, 181, 253, .28) !important;
  }

  .legal-floating-links {
    position: fixed;
    left: 16px;
    bottom: 16px;
    z-index: 50;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    max-width: calc(100vw - 32px);
  }

  .legal-floating-link {
    color: #18102e !important;
    background: rgba(255, 255, 255, .94) !important;
    border: 1px solid rgba(28, 17, 48, .12) !important;
    padding: 0 12px;
    box-shadow: 0 10px 24px rgba(28, 17, 48, .14);
    font-size: .82rem;
  }

  @media (max-width: 640px) {
    .legal-footer-link {
      width: min(100%, 260px);
    }
  }
`;

export function LegalFooterLinks() {
  return (
    <nav className="legal-footer-links" aria-label="روابط قانونية">
      <style>{legalLinksStyles}</style>
      {legalLinks.map((link) => (
        <a key={link.href} className="legal-footer-link" href={link.href}>
          <LegalIcon type={link.icon} />
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export function LegalFloatingLinks() {
  return (
    <nav className="legal-floating-links" aria-label="روابط الخصوصية قبل تسجيل الدخول">
      <style>{legalLinksStyles}</style>
      {legalLinks.map((link) => (
        <a key={link.href} className="legal-floating-link" href={link.href}>
          <LegalIcon type={link.icon} />
          {link.shortLabel}
        </a>
      ))}
    </nav>
  );
}
