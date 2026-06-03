import { useEffect, useState } from "react";
import { initializeTheme, toggleTheme } from "../lib/themeService";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(initializeTheme());
  }, []);

  function handleToggle() {
    setTheme(toggleTheme(theme));
  }

  const isDark = theme === "dark";

  return (
    <label
      className="theme-switch"
      title={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
    >
      <style>{`
        /*
          Phase 50 - Uiverse-style theme switch
          مستوحى من كود Uiverse المرسل، مع تهذيب الحجم والهوية حتى يتناسب مع هيدر منسقة.
        */

        .theme-switch {
          --toggle-size: 15px;
          --container-width: 5.625em;
          --container-height: 2.5em;
          --container-radius: 6.25em;
          --container-light-bg: #efe7ff;
          --container-night-bg: #1d1f2c;
          --circle-container-diameter: 3.375em;
          --sun-moon-diameter: 2.125em;
          --sun-bg: #d8c3ff;
          --moon-bg: #c4c9d1;
          --spot-color: #959db1;
          --circle-container-offset: calc((var(--circle-container-diameter) - var(--container-height)) / 2 * -1);
          --stars-color: #fff;
          --clouds-color: #fbf7ff;
          --back-clouds-color: #d8c3ff;
          --transition: .5s cubic-bezier(0, -0.02, 0.4, 1.25);
          --circle-transition: .3s cubic-bezier(0, -0.02, 0.35, 1.17);

          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .theme-switch,
        .theme-switch *,
        .theme-switch *::before,
        .theme-switch *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-size: var(--toggle-size);
        }

        .theme-switch__checkbox {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .theme-switch__container {
          width: var(--container-width);
          height: var(--container-height);
          background-color: var(--container-light-bg);
          border-radius: var(--container-radius);
          overflow: hidden;
          cursor: pointer;
          box-shadow:
            0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
            0em 0.062em 0.125em rgba(255, 255, 255, 0.94),
            0 12px 26px rgba(126, 96, 205, .16);
          transition: var(--transition);
          position: relative;
          border: 1px solid rgba(126, 96, 205, .20);
        }

        .theme-switch__container::before {
          content: "";
          position: absolute;
          z-index: 1;
          inset: 0;
          box-shadow:
            0em 0.05em 0.187em rgba(0, 0, 0, 0.22) inset,
            0em 0.05em 0.187em rgba(0, 0, 0, 0.18) inset;
          border-radius: var(--container-radius);
          pointer-events: none;
        }

        .theme-switch__circle-container {
          width: var(--circle-container-diameter);
          height: var(--circle-container-diameter);
          background-color: rgba(255, 255, 255, 0.14);
          position: absolute;
          left: var(--circle-container-offset);
          top: var(--circle-container-offset);
          border-radius: var(--container-radius);
          box-shadow:
            inset 0 0 0 3.375em rgba(255, 255, 255, 0.10),
            inset 0 0 0 3.375em rgba(255, 255, 255, 0.10),
            0 0 0 0.625em rgba(255, 255, 255, 0.10),
            0 0 0 1.25em rgba(255, 255, 255, 0.08);
          display: flex;
          transition: var(--circle-transition);
          pointer-events: none;
        }

        .theme-switch__sun-moon-container {
          pointer-events: auto;
          position: relative;
          z-index: 2;
          width: var(--sun-moon-diameter);
          height: var(--sun-moon-diameter);
          margin: auto;
          border-radius: var(--container-radius);
          background:
            radial-gradient(circle at 35% 30%, #fbf7ff 0 14%, var(--sun-bg) 16% 100%);
          box-shadow:
            0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset,
            0em -0.062em 0.062em 0em rgba(91,43,189,.38) inset;
          filter:
            drop-shadow(0.062em 0.125em 0.125em rgba(0, 0, 0, 0.25))
            drop-shadow(0em 0.062em 0.125em rgba(0, 0, 0, 0.25));
          overflow: hidden;
          transition: var(--transition);
        }

        .theme-switch__moon {
          transform: translateX(100%);
          width: 100%;
          height: 100%;
          background-color: var(--moon-bg);
          border-radius: inherit;
          box-shadow:
            0.062em 0.062em 0.062em 0em rgba(254, 255, 239, 0.61) inset,
            0em -0.062em 0.062em 0em #969696 inset;
          transition: var(--transition);
          position: relative;
        }

        .theme-switch__spot {
          position: absolute;
          top: 0.75em;
          left: 0.312em;
          width: 0.75em;
          height: 0.75em;
          border-radius: var(--container-radius);
          background-color: var(--spot-color);
          box-shadow: 0em 0.0312em 0.062em rgba(0, 0, 0, 0.25) inset;
        }

        .theme-switch__spot:nth-of-type(2) {
          width: 0.375em;
          height: 0.375em;
          top: 0.937em;
          left: 1.375em;
        }

        .theme-switch__spot:nth-of-type(3) {
          width: 0.25em;
          height: 0.25em;
          top: 0.312em;
          left: 0.812em;
        }

        .theme-switch__clouds {
          width: 1.25em;
          height: 1.25em;
          background-color: var(--clouds-color);
          border-radius: var(--container-radius);
          position: absolute;
          bottom: -0.625em;
          left: 0.312em;
          box-shadow:
            0.937em 0.312em var(--clouds-color),
            -0.312em -0.312em var(--back-clouds-color),
            1.437em 0.375em var(--clouds-color),
            0.5em -0.125em var(--back-clouds-color),
            2.187em 0 var(--clouds-color),
            1.25em -0.062em var(--back-clouds-color),
            2.937em 0.312em var(--clouds-color),
            2em -0.312em var(--back-clouds-color),
            3.625em -0.062em var(--clouds-color),
            2.625em 0em var(--back-clouds-color),
            4.5em -0.312em var(--clouds-color),
            3.375em -0.437em var(--back-clouds-color),
            4.625em -1.75em 0 0.437em var(--clouds-color),
            4em -0.625em var(--back-clouds-color),
            4.125em -2.125em 0 0.437em var(--back-clouds-color);
          transition: var(--transition);
        }

        .theme-switch__stars-container {
          position: absolute;
          color: var(--stars-color);
          top: -100%;
          left: 0.312em;
          width: 2.75em;
          height: auto;
          transition: var(--transition);
        }

        .theme-switch__checkbox:checked + .theme-switch__container {
          background-color: var(--container-night-bg);
          border-color: rgba(216, 195, 255, .18);
          box-shadow:
            0em -0.062em 0.062em rgba(0, 0, 0, 0.25),
            0em 0.062em 0.125em rgba(255, 255, 255, 0.16),
            0 14px 30px rgba(0, 0, 0, .28);
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container {
          left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter));
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__circle-container:hover {
          left: calc(100% - var(--circle-container-offset) - var(--circle-container-diameter) - 0.187em);
        }

        .theme-switch__circle-container:hover {
          left: calc(var(--circle-container-offset) + 0.187em);
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__moon {
          transform: translate(0);
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__clouds {
          bottom: -4.062em;
        }

        .theme-switch__checkbox:checked + .theme-switch__container .theme-switch__stars-container {
          top: 50%;
          transform: translateY(-50%);
        }

        .theme-switch:focus-within .theme-switch__container {
          outline: 3px solid rgba(216, 195, 255, .80);
          outline-offset: 3px;
        }

        body.od-theme-dark .theme-switch__container {
          background-color: var(--container-night-bg);
        }

        @media (max-width: 980px) {
          .theme-switch {
            --toggle-size: 14px;
          }
        }

        @media (max-width: 430px) {
          .theme-switch {
            --toggle-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .theme-switch *,
          .theme-switch *::before,
          .theme-switch *::after {
            transition-duration: .001ms !important;
          }
        }
      `}</style>

      <input
        className="theme-switch__checkbox"
        type="checkbox"
        checked={isDark}
        onChange={handleToggle}
      />

      <div className="theme-switch__container" aria-hidden="true">
        <div className="theme-switch__circle-container">
          <div className="theme-switch__sun-moon-container">
            <div className="theme-switch__moon">
              <div className="theme-switch__spot" />
              <div className="theme-switch__spot" />
              <div className="theme-switch__spot" />
            </div>
          </div>
        </div>

        <div className="theme-switch__clouds" />

        <svg
          className="theme-switch__stars-container"
          viewBox="0 0 144 55"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C137.052 7.56303 137.441 6.55462 138.161 5.71123C138.937 4.85867 139.881 4.40947 141 4.35447C139.881 4.29946 138.937 3.85027 138.161 3.00688C137.441 2.15432 137.052 1.14591 136.996 0C136.996 1.14591 136.607 2.15432 135.831 3.00688Z"
            fill="currentColor"
          />
          <path
            d="M52.831 18.0069C52.055 18.8503 51.111 19.2995 50 19.3545C51.111 19.4095 52.055 19.8587 52.831 20.7112C53.607 21.5546 53.996 22.563 53.996 23.7273C54.052 22.563 54.441 21.5546 55.161 20.7112C55.937 19.8587 56.881 19.4095 58 19.3545C56.881 19.2995 55.937 18.8503 55.161 18.0069C54.441 17.1543 54.052 16.1459 53.996 15C53.996 16.1459 53.607 17.1543 52.831 18.0069Z"
            fill="currentColor"
          />
          <path
            d="M103.831 34.0069C103.055 34.8503 102.111 35.2995 101 35.3545C102.111 35.4095 103.055 35.8587 103.831 36.7112C104.607 37.5546 104.996 38.563 104.996 39.7273C105.052 38.563 105.441 37.5546 106.161 36.7112C106.937 35.8587 107.881 35.4095 109 35.3545C107.881 35.2995 106.937 34.8503 106.161 34.0069C105.441 33.1543 105.052 32.1459 104.996 31C104.996 32.1459 104.607 33.1543 103.831 34.0069Z"
            fill="currentColor"
          />
          <circle cx="5" cy="47" r="2" fill="currentColor" />
          <circle cx="35" cy="4" r="2" fill="currentColor" />
          <circle cx="78" cy="49" r="2" fill="currentColor" />
        </svg>
      </div>
    </label>
  );
}
