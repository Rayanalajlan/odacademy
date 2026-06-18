/**
 * OD Academy / منسقة — Experience 3D enhancer
 * -----------------------------------------------------------------------------
 * تحسين تدرّجي خالص (Progressive enhancement) بلا أي اعتماديات خارجية:
 *   • إمالة ثلاثية الأبعاد للبطاقات نحو المؤشّر (3D tilt).
 *   • تأثير مغناطيسي خفيف للأزرار (magnetic hover).
 *   • ظهور العناصر عند التمرير (scroll reveal) عبر IntersectionObserver.
 *
 * ضمانات الأمان:
 *   • لا يلمس أي منطق تطبيق/مصادقة/بيانات/واجهات برمجية — تأثيرات بصرية فقط.
 *   • إذا فضّل المستخدم تقليل الحركة، لا يفعل شيئًا إطلاقًا (يبقى الموقع كما هو).
 *   • إذا تعذّر تشغيله، يبقى المحتوى ظاهرًا بالكامل (الإخفاء المبدئي مرتبط بالكلاس
 *     html.od3d-ready الذي لا يُضاف إلا من هنا).
 *   • لا يلمس مبدّل الثيم (theme-switch__* / .theme-toggle / .visitor-theme-toggle).
 *   • يعيد الوسم تلقائيًا عند تبدّل صفحات SPA (MutationObserver خفيف ومُبطّأ).
 */

const TILT_SELECTOR = [
  ".od-feature-card",
  ".od-stat-card",
  ".od-lab-card",
  ".od-command-card",
  ".counter-card",
  ".roi-result-card",
  ".home-card",
  ".certificate-pillar"
].join(",");

const MAGNET_SELECTOR = [
  ".od-button",
  ".auth-primary",
  ".portfolio-button",
  ".mastery-button",
  ".primary-button",
  ".secondary-button"
].join(",");

const REVEAL_SELECTOR = [
  ".od-feature-card",
  ".od-stat-card",
  ".od-lab-card",
  ".counter-card",
  ".roi-result-card",
  ".profile-card",
  ".radar-card",
  ".tree-card",
  ".legal-card",
  ".report-section",
  ".tm-card",
  ".section-head",
  ".od-section-head",
  ".page-head",
  ".portfolio-section-head"
].join(",");

const REVEAL_GRID_SELECTOR = ".od-feature-grid, .counter-grid, .od-lab-strip";

const MAX_TILT_DEG = 6;
const MAGNET_STRENGTH = 6; // أصغر = أقوى
const MAGNET_MAX_PX = 7;

let revealObserver = null;
let mutationObserver = null;
let rescanQueued = false;

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/* ---------------------------- 3D tilt ---------------------------- */
function bindTilt(el) {
  if (el.dataset.od3dTilt === "1") return;
  el.dataset.od3dTilt = "1";
  el.classList.add("od3d-tilt");

  let frame = 0;

  const onMove = (event) => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--od3d-ry", `${(px * MAX_TILT_DEG).toFixed(2)}deg`);
      el.style.setProperty("--od3d-rx", `${(-py * MAX_TILT_DEG).toFixed(2)}deg`);
    });
  };

  const reset = () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    el.style.setProperty("--od3d-rx", "0deg");
    el.style.setProperty("--od3d-ry", "0deg");
  };

  el.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerleave", reset, { passive: true });
  el.addEventListener("blur", reset, true);
}

/* -------------------------- magnetic hover -------------------------- */
function bindMagnet(el) {
  if (el.dataset.od3dMagnet === "1") return;
  el.dataset.od3dMagnet = "1";
  el.classList.add("od3d-magnet");

  let frame = 0;

  const onMove = (event) => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(
        -MAGNET_MAX_PX,
        Math.min(MAGNET_MAX_PX, (event.clientX - cx) / MAGNET_STRENGTH)
      );
      const dy = Math.max(
        -MAGNET_MAX_PX,
        Math.min(MAGNET_MAX_PX, (event.clientY - cy) / MAGNET_STRENGTH)
      );
      el.style.setProperty("--od3d-mx", `${dx.toFixed(1)}px`);
      el.style.setProperty("--od3d-my", `${dy.toFixed(1)}px`);
    });
  };

  const reset = () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    el.style.setProperty("--od3d-mx", "0px");
    el.style.setProperty("--od3d-my", "0px");
  };

  el.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerleave", reset, { passive: true });
  el.addEventListener("blur", reset, true);
}

/* -------------------------- scroll reveal -------------------------- */
function ensureObserver() {
  if (revealObserver || typeof IntersectionObserver === "undefined") {
    return revealObserver;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("od3d-in");
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );
  return revealObserver;
}

function bindReveal(el, index) {
  if (el.dataset.od3dReveal === "1") return;
  el.dataset.od3dReveal = "1";
  el.classList.add("od3d-reveal");
  if (typeof index === "number") {
    el.style.setProperty("--od3d-i", String(index));
  }

  const observer = ensureObserver();
  if (!observer) {
    // بديل آمن: إذا لم يتوفّر IntersectionObserver نُظهر العنصر فورًا.
    el.classList.add("od3d-in");
    return;
  }

  // إذا كان العنصر ظاهرًا أصلًا داخل الإطار، أظهره مباشرة دون انتظار تمرير.
  const rect = el.getBoundingClientRect();
  if (rect.top < (window.innerHeight || 0) && rect.bottom > 0) {
    el.classList.add("od3d-in");
    return;
  }
  observer.observe(el);
}

/* ------------------------------ scan ------------------------------ */
function scan() {
  try {
    document.querySelectorAll(TILT_SELECTOR).forEach(bindTilt);
    document.querySelectorAll(MAGNET_SELECTOR).forEach(bindMagnet);

    // عناصر الظهور: نمنح فهرسًا داخل الشبكات للتدرّج الزمني.
    document.querySelectorAll(REVEAL_GRID_SELECTOR).forEach((grid) => {
      Array.prototype.forEach.call(grid.children, (child, i) => {
        if (child.matches && child.matches(REVEAL_SELECTOR)) {
          bindReveal(child, i);
        }
      });
    });
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => bindReveal(el));
  } catch {
    // لا شيء — التحسين اختياري ولا يجب أن يعطّل الواجهة أبدًا.
  }
}

function queueRescan() {
  if (rescanQueued) return;
  rescanQueued = true;
  window.requestAnimationFrame(() => {
    rescanQueued = false;
    scan();
  });
}

/* ----------------------------- public ----------------------------- */
export function initExperience3D() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (prefersReducedMotion()) return; // لا تفعيل عند تفضيل تقليل الحركة.
  if (document.documentElement.dataset.od3dReady === "1") return;

  document.documentElement.dataset.od3dReady = "1";
  document.documentElement.classList.add("od3d-ready");

  const start = () => {
    scan();
    try {
      const root = document.getElementById("root") || document.body;
      mutationObserver = new MutationObserver(() => queueRescan());
      mutationObserver.observe(root, { childList: true, subtree: true });
    } catch {
      /* المراقبة اختيارية */
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}

export default initExperience3D;
