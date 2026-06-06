import { useState } from "react";

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
    filter: brightness(.98);
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

  .legal-confirm-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(12, 7, 23, .72);
    backdrop-filter: blur(10px);
  }

  .legal-confirm-dialog {
    width: min(520px, 100%);
    border-radius: 26px;
    padding: 22px;
    background: #ffffff;
    color: #18102e;
    border: 1px solid rgba(239, 68, 68, .26);
    box-shadow: 0 26px 80px rgba(0, 0, 0, .28);
    text-align: right;
  }

  .legal-confirm-dialog h2 {
    margin: 0 0 10px;
    color: #7f1d1d;
    font-size: 1.25rem;
    line-height: 1.7;
  }

  .legal-confirm-dialog p {
    margin: 0;
    color: #463c63;
    font-size: .96rem;
    line-height: 2;
    font-weight: 800;
  }

  .legal-confirm-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 18px;
  }

  .legal-confirm-actions button {
    border: 0;
    border-radius: 16px;
    padding: 12px 16px;
    font: inherit;
    font-weight: 900;
    cursor: pointer;
  }

  .legal-confirm-cancel {
    color: #463c63;
    background: #efe9fb;
  }

  .legal-confirm-continue {
    color: #ffffff;
    background: #991b1b;
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

function DeleteDataConfirmModal({ open, onCancel, onContinue }) {
  if (!open) return null;

  return (
    <div className="legal-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title">
      <div className="legal-confirm-dialog">
        <h2 id="delete-confirm-title">تنبيه قبل طلب حذف البيانات</h2>
        <p>
          هذا المسار مخصص لطلب حساس قد يؤدي بعد المراجعة والتحقق إلى حذف حسابك،
          تقدمك، ملاحظاتك، وإنجازاتك داخل منسقة. لن يتم الحذف بمجرد فتح الصفحة،
          لكن لا تتابع إلا إذا كنت تقصد فعلًا طلب حذف بياناتك.
        </p>
        <div className="legal-confirm-actions">
          <button type="button" className="legal-confirm-cancel" onClick={onCancel}>
            إلغاء
          </button>
          <button type="button" className="legal-confirm-continue" onClick={onContinue}>
            أفهم وأريد المتابعة
          </button>
        </div>
      </div>
    </div>
  );
}

function LegalLinksList({ variant }) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const className = variant === "floating" ? "legal-floating-link" : "legal-footer-link";

  function handleDeleteClick(event) {
    event.preventDefault();
    setConfirmDeleteOpen(true);
  }

  function continueToDeletion() {
    window.location.href = "/data-deletion";
  }

  return (
    <>
      <style>{legalLinksStyles}</style>
      {legalLinks.map((link) => (
        <a
          key={link.href}
          className={className}
          href={link.href}
          onClick={link.icon === "delete" ? handleDeleteClick : undefined}
        >
          <LegalIcon type={link.icon} />
          {variant === "floating" ? link.shortLabel : link.label}
        </a>
      ))}
      <DeleteDataConfirmModal
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onContinue={continueToDeletion}
      />
    </>
  );
}

export function LegalFooterLinks() {
  return (
    <nav className="legal-footer-links" aria-label="روابط قانونية">
      <LegalLinksList variant="footer" />
    </nav>
  );
}

export function LegalFloatingLinks() {
  return (
    <nav className="legal-floating-links" aria-label="روابط الخصوصية قبل تسجيل الدخول">
      <LegalLinksList variant="floating" />
    </nav>
  );
}
