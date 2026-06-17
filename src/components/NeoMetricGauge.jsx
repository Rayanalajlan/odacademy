import { useId, useMemo } from "react";

const STATUS_ALIASES = {
  indigo: "progress",
  violet: "progress",
  purple: "progress",
  general: "progress",
  readiness: "readiness",
  emerald: "complete",
  green: "complete",
  success: "complete",
  complete: "complete",
  completed: "complete",
  issued: "complete",
  amber: "warning",
  gold: "warning",
  warning: "warning",
  rose: "warning",
  red: "warning",
  locked: "locked",
  slate: "locked",
  muted: "locked",
  available: "available",
  score: "score"
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getPercent({ value, max, progress }) {
  if (Number.isFinite(Number(progress))) {
    return clamp(Number(progress), 0, 100);
  }

  const numericValue = Number(value);
  const numericMax = Number(max);

  if (!Number.isFinite(numericValue)) return 0;
  if (!Number.isFinite(numericMax) || numericMax <= 0) {
    return clamp(numericValue, 0, 100);
  }

  return clamp((numericValue / numericMax) * 100, 0, 100);
}

function getDisplayValue({ value, max, displayValue }) {
  if (displayValue !== undefined && displayValue !== null) {
    return displayValue;
  }

  if (Number(max) === 100 && Number.isFinite(Number(value))) {
    return `${Math.round(Number(value))}%`;
  }

  return String(value ?? 0);
}

export default function NeoMetricGauge({
  value = 0,
  max = 100,
  progress,
  label,
  subLabel,
  variant = "orb",
  size = "default",
  status = "progress",
  displayValue,
  icon,
  className = "",
  ariaLabel
}) {
  const rawId = useId();
  const gradientId = useMemo(
    () => `neo-metric-gradient-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [rawId]
  );
  const safeStatus = STATUS_ALIASES[status] || "progress";
  const safeSize = ["compact", "default", "hero"].includes(size) ? size : "default";
  const percent = getPercent({ value, max, progress });
  const circumference = 2 * Math.PI * 48;
  const offset = circumference * (1 - percent / 100);
  const angle = -90 + (percent * 3.6);
  const shownValue = getDisplayValue({ value, max, displayValue });

  return (
    <figure
      className={[
        "neo-metric-gauge",
        `neo-metric-gauge--${safeSize}`,
        `neo-metric-gauge--${safeStatus}`,
        `neo-metric-gauge--${variant}`,
        className
      ].filter(Boolean).join(" ")}
      style={{
        "--neo-progress": percent,
        "--neo-angle": `${angle}deg`,
        "--neo-circ": circumference,
        "--neo-offset": offset
      }}
      aria-label={ariaLabel || [label, shownValue, subLabel].filter(Boolean).join(" - ")}
      data-value={value}
      data-max={max}
    >
      <div className="neo-metric-gauge__glass">
        <div className="neo-metric-gauge__orb">
          <svg className="neo-metric-gauge__orbit" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="12" y1="18" x2="108" y2="102">
                <stop offset="0%" stopColor="var(--neo-accent-bright)" />
                <stop offset="46%" stopColor="var(--neo-accent)" />
                <stop offset="100%" stopColor="var(--neo-accent-soft)" />
              </linearGradient>
            </defs>
            <circle className="neo-metric-gauge__orbit-track" cx="60" cy="60" r="48" />
            <circle
              className="neo-metric-gauge__orbit-progress"
              cx="60"
              cy="60"
              r="48"
              stroke={`url(#${gradientId})`}
            />
          </svg>

          <span className="neo-metric-gauge__spark" aria-hidden="true" />
          <span className="neo-metric-gauge__inner-shadow" aria-hidden="true" />

          <div className="neo-metric-gauge__core">
            {icon ? <span className="neo-metric-gauge__icon" aria-hidden="true">{icon}</span> : null}
            <strong className="neo-metric-gauge__value">{shownValue}</strong>
            {label ? <span className="neo-metric-gauge__label">{label}</span> : null}
            {subLabel ? <small className="neo-metric-gauge__sub-label">{subLabel}</small> : null}
          </div>
        </div>
      </div>
    </figure>
  );
}
