import { Component } from "react";

// أنماط الأخطاء الناتجة عن فشل تحميل ملف مؤجّل بعد إصدار نسخة جديدة من المنصة.
const CHUNK_ERROR_PATTERNS = [
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Importing a module script failed",
  "ChunkLoadError",
  "Loading chunk",
  "Loading CSS chunk"
];

function isChunkLoadError(error) {
  const message = String(error?.message || error || "");
  const name = String(error?.name || "");

  return (
    name === "ChunkLoadError" ||
    CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
  );
}

const RELOAD_FLAG = "odacademy_chunk_reload_at";

// بعد إصدار نسخة جديدة، قد يطلب المتصفح ملفات بالأسماء القديمة التي لم تعد موجودة.
// نحدّث الصفحة مرة واحدة فقط لجلب أحدث الملفات، مع حارس زمني يمنع تكرار التحديث للأبد.
function tryRecoverFromStaleDeploy() {
  try {
    const now = Date.now();
    const last = Number(window.sessionStorage.getItem(RELOAD_FLAG) || "0");

    if (now - last > 15000) {
      window.sessionStorage.setItem(RELOAD_FLAG, String(now));
      window.location.reload();
      return true;
    }
  } catch {
    // قد لا يتوفر sessionStorage؛ في هذه الحالة نعرض شاشة التحديث اليدوي.
  }

  return false;
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
    this.handleRetry = this.handleRetry.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error, info) {
    // نبقي بقية المنصة شغّالة، ونسجّل العطل للتشخيص فقط.
    console.error("تم عزل عطل داخل قسم من المنصة:", error, info?.componentStack);

    if (isChunkLoadError(error)) {
      tryRecoverFromStaleDeploy();
    }
  }

  componentDidUpdate(prevProps) {
    // التعافي تلقائيًا عند انتقال المتدرب لقسم آخر.
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, isChunkError: false });
    }
  }

  handleRetry() {
    this.setState({ hasError: false, isChunkError: false });
  }

  handleReload() {
    try {
      window.sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // تجاهل
    }

    window.location.reload();
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const compact = Boolean(this.props.compact);
    const isChunk = this.state.isChunkError;
    const title =
      this.props.title || (isChunk ? "صدرت نسخة محدّثة من المنصة" : "تعذّر تحميل هذا القسم");

    const description = isChunk
      ? "يبدو أن نسخة محدّثة من المنصة صدرت للتو. حدّث الصفحة مرة واحدة لتحميل أحدث إصدار، وسيكمل تقدّمك المحفوظ كما هو."
      : "حدث خطأ غير متوقع داخل هذا القسم فقط. بقية المنصة وتقدّمك المحفوظ بخير. جرّب فتح القسم من جديد، أو انتقل لقسم آخر.";

    return (
      <div
        className={compact ? "od-error-boundary od-error-boundary--compact" : "od-error-boundary"}
        role="alert"
        dir="rtl"
      >
        <div className="od-error-card">
          <div className="od-error-badge" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M10.3 3.7 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
            </svg>
          </div>

          <h2 className="od-error-title">{title}</h2>
          <p className="od-error-text">{description}</p>

          <div className="od-error-actions">
            {isChunk ? (
              <button
                type="button"
                className="od-error-btn od-error-btn--primary"
                onClick={this.handleReload}
              >
                تحديث الصفحة
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="od-error-btn od-error-btn--primary"
                  onClick={this.handleRetry}
                >
                  إعادة المحاولة
                </button>
                <button type="button" className="od-error-btn" onClick={this.handleReload}>
                  تحديث الصفحة
                </button>
              </>
            )}
          </div>
        </div>

        <style>{`
          .od-error-boundary {
            width: min(680px, calc(100% - 28px));
            margin: 28px auto;
            display: flex;
            justify-content: center;
          }

          .od-error-boundary--compact {
            margin: 14px auto;
          }

          .od-error-card {
            width: 100%;
            text-align: center;
            padding: 30px 26px;
            border-radius: 28px;
            background:
              radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .12), transparent 40%),
              #ffffff;
            border: 1px solid rgba(167, 139, 250, .24);
            box-shadow: 0 18px 50px rgba(28, 17, 48, .10);
          }

          .od-error-badge {
            width: 58px;
            height: 58px;
            margin: 0 auto 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 18px;
            color: #7c3aed;
            background: rgba(139, 92, 246, .12);
          }

          .od-error-badge svg {
            width: 30px;
            height: 30px;
          }

          .od-error-title {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 900;
            color: #2e1065;
          }

          .od-error-text {
            margin: 0 auto 18px;
            max-width: 46ch;
            font-size: 15px;
            line-height: 2;
            color: #4b416b;
            font-weight: 600;
          }

          .od-error-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .od-error-btn {
            appearance: none;
            border: 1px solid rgba(124, 58, 237, .28);
            background: #ffffff;
            color: #5b21b6;
            padding: 11px 20px;
            border-radius: 14px;
            font-weight: 800;
            font-size: 14px;
            cursor: pointer;
            transition: transform .12s ease, box-shadow .12s ease;
          }

          .od-error-btn:hover {
            transform: translateY(-1px);
          }

          .od-error-btn--primary {
            background: linear-gradient(135deg, #7c3aed, #4c1d95);
            color: #ffffff;
            border-color: transparent;
            box-shadow: 0 10px 26px rgba(124, 58, 237, .30);
          }

          :root[data-theme="dark"] .od-error-card,
          .od-theme-dark .od-error-card {
            background:
              radial-gradient(circle at 100% 0%, rgba(139, 92, 246, .16), transparent 42%),
              #160d28;
            border-color: rgba(139, 92, 246, .28);
            box-shadow: 0 18px 50px rgba(0, 0, 0, .45);
          }

          :root[data-theme="dark"] .od-error-title,
          .od-theme-dark .od-error-title {
            color: #ede9fe;
          }

          :root[data-theme="dark"] .od-error-text,
          .od-theme-dark .od-error-text {
            color: #c4b5fd;
          }

          :root[data-theme="dark"] .od-error-btn,
          .od-theme-dark .od-error-btn {
            background: #1f1535;
            color: #ddd6fe;
            border-color: rgba(139, 92, 246, .35);
          }

          :root[data-theme="dark"] .od-error-btn--primary,
          .od-theme-dark .od-error-btn--primary {
            background: linear-gradient(135deg, #8b5cf6, #6d28d9);
            color: #ffffff;
          }
        `}</style>
      </div>
    );
  }
}
