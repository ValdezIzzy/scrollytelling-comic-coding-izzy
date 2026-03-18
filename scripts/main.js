gsap.registerPlugin(ScrollTrigger);

let resizeRefreshTimer = 0;
let refreshAnimationFrame = 0;

const queueGlobalScrollRefresh = (delay = 140) => {
  if (resizeRefreshTimer) window.clearTimeout(resizeRefreshTimer);
  resizeRefreshTimer = window.setTimeout(() => {
    if (refreshAnimationFrame) window.cancelAnimationFrame(refreshAnimationFrame);
    refreshAnimationFrame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("comic:resize-settled"));
      ScrollTrigger.refresh(true);
      refreshAnimationFrame = 0;
    });
    resizeRefreshTimer = 0;
  }, Math.max(0, delay));
};

window.addEventListener("resize", () => {
  queueGlobalScrollRefresh(140);
});

// Startup stabilization: avoid "works only after resize" by refreshing
// once layout-critical assets (fonts/load) are ready.
const runStartupRefreshPass = () => {
  queueGlobalScrollRefresh(0);
  window.setTimeout(() => {
    queueGlobalScrollRefresh(0);
  }, 280);
};

if (document.readyState === "complete") {
  runStartupRefreshPass();
} else {
  window.addEventListener("load", runStartupRefreshPass, { once: true });
}

if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
  document.fonts.ready
    .then(() => {
      queueGlobalScrollRefresh(0);
    })
    .catch(() => {
      // Ignore font API failures.
    });
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    queueGlobalScrollRefresh(0);
  }
});

const THEME_MODE_KEY = "comic-site-theme-mode";
const LEGACY_THEME_KEY = "comic-site-theme";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let prefersReducedMotionGlobal = reducedMotionQuery.matches;
document.documentElement.classList.toggle("reduced-motion", prefersReducedMotionGlobal);

const updateReducedMotionState = () => {
  prefersReducedMotionGlobal = reducedMotionQuery.matches;
  document.documentElement.classList.toggle("reduced-motion", prefersReducedMotionGlobal);
  if (prefersReducedMotionGlobal && document.readyState !== "loading") {
    applyReducedMotionFallback();
  }
};

if (reducedMotionQuery.addEventListener) {
  reducedMotionQuery.addEventListener("change", updateReducedMotionState);
} else if (reducedMotionQuery.addListener) {
  reducedMotionQuery.addListener(updateReducedMotionState);
}

const makeKeyboardActivatable = (element, fallbackLabel) => {
  if (!element) return;
  if (element.dataset.kbdBound === "1") return;
  element.dataset.kbdBound = "1";

  const isNativeInteractive = /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(element.tagName);
  if (!isNativeInteractive) {
    if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "0");
    if (!element.hasAttribute("role")) element.setAttribute("role", "button");
  }

  if (fallbackLabel && !element.getAttribute("aria-label")) {
    element.setAttribute("aria-label", fallbackLabel);
  }

  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " " && event.code !== "Space") return;
    event.preventDefault();
    element.click();
  });
};

const normalizeThemeMode = (mode) => {
  if (mode === "light" || mode === "dark" || mode === "system") return mode;
  return "system";
};

const readSavedThemeMode = () => {
  try {
    const savedMode = localStorage.getItem(THEME_MODE_KEY);
    if (savedMode === "light" || savedMode === "dark" || savedMode === "system") {
      return savedMode;
    }
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacyTheme === "light" || legacyTheme === "dark") {
      return legacyTheme;
    }
  } catch (_err) {
    // Ignore storage failures.
  }
  return "system";
};

const resolveEffectiveTheme = (mode) => {
  const normalized = normalizeThemeMode(mode);
  if (normalized === "system") {
    return systemThemeQuery.matches ? "dark" : "light";
  }
  return normalized;
};

let activeThemeMode = readSavedThemeMode();

const applyThemeMode = (
  mode,
  { persist = true, refresh = true, emit = true } = {}
) => {
  activeThemeMode = normalizeThemeMode(mode);
  const effectiveTheme = resolveEffectiveTheme(activeThemeMode);
  document.body.classList.toggle("theme-dark", effectiveTheme === "dark");

  if (persist) {
    try {
      localStorage.setItem(THEME_MODE_KEY, activeThemeMode);
      localStorage.setItem(LEGACY_THEME_KEY, effectiveTheme);
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  if (emit) {
    window.dispatchEvent(new CustomEvent("comic:theme-updated", {
      detail: {
        mode: activeThemeMode,
        effectiveTheme
      }
    }));
  }

  if (refresh) {
    ScrollTrigger.refresh();
  }

  return effectiveTheme;
};

window.comicTheme = {
  getMode: () => activeThemeMode,
  getEffectiveTheme: () => resolveEffectiveTheme(activeThemeMode),
  setMode: (mode, options) => applyThemeMode(mode, options),
  applyThemeMode
};

// Apply saved mode once before chapter timelines initialize.
applyThemeMode(activeThemeMode, {
  persist: false,
  refresh: false,
  emit: false
});

const handleSystemThemeChange = () => {
  if (activeThemeMode !== "system") return;
  applyThemeMode("system", {
    persist: false,
    refresh: true,
    emit: true
  });
};

if (systemThemeQuery.addEventListener) {
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);
} else if (systemThemeQuery.addListener) {
  systemThemeQuery.addListener(handleSystemThemeChange);
}

document.addEventListener("DOMContentLoaded", () => {
  const themeModeSelect = document.querySelector("#theme-mode-select");
  const themeModeIcon = document.querySelector("#theme-mode-icon");
  if (!themeModeSelect) return;

  const buildLightBurstPath = () => {
    const centerX = 12;
    const centerY = 12;
    const spikes = 10;
    const points = [];

    for (let i = 0; i < spikes * 2; i += 1) {
      const outerPoint = i % 2 === 0;
      const baseRadius = outerPoint
        ? gsap.utils.random(8.4, 10.2)
        : gsap.utils.random(4.6, 6.2);
      const angle = (-Math.PI / 2) + ((i * Math.PI) / spikes) + gsap.utils.random(-0.085, 0.085);
      const x = centerX + (Math.cos(angle) * baseRadius);
      const y = centerY + (Math.sin(angle) * baseRadius);
      points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }

    return `${points.join(" ")} Z`;
  };

  const buildSystemFlamePath = (cx, cy, scale = 1, wobble = 0) => {
    const height = (2.62 * scale) + gsap.utils.random(-0.20, 0.24);
    const width = (1.86 * scale) + gsap.utils.random(-0.12, 0.16);
    const lean = wobble + gsap.utils.random(-0.34, 0.34);

    const tipX = cx + lean;
    const tipY = cy - (height * 0.98);
    const radiusX = width * 0.84;
    const radiusY = height * 0.60;
    const bodyCenterY = cy + (height * 0.26);
    const rightX = cx + radiusX + (lean * 0.10);
    const leftX = cx - radiusX + (lean * 0.10);
    const neckY = cy - (height * 0.08);
    const rightShoulderX = cx + (width * 0.42) + (lean * 0.18);
    const leftShoulderX = cx - (width * 0.42) + (lean * 0.18);
    const shoulderY = cy - (height * 0.58);

    return `M ${tipX.toFixed(2)} ${tipY.toFixed(2)} C ${rightShoulderX.toFixed(2)} ${shoulderY.toFixed(2)} ${rightX.toFixed(2)} ${neckY.toFixed(2)} ${rightX.toFixed(2)} ${bodyCenterY.toFixed(2)} A ${radiusX.toFixed(2)} ${radiusY.toFixed(2)} 0 1 1 ${leftX.toFixed(2)} ${bodyCenterY.toFixed(2)} C ${leftX.toFixed(2)} ${neckY.toFixed(2)} ${leftShoulderX.toFixed(2)} ${shoulderY.toFixed(2)} ${tipX.toFixed(2)} ${tipY.toFixed(2)} Z`;
  };

  const getModeIconMarkup = (mode) => {
    const normalized = normalizeThemeMode(mode);
    if (normalized === "dark") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g class="theme-bomb-follow-lines">
            <path class="theme-bomb-follow-line theme-bomb-follow-line--a"></path>
            <path class="theme-bomb-follow-line theme-bomb-follow-line--b"></path>
          </g>
          <g class="theme-bomb-core">
            <circle class="theme-bomb-fill" cx="12" cy="14" r="6"></circle>
            <path class="theme-bomb-wick" d="M12 8.5 L12 7.2 Q12 5.8 11 4.3"></path>
            <rect class="theme-bomb-fill" x="10.2" y="8.6" width="3.6" height="2.5" rx="0.4"></rect>
            <circle class="theme-bomb-spark theme-bomb-spark--anim" cx="10.4" cy="3.8" r="1.3"></circle>
          </g>
        </svg>
      `;
    }
    if (normalized === "light") {
      return `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g class="theme-pow-emphasis">
            <line class="theme-pow-action theme-pow-action--1" x1="12" y1="1.8" x2="12" y2="-1.0"></line>
            <line class="theme-pow-action theme-pow-action--2" x1="20.2" y1="6.6" x2="22.7" y2="5.2"></line>
            <line class="theme-pow-action theme-pow-action--3" x1="22.0" y1="14.5" x2="24.5" y2="14.9"></line>
            <line class="theme-pow-action theme-pow-action--4" x1="18.8" y1="20.8" x2="20.9" y2="22.5"></line>
            <line class="theme-pow-action theme-pow-action--5" x1="5.2" y1="20.6" x2="3.1" y2="22.4"></line>
            <line class="theme-pow-action theme-pow-action--6" x1="2.2" y1="12.9" x2="-0.4" y2="12.9"></line>
            <path class="theme-pow-cloud theme-pow-cloud--1" d="M3.9 18.1 C3.4 17.7 3.5 16.9 4.1 16.6 C4.1 15.8 4.9 15.2 5.8 15.4 C6.2 14.7 7.2 14.6 7.8 15.2 C8.6 15 9.3 15.7 9.3 16.5 C9.9 16.8 10.1 17.6 9.7 18.1 C9.5 18.8 8.9 19.3 8.1 19.3 H5.2 C4.5 19.3 3.9 18.8 3.9 18.1 Z"></path>
            <path class="theme-pow-cloud theme-pow-cloud--2" d="M15.6 17.2 C15.2 16.8 15.2 16 15.8 15.7 C15.8 15 16.5 14.5 17.3 14.6 C17.6 14 18.5 13.9 19 14.4 C19.8 14.2 20.5 14.8 20.5 15.5 C21 15.8 21.1 16.5 20.8 17 C20.6 17.6 20 18 19.3 18 H16.9 C16.3 18 15.8 17.7 15.6 17.2 Z"></path>
            <path class="theme-pow-cloud theme-pow-cloud--3" d="M8.8 21.2 C8.2 20.7 8.3 19.7 9 19.3 C9 18.3 10 17.6 11 17.8 C11.5 16.9 12.8 16.7 13.6 17.4 C14.7 17.1 15.7 17.9 15.7 19 C16.4 19.4 16.6 20.3 16.1 21 C15.8 21.8 15.1 22.3 14.2 22.3 H10.5 C9.7 22.3 9 21.8 8.8 21.2 Z"></path>
          </g>
          <path class="theme-pow-shape" d="${buildLightBurstPath()}"></path>
        </svg>
      `;
    }
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g class="theme-wick-ash">
          <path class="theme-wick-ash-trail" d="M19 4 Q14.8 5.5 12 9 Q9 13 5 17"></path>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--1" x="17.5" y="4.1" width="1.08" height="1.08" rx="0.22"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--2" x="16.2" y="5.2" width="0.98" height="0.98" rx="0.20"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--3" x="15.0" y="6.3" width="1.02" height="1.02" rx="0.20"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--4" x="13.5" y="7.7" width="0.96" height="0.96" rx="0.20"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--5" x="12.3" y="8.9" width="1.04" height="1.04" rx="0.20"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--6" x="10.8" y="10.2" width="0.98" height="0.98" rx="0.20"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--7" x="9.2" y="11.8" width="1.02" height="1.02" rx="0.20"></rect>
          <rect class="theme-wick-ash-bit theme-wick-ash-bit--8" x="7.5" y="13.6" width="1.10" height="1.10" rx="0.22"></rect>
        </g>
        <path class="theme-wick-only" d="M19 4 Q14.8 5.5 12 9 Q9 13 5 17"></path>
        <path class="theme-wick-flame theme-wick-flame--outer" d="${buildSystemFlamePath(19.5, 4.2, 1.62, 0)}"></path>
        <path class="theme-wick-flame theme-wick-flame--inner" d="${buildSystemFlamePath(19.4, 4.35, 0.96, 0)}"></path>
        <g class="theme-wick-emphasis">
          <g class="theme-wick-alert theme-wick-alert--1" transform="translate(-0.6 13.0)">
            <line x1="0" y1="-2.0" x2="0" y2="1.1"></line>
            <circle cx="0" cy="2.4" r="0.46"></circle>
          </g>
          <g class="theme-wick-alert theme-wick-alert--2" transform="translate(8.5 1.2)">
            <line x1="0" y1="-2.1" x2="0" y2="1.0"></line>
            <circle cx="0" cy="2.3" r="0.46"></circle>
          </g>
          <g class="theme-wick-alert theme-wick-alert--3" transform="translate(20.1 19.0)">
            <line x1="0" y1="-2.0" x2="0" y2="1.1"></line>
            <circle cx="0" cy="2.4" r="0.46"></circle>
          </g>
        </g>
      </svg>
    `;
  };

  const playModeIconAnimation = (mode) => {
    if (!themeModeIcon) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    if (themeModeIcon._iconAnim) {
      themeModeIcon._iconAnim.kill();
      themeModeIcon._iconAnim = null;
    }

    const svg = themeModeIcon.querySelector("svg");
    if (!svg) return;
    const normalized = normalizeThemeMode(mode);

    if (normalized === "dark") {
      const bombCore = themeModeIcon.querySelector(".theme-bomb-core");
      const spark = themeModeIcon.querySelector(".theme-bomb-spark--anim");
      const fillParts = Array.from(themeModeIcon.querySelectorAll(".theme-bomb-fill"));
      const lineA = themeModeIcon.querySelector(".theme-bomb-follow-line--a");
      const lineB = themeModeIcon.querySelector(".theme-bomb-follow-line--b");
      if (!bombCore || !spark || !lineA || !lineB || fillParts.length === 0) return;

      const state = {
        rotation: 0,
        x: 0,
        scale: 1
      };

      const setFollowLines = (rotation, scaleValue) => {
        const leanStrength = Math.abs(rotation);
        if (leanStrength < 3) {
          gsap.set([lineA, lineB], { autoAlpha: 0 });
          return;
        }

        const sign = rotation >= 0 ? 1 : -1;
        const cx = 12;
        const cy = 14;
        const visualRadius = 6 * scaleValue;
        const gap = 1.1;
        const sideAnchor = cx + (sign * (visualRadius + gap));
        const bend = 1.7 + (leanStrength * 0.03);

        const buildCurvePath = (distance, halfHeight) => {
          const x = sideAnchor + (sign * distance);
          const cpx = x + (sign * bend);
          const topY = cy - halfHeight;
          const bottomY = cy + halfHeight;
          return `M ${x.toFixed(2)} ${topY.toFixed(2)} Q ${cpx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${bottomY.toFixed(2)}`;
        };

        lineA.setAttribute("d", buildCurvePath(1.1, 3.05));
        lineB.setAttribute("d", buildCurvePath(2.5, 2.45));

        gsap.set([lineA, lineB], {
          autoAlpha: Math.min(1, 0.28 + (leanStrength / 18)),
          x: 0,
          y: 0
        });
      };

      const applyBombState = () => {
        gsap.set(bombCore, {
          x: state.x,
          rotation: state.rotation,
          scale: state.scale,
          transformOrigin: "50% 62%"
        });
        setFollowLines(state.rotation, state.scale);
      };

      gsap.set(bombCore, {
        x: 0,
        rotation: 0,
        scale: 1,
        transformOrigin: "50% 62%"
      });
      gsap.set([lineA, lineB], { autoAlpha: 0 });
      gsap.set(spark, {
        autoAlpha: 1,
        scale: 1,
        transformOrigin: "50% 50%",
        attr: { cx: 10.4, cy: 3.8 }
      });
      gsap.set(fillParts, { fill: "#0b0b0d" });

      themeModeIcon._iconAnim = gsap.timeline({
        defaults: { ease: "none" },
        onUpdate: applyBombState,
        onComplete: () => {
          state.rotation = 0;
          state.x = 0;
          state.scale = 1;
          applyBombState();
          gsap.set(fillParts, { fill: "#0b0b0d" });
          gsap.set(spark, { autoAlpha: 1, scale: 1, attr: { cx: 10.4, cy: 3.8 } });
          gsap.set([lineA, lineB], { autoAlpha: 0 });
          themeModeIcon._iconAnim = null;
        }
      });

      // Dramatic side-to-side shake.
      let shakeAt = 0.08;
      for (let i = 0; i < 16; i += 1) {
        const sign = i % 2 === 0 ? -1 : 1;
        const rotAmount = i < 10 ? 19 : 14;
        themeModeIcon._iconAnim.to(state, {
          rotation: sign * rotAmount,
          x: sign * 2.0,
          duration: 0.14,
          ease: "power1.inOut"
        }, shakeAt);
        shakeAt += 0.14;
      }
      themeModeIcon._iconAnim.to(state, {
        rotation: 0,
        x: 0,
        duration: 0.48,
        ease: "elastic.out(1, 0.42)"
      }, shakeAt);

      // 3 aggressive scale pulses; red at each peak.
      const pulseStarts = [0.56, 1.50, 2.44];
      pulseStarts.forEach((start) => {
        themeModeIcon._iconAnim
          .to(state, { scale: 1.34, duration: 0.22, ease: "power2.out" }, start)
          .to(fillParts, { fill: "#e11d48", duration: 0.06, ease: "none" }, start + 0.14)
          .to(state, { scale: 0.92, duration: 0.18, ease: "power2.inOut" }, start + 0.22)
          .to(fillParts, { fill: "#0b0b0d", duration: 0.14, ease: "none" }, start + 0.28)
          .to(state, { scale: 1.06, duration: 0.12, ease: "power1.out" }, start + 0.40)
          .to(state, { scale: 1.0, duration: 0.16, ease: "power1.out" }, start + 0.52);
      });

      themeModeIcon._iconAnim
        .to(spark, { scale: 1.55, duration: 0.10 }, 0.30)
        .to(spark, { attr: { cx: 11.5, cy: 4.7 }, duration: 0.44 }, 0.44)
        .to(spark, { attr: { cx: 10.9, cy: 4.2 }, autoAlpha: 0.62, duration: 0.48 }, 0.92)
        .to(spark, { attr: { cx: 11.8, cy: 5.2 }, autoAlpha: 1, duration: 0.44 }, 1.44)
        .to(spark, { attr: { cx: 10.4, cy: 3.8 }, scale: 1, autoAlpha: 1, duration: 0.62 }, 2.04);

      themeModeIcon._iconAnim.to({}, { duration: 0.34 }, 4.20);
      return;
    }

    if (normalized === "light") {
      const burstPath = themeModeIcon.querySelector(".theme-pow-shape");
      const clouds = Array.from(themeModeIcon.querySelectorAll(".theme-pow-cloud"));
      if (!burstPath) return;

      gsap.set(svg, {
        scale: 1,
        x: 0,
        rotation: 0,
        transformOrigin: "50% 50%"
      });
      gsap.set(burstPath, {
        rotation: 0,
        transformOrigin: "50% 50%"
      });
      gsap.set(clouds, {
        autoAlpha: 0,
        x: 0,
        y: 0,
        scale: 0.44,
        transformOrigin: "50% 50%"
      });

      themeModeIcon._iconAnim = gsap.timeline({
        defaults: { ease: "none" },
        onComplete: () => {
          burstPath.setAttribute("d", buildLightBurstPath());
          gsap.set(svg, { scale: 1, x: 0, rotation: 0 });
          gsap.set(burstPath, { rotation: 0 });
          gsap.set(clouds, { autoAlpha: 0, x: 0, y: 0, scale: 0.44 });
          themeModeIcon._iconAnim = null;
        }
      });

      const morphStart = 0.48;
      const morphEnd = 2.42;
      const morphSteps = 16;
      for (let i = 0; i <= morphSteps; i += 1) {
        const at = morphStart + ((morphEnd - morphStart) * (i / morphSteps));
        themeModeIcon._iconAnim.add(() => {
          burstPath.setAttribute("d", buildLightBurstPath());
        }, at);
      }

      themeModeIcon._iconAnim
        // scale up and hold large while the puff dissipates behind it
        .to(svg, { scale: 1.62, duration: 0.46, ease: "back.out(2.6)" }, 0.04)
        .to(svg, { scale: 1.58, duration: 1.98, ease: "none" }, 0.50)
        .to(burstPath, { rotation: -5, duration: 0.32, ease: "sine.inOut" }, 0.62)
        .to(burstPath, { rotation: 4, duration: 0.30, ease: "sine.inOut" }, 1.02)
        .to(burstPath, { rotation: -3, duration: 0.28, ease: "sine.inOut" }, 1.40)
        .to(burstPath, { rotation: 2, duration: 0.26, ease: "sine.inOut" }, 1.74)
        .to(burstPath, { rotation: 0, duration: 0.30, ease: "sine.inOut" }, 2.06);

      [0.46, 0.58, 0.70, 0.84, 0.98, 1.12].forEach((start, index) => {
        const cloud = clouds[index % clouds.length];
        const driftX = (index % 2 === 0 ? -1 : 1) * (1.9 + (index * 0.24));
        const driftY = -3.5 - (index * 0.48);
        themeModeIcon._iconAnim
          .set(cloud, { autoAlpha: 0, x: 0, y: 0, scale: 0.46 }, start)
          .to(cloud, {
            autoAlpha: 0.95,
            scale: 1.18,
            duration: 0.24,
            ease: "power2.out"
          }, start)
          .to(cloud, {
            x: driftX,
            y: driftY,
            scale: 2.05,
            autoAlpha: 0,
            duration: 2.02,
            ease: "power1.out"
          }, start + 0.24);
      });

      // scale down and shift back into place like the bomb settle
      themeModeIcon._iconAnim
        .to(svg, { scale: 0.95, x: -1.8, rotation: -8, duration: 0.22, ease: "power1.inOut" }, 2.58)
        .to(svg, { scale: 1.07, x: 1.3, rotation: 5, duration: 0.20, ease: "power1.inOut" }, 2.80)
        .to(svg, { scale: 1.0, x: 0, rotation: 0, duration: 0.52, ease: "elastic.out(1, 0.42)" }, 3.00)
        .to({}, { duration: 0.20 }, 3.52);
      return;
    }

    const wick = themeModeIcon.querySelector(".theme-wick-only");
    const ashTrail = themeModeIcon.querySelector(".theme-wick-ash-trail");
    const ashBits = Array.from(themeModeIcon.querySelectorAll(".theme-wick-ash-bit"));
    const alertMarks = Array.from(themeModeIcon.querySelectorAll(".theme-wick-alert"));
    const flameOuter = themeModeIcon.querySelector(".theme-wick-flame--outer");
    const flameInner = themeModeIcon.querySelector(".theme-wick-flame--inner");
    if (!wick || !ashTrail || !flameOuter || !flameInner || alertMarks.length === 0) return;

    const flameState = {
      cx: 19.5,
      cy: 4.2,
      scale: 1.62,
      wobble: 0
    };
    const flameTrack = { progress: 0 };

    const applyFlameShape = () => {
      flameOuter.setAttribute(
        "d",
        buildSystemFlamePath(flameState.cx, flameState.cy, flameState.scale, flameState.wobble)
      );
      flameInner.setAttribute(
        "d",
        buildSystemFlamePath(flameState.cx - 0.08, flameState.cy + 0.28, flameState.scale * 0.58, flameState.wobble * 0.54)
      );
    };

    applyFlameShape();

    const burnLength = ashTrail.getTotalLength ? ashTrail.getTotalLength() : 24;
    const wickLength = wick.getTotalLength ? wick.getTotalLength() : burnLength;
    const ashLagProgress = 0.052;
    const setFlameOnWick = () => {
      if (!wick.getPointAtLength) return;
      const progress = gsap.utils.clamp(0, 1, flameTrack.progress);
      const point = wick.getPointAtLength(wickLength * progress);
      flameState.cx = point.x;
      flameState.cy = point.y;
      applyFlameShape();
    };
    const getBurnProgress = () => gsap.utils.clamp(0, 1, flameTrack.progress - ashLagProgress);
    const setBurnState = () => {
      const burnProgress = getBurnProgress();
      const burnedLength = burnLength * burnProgress;
      const remainingWick = Math.max(0.0001, burnLength - burnedLength);
      const visibleAsh = Math.max(0.0001, burnedLength);
      gsap.set(ashTrail, {
        autoAlpha: burnProgress > 0.004 ? 0.92 : 0,
        strokeDasharray: `${visibleAsh} ${burnLength}`,
        strokeDashoffset: 0
      });
      gsap.set(wick, {
        strokeDasharray: `${remainingWick} ${burnLength}`,
        strokeDashoffset: -burnedLength
      });
    };
    const setFlameAndBurn = () => {
      setFlameOnWick();
      setBurnState();
    };
    const getBurnTipPoint = () => {
      if (!wick.getPointAtLength) return { x: 10, y: 10 };
      const point = wick.getPointAtLength(wickLength * getBurnProgress());
      return { x: point.x, y: point.y };
    };
    const placeAshBitAtBurnTip = (bit) => {
      const tip = getBurnTipPoint();
      const bitW = parseFloat(bit.getAttribute("width")) || 1;
      const bitH = parseFloat(bit.getAttribute("height")) || 1;
      gsap.set(bit, {
        attr: {
          x: tip.x - (bitW / 2),
          y: tip.y - (bitH / 2)
        }
      });
    };

    setFlameAndBurn();

    gsap.set(wick, {
      stroke: "#fffdeb",
      strokeDasharray: burnLength,
      strokeDashoffset: 0,
      transformOrigin: "50% 50%"
    });
    gsap.set(ashTrail, {
      autoAlpha: 0,
      x: 0,
      y: 0,
      rotation: 0,
      strokeDasharray: `0 ${burnLength}`,
      strokeDashoffset: 0,
      transformOrigin: "50% 50%"
    });
    gsap.set(ashBits, {
      autoAlpha: 0,
      x: 0,
      y: 0,
      rotation: 0,
      scale: 0.96,
      transformOrigin: "50% 50%"
    });
    gsap.set(alertMarks, {
      autoAlpha: 0,
      scale: 0.90,
      transformOrigin: "50% 50%"
    });
    gsap.set([flameOuter, flameInner], {
      autoAlpha: 1,
      transformOrigin: "50% 70%"
    });

    themeModeIcon._iconAnim = gsap.timeline({
      defaults: { ease: "none" },
      repeat: 1,
      yoyo: true,
      repeatDelay: 0.12,
      onComplete: () => {
        themeModeIcon._iconAnim = null;
      }
    });

    themeModeIcon._iconAnim
      .to(flameTrack, {
        progress: 0.72,
        duration: 2.30,
        ease: "none",
        onUpdate: setFlameAndBurn
      }, 0.12)
      .to(flameState, {
        wobble: 0.46,
        duration: 0.12,
        repeat: 24,
        yoyo: true,
        ease: "sine.inOut",
        onUpdate: applyFlameShape
      }, 0.12)
      .to(flameState, {
        scale: 1.74,
        duration: 0.22,
        repeat: 11,
        yoyo: true,
        ease: "sine.inOut",
        onUpdate: applyFlameShape
      }, 0.14)
      .to([flameOuter, flameInner], {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power1.out"
      }, 2.62)
      .to({}, { duration: 0.40 }, 3.40);

    ashBits.forEach((bit, index) => {
      const start = 0.46 + (index * 0.24);
      themeModeIcon._iconAnim
        .add(() => placeAshBitAtBurnTip(bit), start)
        .set(bit, { autoAlpha: 0, x: 0, y: 0, rotation: 0, scale: 0.96 }, start)
        .to(bit, { autoAlpha: 1.0, scale: 1.34, duration: 0.10, ease: "none" }, start)
        .to(bit, {
          autoAlpha: 0,
          y: () => window.innerHeight * gsap.utils.random(0.82, 1.20),
          x: () => gsap.utils.random(-12, 12),
          rotation: () => gsap.utils.random(-220, 220),
          scale: () => gsap.utils.random(1.16, 2.05),
          duration: gsap.utils.random(1.42, 2.08),
          ease: "power2.in"
        }, start + 0.10);
    });

    alertMarks.forEach((mark, index) => {
      const start = 0.34 + (index * 0.10);
      themeModeIcon._iconAnim
        .to(mark, {
          autoAlpha: 0.96,
          scale: 1.08,
          duration: 0.30,
          repeat: 9,
          yoyo: true,
          ease: "sine.inOut"
        }, start)
        .to(mark, { autoAlpha: 0, duration: 0.24, ease: "power1.out" }, 3.08 + (index * 0.04));
    });

    themeModeIcon._iconAnim.timeScale(1.12);
  };

  const renderModeIcon = (mode) => {
    if (!themeModeIcon) return;
    const normalized = normalizeThemeMode(mode);
    const shouldRender = normalized === "light" || themeModeIcon.dataset.mode !== normalized;
    if (!shouldRender) return;
    themeModeIcon.dataset.mode = normalized;
    themeModeIcon.innerHTML = getModeIconMarkup(normalized);
    playModeIconAnimation(normalized);
  };

  const syncModeSelect = () => {
    const currentMode = window.comicTheme?.getMode?.() || "system";
    if (themeModeSelect.value !== currentMode) {
      themeModeSelect.value = currentMode;
    }
    renderModeIcon(currentMode);
  };

  syncModeSelect();
  themeModeSelect.addEventListener("change", () => {
    const selectedMode = normalizeThemeMode(themeModeSelect.value);
    if (window.comicTheme?.setMode) {
      window.comicTheme.setMode(selectedMode, {
        persist: true,
        refresh: true,
        emit: true
      });
    }
  });

  window.addEventListener("comic:theme-updated", syncModeSelect);
});
/* =========================================================
   HERO + CHAPTER 1 — pinned entrance on scroll
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector("#hero");
  const ch1 = document.querySelector("#chapter-1");
  const ch1Panels = document.querySelectorAll("#chapter-1 .panel");
  if (!hero || !ch1 || ch1Panels.length === 0) return;

  const title = hero.querySelector("h1");
  const sub = hero.querySelector("p");
  if (!title || !sub) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    gsap.set([title, sub], { clearProps: "all" });
    gsap.set(ch1Panels, { clearProps: "all" });
    return;
  }

  // Initial states
  gsap.set(title, { x: -80, autoAlpha: 0 });
  gsap.set(sub, { x: -60, autoAlpha: 0 });
  gsap.set(ch1Panels, { autoAlpha: 0, y: 24 });

  const tlIntro = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * 1.25),
      scrub: 1,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true
    }
  });

  tlIntro
    .to(title, {
      x: 0,
      autoAlpha: 1,
      duration: 0.75,
      ease: "none"
    }, 0)
    .to(sub, {
      x: 0,
      autoAlpha: 1,
      duration: 0.65,
      ease: "none"
    }, 0.22)
    .to(ch1Panels, {
      autoAlpha: 0.55,
      y: 0,
      stagger: 0.15,
      duration: 1.1,
      ease: "none"
    }, 0.42);
});

/* =========================================================
   CHAPTER 4 — title enters from top on scroll
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch4 = document.querySelector("#chapter-4");
  const ch5 = document.querySelector("#chapter-5");
  if (!ch4) return;

  const content = ch4.querySelector(".section__content");
  const titlePanel = ch4.querySelector(".panel:nth-child(1)");
  const stairPanel1 = content?.querySelector(".panel:nth-child(2)");
  const stairPanel2 = content?.querySelector(".panel:nth-child(3)");
  const stairPanel3 = content?.querySelector(".panel:nth-child(4)");
  const flipPanel = content?.querySelector(".panel:nth-child(7)");
  const fullViewPanel = content?.querySelector("#full-view-panel");
  const finalLine1 = fullViewPanel?.querySelector('[data-type="line-1"]');
  const finalLine2Prefix = fullViewPanel?.querySelector('[data-type="line-2-prefix"]');
  const finalLine2Word = fullViewPanel?.querySelector('[data-type="line-2-word"]');
  const finalFireworks = fullViewPanel?.querySelector(".ch4-fireworks");
  const finalOutlineLines = fullViewPanel?.querySelectorAll(".ch4-border-line");
  if (!titlePanel || !stairPanel1 || !stairPanel2 || !stairPanel3) return;

  const setupCh4TitleScrub = () => {
    const triggerId = "ch4-title-scrub";
    const existing = ScrollTrigger.getById(triggerId);
    if (existing) existing.kill();

    const startY = -420;
    gsap.set(titlePanel, { y: startY, autoAlpha: 0, force3D: true });

    ScrollTrigger.create({
      id: triggerId,
      trigger: ch4,
      start: "top bottom",
      end: "top 35%",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(titlePanel, {
          y: startY + ((0 - startY) * p),
          autoAlpha: p
        });
      },
      onLeaveBack: () => {
        gsap.set(titlePanel, { y: startY, autoAlpha: 0 });
      }
    });
  };

  const setupCh4StairPanels = () => {
    const triggerId = "ch4-stair-panels";
    const existing = ScrollTrigger.getById(triggerId);
    if (existing) existing.kill();

    const getOffscreenLeftX = (el) => {
      const rect = el.getBoundingClientRect();
      return -(rect.left + rect.width + 40);
    };

    gsap.set(stairPanel1, {
      x: () => getOffscreenLeftX(stairPanel1),
      y: -24,
      autoAlpha: 0,
      zIndex: 5,
      force3D: true
    });
    gsap.set(stairPanel2, {
      x: () => getOffscreenLeftX(stairPanel2),
      y: -32,
      autoAlpha: 0,
      zIndex: 6,
      force3D: true
    });
    gsap.set(stairPanel3, {
      x: () => getOffscreenLeftX(stairPanel3),
      y: -40,
      autoAlpha: 0,
      zIndex: 7,
      force3D: true
    });

    const tlStairs = gsap.timeline({
      scrollTrigger: {
        id: triggerId,
        trigger: stairPanel3,
        start: "bottom bottom",
        end: () => "+=" + Math.round(window.innerHeight * 1.9),
        scrub: 1,
        pin: ch4,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tlStairs
      .to(stairPanel1, {
        x: 0,
        y: 14,
        autoAlpha: 1,
        duration: 0.34,
        ease: "none"
      }, 0.00)
      .to(stairPanel1, {
        y: -6,
        duration: 0.22,
        ease: "none"
      }, 0.34)
      .to(stairPanel1, {
        y: 0,
        duration: 0.20,
        ease: "none"
      }, 0.56)

      .to(stairPanel2, {
        x: 0,
        y: 16,
        autoAlpha: 1,
        duration: 0.34,
        ease: "none"
      }, 0.80)
      .to(stairPanel2, {
        y: -7,
        duration: 0.22,
        ease: "none"
      }, 1.14)
      .to(stairPanel2, {
        y: 0,
        duration: 0.20,
        ease: "none"
      }, 1.36)

      .to(stairPanel3, {
        x: 0,
        y: 18,
        autoAlpha: 1,
        duration: 0.34,
        ease: "none"
      }, 1.60)
      .to(stairPanel3, {
        y: -8,
        duration: 0.22,
        ease: "none"
      }, 1.94)
      .to(stairPanel3, {
        y: 0,
        duration: 0.20,
        ease: "none"
      }, 2.16);
  };

  const setupCh4FlipPanel = () => {
    if (!flipPanel) return;

    const triggerId = "ch4-flip-panel";
    const existing = ScrollTrigger.getById(triggerId);
    if (existing) existing.kill();

    const getFlipPanelOffLeftX = () => {
      const rect = flipPanel.getBoundingClientRect();
      return -(window.innerWidth + rect.width + 24);
    };

    const getFlipPanelOffRightX = () => {
      const rect = flipPanel.getBoundingClientRect();
      return window.innerWidth + rect.width + 24;
    };

    const getFlipStart = () => {
      const stairTrigger = ScrollTrigger.getById("ch4-stair-panels");
      const stairEnd = Number(stairTrigger?.end);
      if (Number.isFinite(stairEnd)) {
        return stairEnd + Math.round(window.innerHeight * 0.06);
      }
      return Math.max(0, ScrollTrigger.maxScroll(window) * 0.45);
    };

    const getFlipEnd = () => {
      return getFlipStart() + Math.round(window.innerHeight * 1.35);
    };

    gsap.set(flipPanel, {
      transformPerspective: 1200,
      transformOrigin: "0% 50%",
      rotateY: -180,
      x: () => getFlipPanelOffLeftX(),
      y: 0,
      autoAlpha: 0,
      zIndex: 9
    });

    const tlFlip = gsap.timeline({
      scrollTrigger: {
        id: triggerId,
        trigger: ch4,
        start: () => getFlipStart(),
        end: () => getFlipEnd(),
        scrub: 1,
        invalidateOnRefresh: true
      }
    });

    tlFlip
      .set(flipPanel, {
        transformOrigin: "0% 50%"
      }, 0)
      .to(flipPanel, {
        rotateY: 0,
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        ease: "none"
      }, 0.02)
      .to(flipPanel, {
        rotateY: 0,
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: 0.38,
        ease: "none"
      }, 0.50)
      .set(flipPanel, {
        transformOrigin: "100% 50%"
      }, 0.90)
      .to(flipPanel, {
        rotateY: 180,
        x: () => getFlipPanelOffRightX(),
        y: 0,
        autoAlpha: 0,
        duration: 0.34,
        ease: "none"
      }, 0.92);
  };

  const addTypewriterTween = (timeline, target, duration, at) => {
    const fullText = target.dataset.fullText || target.textContent || "";
    target.dataset.fullText = fullText;

    const state = { chars: 0 };

    timeline.to(state, {
      chars: fullText.length,
      duration,
      ease: "none",
      onStart: () => {
        target.textContent = "";
      },
      onUpdate: () => {
        target.textContent = fullText.slice(0, Math.floor(state.chars));
      },
      onComplete: () => {
        target.textContent = fullText;
      },
      onReverseComplete: () => {
        target.textContent = "";
      }
    }, at);
  };

  const buildFinalFireworkSparks = () => {
    if (!finalFireworks) return { allSparks: [], waves: [] };

    finalFireworks.innerHTML = "";

    const palette = [
      "var(--accent-primary)",
      "var(--accent-secondary)",
      "var(--accent-highlight)",
      "var(--red__red50)",
      "var(--red__red70)",
      "var(--yellow__yellow40)",
      "var(--yellow__yellow60)",
      "var(--blue__blue40)",
      "var(--blue__blue60)"
    ];

    const waveCount = 8;
    const burstsPerWave = 4;
    const bottomLeftBurstsPerWave = 1;
    const sparksPerBurst = 20;
    const waves = [];
    const allSparks = [];

    for (let wave = 0; wave < waveCount; wave += 1) {
      const waveSparks = [];

      for (let burst = 0; burst < burstsPerWave; burst += 1) {
        const center = {
          x: gsap.utils.random(8, 92),
          y: gsap.utils.random(10, 90)
        };

        for (let i = 0; i < sparksPerBurst; i += 1) {
          const spark = document.createElement("span");
          spark.className = "ch4-firework-spark";
          spark.style.left = `${center.x}%`;
          spark.style.top = `${center.y}%`;
          spark.style.backgroundColor = palette[(wave * burstsPerWave * sparksPerBurst + burst * sparksPerBurst + i) % palette.length];

          const angle = gsap.utils.random(0, Math.PI * 2);
          const radius = gsap.utils.random(48, 220);
          spark.dataset.tx = String(Math.cos(angle) * radius);
          spark.dataset.ty = String(Math.sin(angle) * radius);
          spark.dataset.rot = String(gsap.utils.random(-360, 360));
          spark.dataset.endScale = String(gsap.utils.random(0.12, 0.5));
          spark.dataset.wave = String(wave);

          finalFireworks.appendChild(spark);
          waveSparks.push(spark);
          allSparks.push(spark);
        }
      }

      // Add a few dedicated bursts in the bottom-left quadrant.
      for (let burst = 0; burst < bottomLeftBurstsPerWave; burst += 1) {
        const center = {
          x: gsap.utils.random(8, 24),
          y: gsap.utils.random(72, 92)
        };

        for (let i = 0; i < sparksPerBurst; i += 1) {
          const spark = document.createElement("span");
          spark.className = "ch4-firework-spark";
          spark.style.left = `${center.x}%`;
          spark.style.top = `${center.y}%`;
          spark.style.backgroundColor = palette[(wave * (burstsPerWave + bottomLeftBurstsPerWave) * sparksPerBurst + burstsPerWave * sparksPerBurst + i) % palette.length];

          const angle = gsap.utils.random(0, Math.PI * 2);
          const radius = gsap.utils.random(52, 220);
          spark.dataset.tx = String(Math.cos(angle) * radius);
          spark.dataset.ty = String(Math.sin(angle) * radius);
          spark.dataset.rot = String(gsap.utils.random(-360, 360));
          spark.dataset.endScale = String(gsap.utils.random(0.12, 0.5));
          spark.dataset.wave = String(wave);

          finalFireworks.appendChild(spark);
          waveSparks.push(spark);
          allSparks.push(spark);
        }
      }

      waves.push(waveSparks);
    }

    return { allSparks, waves };
  };

  const setupCh4FinalPanel = () => {
    if (
      !fullViewPanel ||
      !finalLine1 ||
      !finalLine2Prefix ||
      !finalLine2Word ||
      !finalFireworks ||
      !finalOutlineLines ||
      finalOutlineLines.length !== 4
    ) return;

    const triggerId = "ch4-final-panel";
    const existing = ScrollTrigger.getById(triggerId);
    if (existing) existing.kill();

    // Render fireworks at chapter level so bursts happen outside the panel bounds.
    if (finalFireworks.parentElement !== ch4) {
      ch4.appendChild(finalFireworks);
    }

    const { allSparks, waves } = buildFinalFireworkSparks();

    const [lineTop, lineRight, lineBottom, lineLeft] = finalOutlineLines;

    const getFullPanelCenterStart = () => {
      const rect = fullViewPanel.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      return Math.max(0, scrollTop + rect.top + (rect.height * 0.5) - (window.innerHeight * 0.5));
    };

    const getFinalStart = () => {
      const flipTrigger = ScrollTrigger.getById("ch4-flip-panel");
      const flipEnd = Number(flipTrigger?.end);
      const centerStart = getFullPanelCenterStart();
      if (Number.isFinite(flipEnd)) {
        return Math.max(centerStart, flipEnd + Math.round(window.innerHeight * 0.04));
      }
      return centerStart;
    };

    const getFinalEnd = () => {
      return getFinalStart() + Math.round(window.innerHeight * 2.05);
    };

    const resetFinalPanelVisuals = () => {
      gsap.set(fullViewPanel, {
        autoAlpha: 0,
        y: 0,
        scale: 1,
        zIndex: 80,
        transformOrigin: "50% 50%"
      });

      gsap.set([lineTop, lineBottom], {
        scaleX: 0,
        transformOrigin: "0% 50%",
        autoAlpha: 1
      });

      gsap.set([lineRight, lineLeft], {
        scaleY: 0,
        transformOrigin: "50% 0%",
        autoAlpha: 1
      });

      gsap.set(finalLine2Word, {
        scale: 1,
        transformOrigin: "50% 70%"
      });

      gsap.set(finalFireworks, {
        autoAlpha: 0
      });

      gsap.set(allSparks, {
        x: 0,
        y: 0,
        rotation: 0,
        autoAlpha: 0,
        scale: 0.06
      });
    };

    const resetFinalPanelText = () => {
      [finalLine1, finalLine2Prefix, finalLine2Word].forEach((line) => {
        line.textContent = "";
      });
    };

    resetFinalPanelVisuals();
    resetFinalPanelText();

    const tlFinal = gsap.timeline({
      scrollTrigger: {
        id: triggerId,
        trigger: ch4,
        start: () => getFinalStart(),
        end: () => getFinalEnd(),
        scrub: 1,
        pin: ch4,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => {
          resetFinalPanelVisuals();
          resetFinalPanelText();
        }
      }
    });

    tlFinal
      .to(fullViewPanel, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.04,
        ease: "none"
      }, 0.00)
      .to(ch4, {
        backgroundColor: () => {
          const ch5Bg = ch5 ? getComputedStyle(ch5).backgroundColor : "";
          if (ch5Bg && ch5Bg !== "rgba(0, 0, 0, 0)" && ch5Bg !== "transparent") {
            return ch5Bg;
          }
          const docStyles = getComputedStyle(document.body);
          const themedGray = docStyles.getPropertyValue("--chapter-transition-gray").trim();
          if (themedGray) return themedGray;
          return "rgb(82, 82, 82)";
        },
        duration: 3.2,
        ease: "none"
      }, 0.48)
      .to(lineTop, {
        scaleX: 1,
        duration: 0.12,
        ease: "none"
      }, 0.02)
      .to(lineRight, {
        scaleY: 1,
        duration: 0.10,
        ease: "none"
      }, 0.14)
      .to(lineBottom, {
        scaleX: 1,
        duration: 0.12,
        ease: "none"
      }, 0.24)
      .to(lineLeft, {
        scaleY: 1,
        duration: 0.10,
        ease: "none"
      }, 0.36);

    const fireworksStart = 1.20;
    const fireworksWaveGap = 0.55;
    const fireworksTravelDuration = 0.44;

    tlFinal.to(finalFireworks, {
      autoAlpha: 1,
      duration: 0.02,
      ease: "none"
    }, fireworksStart);

    waves.forEach((waveSparks, waveIndex) => {
      const waveStart = fireworksStart + (waveIndex * fireworksWaveGap);

      tlFinal
        .set(waveSparks, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 0.06,
          autoAlpha: 0
        }, waveStart - 0.02)
        .to(waveSparks, {
          autoAlpha: 0.95,
          scale: 1,
          duration: 0.08,
          stagger: {
            each: 0.0018,
            from: "random"
          },
          ease: "none"
        }, waveStart)
        .to(waveSparks, {
          x: (index, spark) => Number(spark.dataset.tx || 0),
          y: (index, spark) => Number(spark.dataset.ty || 0),
          rotation: (index, spark) => Number(spark.dataset.rot || 0),
          scale: (index, spark) => Number(spark.dataset.endScale || 0.2),
          autoAlpha: 0,
          duration: fireworksTravelDuration,
          stagger: {
            each: 0.0018,
            from: "random"
          },
          ease: "none"
        }, waveStart + 0.08);
    });

    // Pulse "everything" while fireworks explode.
    waves.forEach((_, waveIndex) => {
      const pulseStart = fireworksStart + (waveIndex * fireworksWaveGap);

      tlFinal
        .to(finalLine2Word, {
          scale: 1.24,
          duration: 0.12,
          ease: "none"
        }, pulseStart)
        .to(finalLine2Word, {
          scale: 0.92,
          duration: 0.12,
          ease: "none"
        }, pulseStart + 0.12)
        .to(finalLine2Word, {
          scale: 1,
          duration: 0.14,
          ease: "none"
        }, pulseStart + 0.24);
    });

    const fireworksEnd = fireworksStart + ((waves.length - 1) * fireworksWaveGap) + fireworksTravelDuration + 0.14;
    tlFinal.to(finalFireworks, {
      autoAlpha: 0,
      duration: 0.08,
      ease: "none"
    }, fireworksEnd);

    addTypewriterTween(tlFinal, finalLine1, 0.34, 0.24);
    addTypewriterTween(tlFinal, finalLine2Prefix, 0.24, 0.60);
    addTypewriterTween(tlFinal, finalLine2Word, 0.22, 0.84);
  };

  const lightPortal = ch4.querySelector('.character-portal[data-portal="light"]');
  const darkPortal = ch4.querySelector('.character-portal[data-portal="dark"]');

  const getPortalParts = (portal) => {
    if (!portal) return null;
    return {
      root: portal,
      button: portal.querySelector(".portal-button"),
      figure: portal.querySelector(".stick-figure"),
      hole: portal.querySelector(".portal-hole")
    };
  };

  const portalParts = {
    light: getPortalParts(lightPortal),
    dark: getPortalParts(darkPortal)
  };

  const hasPortalParts =
    portalParts.light &&
    portalParts.dark &&
    portalParts.light.button &&
    portalParts.dark.button &&
    portalParts.light.figure &&
    portalParts.dark.figure &&
    portalParts.light.hole &&
    portalParts.dark.hole;

  const syncChapter4ThemeVisuals = () => {
    // Clear inline colors so Chapter 4 always resolves from active theme tokens.
    gsap.set(ch4, { clearProps: "backgroundColor" });
    if (fullViewPanel) {
      gsap.set(fullViewPanel, { clearProps: "backgroundColor,borderColor" });
    }

    const stickHeads = ch4.querySelectorAll(".stick-head");
    if (stickHeads.length) {
      gsap.set(stickHeads, { clearProps: "fill,stroke" });
    }

    const finalTrigger = ScrollTrigger.getById("ch4-final-panel");
    if (finalTrigger?.animation) {
      const progress = finalTrigger.animation.progress();
      finalTrigger.animation.invalidate();
      finalTrigger.animation.progress(progress);
    }
  };

  const setTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    if (window.comicTheme?.setMode) {
      window.comicTheme.setMode(nextTheme, {
        persist: true,
        refresh: false,
        emit: true
      });
    } else {
      document.body.classList.toggle("theme-dark", nextTheme === "dark");
    }
    syncChapter4ThemeVisuals();
    ScrollTrigger.refresh();
  };

  const getEffectiveTheme = () => {
    if (window.comicTheme?.getEffectiveTheme) {
      return window.comicTheme.getEffectiveTheme();
    }
    return document.body.classList.contains("theme-dark") ? "dark" : "light";
  };

  const setPortalRestState = (parts, active) => {
    parts.root.classList.toggle("is-active", active);
    parts.root.classList.toggle("is-inactive", !active);
    parts.button.disabled = !active;

    gsap.set(parts.hole, {
      autoAlpha: 0,
      scaleX: 0.74,
      scaleY: 0.68
    });

    gsap.set(parts.figure, {
      autoAlpha: active ? 1 : 0,
      y: active ? 0 : 92,
      scaleX: active ? 1 : 1.08,
      scaleY: active ? 1 : 0.82,
      transformOrigin: "50% 100%"
    });
  };

  syncChapter4ThemeVisuals();

  if (hasPortalParts) {
    let activePortal = getEffectiveTheme() === "dark" ? "dark" : "light";
    let isSwapping = false;

    const syncPortalStates = () => {
      setPortalRestState(portalParts.light, activePortal === "light");
      setPortalRestState(portalParts.dark, activePortal === "dark");
    };

    const runPortalSwap = () => {
      if (isSwapping) return;

      isSwapping = true;
      const fromName = activePortal;
      const toName = fromName === "light" ? "dark" : "light";
      const from = portalParts[fromName];
      const to = portalParts[toName];

      from.button.disabled = true;
      to.button.disabled = true;

      const tlSwap = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => {
          activePortal = toName;
          syncPortalStates();
          isSwapping = false;
        }
      });

      tlSwap
        .set(to.figure, {
          autoAlpha: 0,
          y: 26,
          scaleX: 0.46,
          scaleY: 0.1,
          transformOrigin: "50% 100%"
        })
        .set(to.hole, { autoAlpha: 0, scaleX: 0.74, scaleY: 0.68 })

        // active character squashes before jumping
        .to(from.figure, {
          y: 12,
          scaleX: 1.12,
          scaleY: 0.86,
          duration: 0.12
        }, 0)
        .to(from.hole, {
          autoAlpha: 0.95,
          scaleX: 1.1,
          scaleY: 1.18,
          duration: 0.12
        }, 0)

        // launch and fall into hole
        .to(from.figure, {
          y: -62,
          scaleX: 0.88,
          scaleY: 1.14,
          duration: 0.24,
          ease: "power2.out"
        }, 0.12)
        .to(from.figure, {
          y: 22,
          scaleX: 0.4,
          scaleY: 0.06,
          autoAlpha: 1,
          duration: 0.28,
          ease: "power2.in"
        }, 0.36)
        .to(from.hole, {
          scaleX: 1.26,
          scaleY: 1.34,
          autoAlpha: 1,
          duration: 0.24
        }, 0.36)
        .to(from.hole, {
          autoAlpha: 0,
          scaleX: 0.74,
          scaleY: 0.68,
          duration: 0.18
        }, 0.52)
        .set(from.figure, {
          autoAlpha: 0,
          y: 92,
          scaleX: 1.08,
          scaleY: 0.82
        }, 0.64)

        // other character jumps out and lands with squash/stretch
        .to(to.figure, {
          y: -56,
          autoAlpha: 1,
          scaleX: 0.9,
          scaleY: 1.13,
          duration: 0.26,
          ease: "power2.out"
        }, 0.56)
        .to(to.figure, {
          y: 8,
          scaleX: 1.12,
          scaleY: 0.86,
          duration: 0.18,
          ease: "power2.in"
        }, 0.82)
        .to(to.figure, {
          y: -10,
          scaleX: 0.97,
          scaleY: 1.06,
          duration: 0.14,
          ease: "power1.out"
        }, 1.00)
        .to(to.figure, {
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.16,
          ease: "power1.out"
        }, 1.14)

        // theme changes when destination character lands
        .add(() => {
          setTheme(toName === "dark" ? "dark" : "light");
        }, 1.14);
    };

    syncPortalStates();
    portalParts.light.button.addEventListener("click", () => {
      if (activePortal !== "light") return;
      runPortalSwap();
    });
    portalParts.dark.button.addEventListener("click", () => {
      if (activePortal !== "dark") return;
      runPortalSwap();
    });

    window.addEventListener("comic:theme-updated", (event) => {
      syncChapter4ThemeVisuals();
      if (isSwapping) return;
      const effectiveTheme = event?.detail?.effectiveTheme || getEffectiveTheme();
      const nextPortal = effectiveTheme === "dark" ? "dark" : "light";
      if (activePortal === nextPortal) return;
      activePortal = nextPortal;
      syncPortalStates();
    });
  }

  // Defer creation until other chapter triggers (including pinned ones) are registered.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setupCh4TitleScrub();
      setupCh4StairPanels();
      setupCh4FlipPanel();
      setupCh4FinalPanel();
      ScrollTrigger.refresh();
    });
  });
});


/* =========================================================
   CHAPTER 5 — panel 2 fade-in, then title slam/clatter
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch5 = document.querySelector("#chapter-5");
  if (!ch5) return;

  const content = ch5.querySelector(".section__content");
  const titlePanel = content?.querySelector(".panel:nth-child(1)");
  const introPanel = content?.querySelector(".panel:nth-child(2)");
  const blackoutSection = document.querySelector("#chapter-5-blackout");
  const blackoutPanel = blackoutSection?.querySelector("#blackout");
  const blackoutSeedLines = blackoutPanel
    ? Array.from(blackoutPanel.querySelectorAll(".repeat-text"))
    : [];
  const tiltedPanels = [
    content?.querySelector(".panel:nth-child(3)"),
    content?.querySelector(".panel:nth-child(4)"),
    content?.querySelector(".panel:nth-child(5)")
  ].filter(Boolean);
  if (!titlePanel || !introPanel) return;

  const titleTriggerId = "ch5-title-clatter";
  const existingTitle = ScrollTrigger.getById(titleTriggerId);
  if (existingTitle) existingTitle.kill();

  const setIntroPanelRestState = () => {
    gsap.set(introPanel, {
      autoAlpha: 0,
      y: 88,
      scale: 0.94,
      rotation: -1.5,
      force3D: true
    });
  };

  const setTitlePanelRestState = () => {
    gsap.set(titlePanel, {
      zIndex: 9,
      autoAlpha: 0,
      y: -420,
      rotation: -8,
      scale: 0.98,
      transformOrigin: "50% 100%",
      force3D: true
    });
  };

  setIntroPanelRestState();
  setTitlePanelRestState();

  const hasTiltedPanels = tiltedPanels.length === 3;
  const baseTiltedRotations = hasTiltedPanels
    ? tiltedPanels.map((panel) => Number(gsap.getProperty(panel, "rotation")) || 0)
    : [];
  const tiltedSpinConfigs = [
    {
      origin: "0% 0%",
      rotation: "+=1080",
      duration: 1.9,
      trailAnchorX: "100%",
      trailAnchorY: "50%",
      trailDirection: 0
    },
    {
      origin: "100% 100%",
      rotation: "-=1080",
      duration: 2.0,
      trailAnchorX: "100%",
      trailAnchorY: "50%",
      trailDirection: 0
    },
    {
      origin: "100% 0%",
      rotation: "+=1080",
      duration: 2.1,
      trailAnchorX: "100%",
      trailAnchorY: "50%",
      trailDirection: 0
    }
  ];
  const spinTrailPalette = [
    "var(--accent-primary)",
    "var(--accent-secondary)",
    "var(--accent-highlight)",
    "var(--red__red50)",
    "var(--blue__blue40)",
    "var(--yellow__yellow60)"
  ];

  const setTiltedPanelsRestState = () => {
    if (!hasTiltedPanels) return;
    gsap.set(tiltedPanels, {
      autoAlpha: 0,
      x: Math.round(window.innerWidth * 0.26),
      scale: 0.9,
      rotation: (index) => baseTiltedRotations[index],
      force3D: true
    });
  };

  setTiltedPanelsRestState();

  const spinTrailData = hasTiltedPanels
    ? tiltedPanels.map((panel, panelIndex) => {
      const spinCfg = tiltedSpinConfigs[panelIndex] || tiltedSpinConfigs[0];
      const trailLayer = document.createElement("div");
      trailLayer.className = "ch5-spin-lines";
      trailLayer.style.left = spinCfg.trailAnchorX;
      trailLayer.style.top = spinCfg.trailAnchorY;

      const axis = document.createElement("span");
      axis.className = "ch5-spin-axis";
      trailLayer.appendChild(axis);

      const lines = [];
      for (let i = 0; i < 11; i += 1) {
        const line = document.createElement("span");
        const color = spinTrailPalette[(panelIndex * 2 + i) % spinTrailPalette.length];
        line.className = "ch5-spin-line";
        line.style.width = `${30 + gsap.utils.random(0, 10)}px`;
        line.style.height = `${2 + (i % 3)}px`;
        line.style.backgroundColor = color;
        line.style.boxShadow = `0 0 10px ${color}`;
        axis.appendChild(line);

        gsap.set(line, {
          x: 0,
          y: 0,
          autoAlpha: 0,
          scaleX: 0.3,
          transformOrigin: "0% 50%"
        });

        lines.push(line);
      }

      gsap.set(axis, { rotation: spinCfg.trailDirection });
      panel.appendChild(trailLayer);
      return {
        panel,
        layer: trailLayer,
        axis,
        lines,
        tween: null
      };
    })
    : [];

  const layoutTiltedSpinTrailLanes = (trail) => {
    const panelHeight = trail.panel?.offsetHeight || 220;
    const edgeInset = 4;
    const usableSpan = Math.max(24, panelHeight - (edgeInset * 2));
    const count = trail.lines.length;
    trail.lines.forEach((line, index) => {
      const t = count <= 1 ? 0.5 : index / (count - 1);
      const y = ((-panelHeight * 0.5) + edgeInset) + (t * usableSpan);
      gsap.set(line, { y });
    });
  };

  const resetTiltedSpinTrails = () => {
    if (!hasTiltedPanels) return;
    spinTrailData.forEach((trail, trailIndex) => {
      const spinCfg = tiltedSpinConfigs[trailIndex] || tiltedSpinConfigs[0];
      if (trail.tween) {
        trail.tween.kill();
        trail.tween = null;
      }
      trail.layer.style.left = spinCfg.trailAnchorX;
      trail.layer.style.top = spinCfg.trailAnchorY;
      gsap.set(trail.layer, { autoAlpha: 0 });
      gsap.set(trail.axis, { rotation: spinCfg.trailDirection });
      layoutTiltedSpinTrailLanes(trail);
      gsap.set(trail.lines, {
        x: 0,
        autoAlpha: 0,
        scaleX: 0.25
      });
    });
  };

  resetTiltedSpinTrails();

  const blackoutTriggerId = "ch5-blackout-fill";
  const existingBlackout = ScrollTrigger.getById(blackoutTriggerId);
  if (existingBlackout) existingBlackout.kill();
  let blackoutCloud = null;
  let blackoutTimeline = null;
  let blackoutScrollTrigger = null;

  const buildBlackoutCloud = () => {
    if (!blackoutPanel) return [];
    if (blackoutCloud) blackoutCloud.remove();

    blackoutCloud = document.createElement("div");
    blackoutCloud.className = "ch5-blackout-cloud";
    blackoutPanel.appendChild(blackoutCloud);

    const phrases = blackoutSeedLines
      .map((line) => line.textContent?.trim())
      .filter(Boolean);
    const phrasePool = phrases.length ? phrases : ["Save the choice."];

    const panelWidth = Math.max(blackoutPanel.offsetWidth || 0, 360);
    const panelHeight = Math.max(blackoutPanel.offsetHeight || 0, 170);
    const cols = Math.max(18, Math.ceil(panelWidth / 64));
    const rows = Math.max(12, Math.ceil(panelHeight / 16));
    const layers = 5;
    const clampLeft = gsap.utils.clamp(2, 98);
    const clampTop = gsap.utils.clamp(4, 96);
    const words = [];

    for (let layer = 0; layer < layers; layer += 1) {
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const word = document.createElement("span");
          const wordIndex = (layer * rows * cols) + (row * cols) + col;
          const jitterX = gsap.utils.random(-0.44, 0.44);
          const jitterY = gsap.utils.random(-0.4, 0.4);
          const leftPct = clampLeft(((col + 0.5 + jitterX) / cols) * 100);
          const topPct = clampTop(((row + 0.5 + jitterY) / rows) * 100);

          word.className = "ch5-blackout-word";
          word.textContent = phrasePool[wordIndex % phrasePool.length];
          word.style.left = `${leftPct}%`;
          word.style.top = `${topPct}%`;
          word.style.fontSize = `${gsap.utils.random(10, 15, 1)}px`;
          word.style.fontWeight = `${gsap.utils.random(700, 900, 100)}`;
          blackoutCloud.appendChild(word);

          gsap.set(word, {
            xPercent: -50,
            yPercent: -50,
            rotation: gsap.utils.random(-8, 8),
            scale: gsap.utils.random(0.46, 0.82),
            autoAlpha: 0
          });

          words.push(word);
        }
      }
    }

    return words;
  };

  const buildBlackoutTimeline = () => {
    if (!blackoutPanel) return null;
    if (blackoutTimeline) {
      blackoutTimeline.kill();
      blackoutTimeline = null;
    }

    const words = buildBlackoutCloud();
    const revealOrder = words.slice().sort(() => Math.random() - 0.5);
    const slowCount = Math.max(20, Math.floor(revealOrder.length * 0.34));
    const midCount = Math.max(slowCount + 20, Math.floor(revealOrder.length * 0.68));
    const slowWords = revealOrder.slice(0, slowCount);
    const midWords = revealOrder.slice(slowCount, midCount);
    const fastWords = revealOrder.slice(midCount);
    const phase = {
      panelRevealAt: 0.02,
      panelRevealDuration: 0.62,
      slowStart: 0.46,
      slowDuration: 0.98,
      slowStagger: 0.026,
      midStart: 1.20,
      midDuration: 0.62,
      midStagger: 0.012,
      fastStart: 1.74,
      fastDuration: 0.44,
      fastStagger: 0.003
    };
    const getPhaseEnd = (count, start, duration, staggerEach) =>
      start + duration + (Math.max(0, count - 1) * staggerEach);
    const slowEnd = getPhaseEnd(
      slowWords.length,
      phase.slowStart,
      phase.slowDuration,
      phase.slowStagger
    );
    const midEnd = getPhaseEnd(
      midWords.length,
      phase.midStart,
      phase.midDuration,
      phase.midStagger
    );
    const fastEnd = getPhaseEnd(
      fastWords.length,
      phase.fastStart,
      phase.fastDuration,
      phase.fastStagger
    );
    const settleStart = Math.max(slowEnd, midEnd, fastEnd) + 0.08;

    blackoutTimeline = gsap.timeline({
      paused: true,
      defaults: { ease: "none" }
    });

    blackoutTimeline
      .set(blackoutPanel, {
        backgroundColor: "var(--surface-primary)",
        borderColor: "var(--text-primary)",
        autoAlpha: 1,
        y: 0
      }, 0)
      .set(blackoutSeedLines, { autoAlpha: 0.82, color: "var(--text-primary)" }, 0)
      .set(words, { autoAlpha: 0, color: "var(--text-primary)" }, 0)
      .to(slowWords, {
        autoAlpha: 1,
        scale: 1.12,
        duration: phase.slowDuration,
        stagger: { each: phase.slowStagger, from: "random" },
        ease: "steps(1)"
      }, phase.slowStart)
      .to(midWords, {
        autoAlpha: 1,
        scale: 1.12,
        duration: phase.midDuration,
        stagger: { each: phase.midStagger, from: "random" },
        ease: "steps(1)"
      }, phase.midStart)
      .to(fastWords, {
        autoAlpha: 1,
        scale: 1.16,
        duration: phase.fastDuration,
        stagger: { each: phase.fastStagger, from: "random" },
        ease: "steps(1)"
      }, phase.fastStart)
      .to(words, {
        autoAlpha: 1,
        scale: 1.08,
        duration: 0.72,
        stagger: { each: 0.0012, from: "random" },
        ease: "steps(1)"
      }, settleStart)
      .to(words, {
        autoAlpha: 1,
        scale: 1.16,
        duration: 1.24,
        stagger: { each: 0.00045, from: "random" },
        ease: "steps(1)"
      }, ">+0.1")
      .to(blackoutSeedLines, {
        autoAlpha: 0,
        duration: 1.1,
        ease: "sine.out"
      }, "<0.08");

    return blackoutTimeline;
  };

  const setupBlackoutTrigger = () => {
    if (!blackoutPanel || !blackoutSection) return;
    const blackoutTriggerTarget = blackoutSection;
    const blackoutPinTarget = blackoutSection;
    if (blackoutScrollTrigger) {
      blackoutScrollTrigger.kill();
      blackoutScrollTrigger = null;
    }

    const timeline = buildBlackoutTimeline();
    if (!timeline) return;
    timeline.progress(0).pause(0);
    gsap.set(blackoutPanel, {
      autoAlpha: 1,
      y: 0,
      backgroundColor: "var(--surface-primary)",
      borderColor: "var(--text-primary)"
    });
    gsap.set(blackoutSeedLines, {
      autoAlpha: 0.82,
      color: "var(--text-primary)"
    });

    const syncBlackoutSpacerBackground = (self) => {
      const spacer = self?.pin?.parentNode;
      if (!spacer || !spacer.classList?.contains("pin-spacer")) return;
      spacer.style.background = getComputedStyle(blackoutSection).backgroundColor;
    };

    blackoutScrollTrigger = ScrollTrigger.create({
      id: blackoutTriggerId,
      trigger: blackoutTriggerTarget,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 1.25)}`,
      scrub: 1,
      pin: blackoutPinTarget,
      pinSpacing: true,
      anticipatePin: 1,
      animation: timeline,
      invalidateOnRefresh: true,
      onEnter: (self) => {
        syncBlackoutSpacerBackground(self);
        timeline.progress(0).pause(0);
      },
      onLeaveBack: () => {
        timeline.progress(0).pause(0);
        gsap.set(blackoutPanel, {
          autoAlpha: 1,
          y: 0,
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--text-primary)"
        });
        gsap.set(blackoutSeedLines, {
          autoAlpha: 0.82,
          color: "var(--text-primary)"
        });
      },
      onUpdate: (self) => {
        syncBlackoutSpacerBackground(self);
        if (self.progress < 0.08) {
          gsap.set(blackoutPanel, {
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--text-primary)"
          });
          gsap.set(blackoutSeedLines, {
            autoAlpha: 0.82,
            color: "var(--text-primary)"
          });
        }
      },
      onRefresh: (self) => {
        syncBlackoutSpacerBackground(self);
        if (window.scrollY <= (self.start + 2)) {
          timeline.progress(0).pause(0);
          gsap.set(blackoutPanel, {
            autoAlpha: 1,
            y: 0,
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--text-primary)"
          });
          gsap.set(blackoutSeedLines, {
            autoAlpha: 0.82,
            color: "var(--text-primary)"
          });
        }
      }
    });
  };

  setupBlackoutTrigger();

  const tiltedPanelsTl = hasTiltedPanels
    ? gsap.timeline({
      paused: true,
      onReverseComplete: () => {
        pauseTiltedPanelPulse();
        resetTiltedSpinTrails();
        setTiltedPanelsRestState();
      }
    })
    : null;
  const tiltedPanelPulseTweens = hasTiltedPanels
    ? tiltedPanels.map((panel, index) => gsap.fromTo(panel, {
      scale: 1
    }, {
      scale: 1.02 + (index * 0.006),
      duration: 1.02 + (index * 0.08),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true,
      immediateRender: false
    }))
    : [];

  const playTiltedPanelPulse = () => {
    tiltedPanelPulseTweens.forEach((tw) => tw.play());
  };

  const pauseTiltedPanelPulse = () => {
    tiltedPanelPulseTweens.forEach((tw) => tw.pause(0));
  };

  if (tiltedPanelsTl) {
    tiltedPanelsTl
      .set(tiltedPanels, {
        autoAlpha: 0,
        x: () => Math.round(window.innerWidth * 0.26),
        scale: 0.9,
        rotation: (index) => baseTiltedRotations[index]
      }, 0)
      .to(tiltedPanels, {
        autoAlpha: 1,
        x: 0,
        scale: 1.04,
        duration: 1.12,
        ease: "power2.out",
        stagger: 0
      }, 0)
      .to(tiltedPanels, {
        scale: 0.98,
        duration: 0.48,
        ease: "sine.inOut",
        stagger: 0
      }, 1.12)
      .to(tiltedPanels, {
        scale: 1,
        duration: 0.38,
        ease: "sine.out",
        stagger: 0
      }, 1.60)
      .add(() => {
        playTiltedPanelPulse();
      }, 1.98);
  }

  if (hasTiltedPanels) {
    tiltedPanels.forEach((panel, index) => {
      const cfg = tiltedSpinConfigs[index] || tiltedSpinConfigs[0];
      panel.style.cursor = "pointer";
      makeKeyboardActivatable(panel, `Activate ${panel.textContent?.trim() || "panel"}`);
      panel.addEventListener("click", () => {
        if (panel.dataset.spinBusy === "1") return;
        panel.dataset.spinBusy = "1";
        const pulseTween = tiltedPanelPulseTweens[index];
        const spinTrail = spinTrailData[index];
        if (pulseTween) pulseTween.pause();

        if (spinTrail) {
          if (spinTrail.tween) {
            spinTrail.tween.kill();
            spinTrail.tween = null;
          }

          const pulseRepeatCount = Math.max(5, Math.round(cfg.duration / 0.2));
          const travelDistance = 98;
          spinTrail.layer.style.left = cfg.trailAnchorX;
          spinTrail.layer.style.top = cfg.trailAnchorY;
          gsap.set(spinTrail.layer, { autoAlpha: 1 });
          gsap.set(spinTrail.axis, { rotation: cfg.trailDirection });
          layoutTiltedSpinTrailLanes(spinTrail);
          gsap.set(spinTrail.lines, {
            x: 0,
            autoAlpha: 0.12,
            scaleX: 0.35
          });

          const trailTl = gsap.timeline({
            onComplete: () => {
              spinTrail.tween = null;
            }
          });

          spinTrail.lines.forEach((line, lineIndex) => {
            trailTl.fromTo(line, {
              x: 2,
              autoAlpha: 0,
              scaleX: 0.28
            }, {
              keyframes: [
                { autoAlpha: 0.9, duration: 0.05, ease: "none" },
                { x: travelDistance, duration: 0.16 + (lineIndex * 0.01), ease: "none" },
                { autoAlpha: 0, duration: 0.08, ease: "none" }
              ],
              scaleX: 1,
              repeat: pulseRepeatCount
            }, lineIndex * 0.015);
          });

          trailTl.to(spinTrail.layer, {
            autoAlpha: 0,
            duration: 0.24,
            ease: "power1.out"
          }, Math.max(0, cfg.duration - 0.14));

          spinTrail.tween = trailTl;
        }

        gsap.to(panel, {
          transformOrigin: cfg.origin,
          rotation: cfg.rotation,
          duration: cfg.duration,
          ease: "power4.out",
          onComplete: () => {
            panel.dataset.spinBusy = "0";
            if (pulseTween) pulseTween.play();
          }
        });
      });
    });
  }

  const introPanelTl = gsap.timeline({
    paused: true,
    onReverseComplete: () => {
      setIntroPanelRestState();
    }
  });
  introPanelTl.to(introPanel, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    rotation: 0,
    duration: 0.95,
    ease: "power2.out"
  }, 0);

  const tlCh5Intro = gsap.timeline({
    paused: true,
    defaults: {
      overwrite: "auto"
    },
    onReverseComplete: () => {
      setTitlePanelRestState();
    }
  });

  tlCh5Intro
    .set(titlePanel, {
      zIndex: 9,
      autoAlpha: 0,
      y: -420,
      rotation: -8,
      scale: 0.98,
      transformOrigin: "50% 100%",
      force3D: true
    }, 0.00)
    .to(titlePanel, {
      autoAlpha: 1,
      y: 128,
      rotation: 10,
      scale: 1.045,
      duration: 0.14,
      ease: "none"
    }, 0.78)
    .to(titlePanel, {
      y: -18,
      rotation: -5,
      scale: 0.995,
      duration: 0.10,
      ease: "none"
    }, 0.92)
    .to(titlePanel, {
      y: 10,
      rotation: 2.8,
      scale: 1.008,
      duration: 0.09,
      ease: "none"
    }, 1.02)
    .to(titlePanel, {
      y: 0,
      rotation: 0,
      scale: 1,
      duration: 0.12,
      ease: "none"
    }, 1.11);

  const playCh5Intro = () => {
    tlCh5Intro.restart(true);
  };

  const triggerDelaySeconds = 1.0;
  let introDelayCall = null;
  let titleDelayCall = null;
  let hasQueuedIntroPanel = false;
  let hasQueuedCh5Intro = false;
  let hasPlayedIntroPanel = false;
  let hasPlayedCh5Intro = false;
  let hasPlayedTiltedPanels = false;
  let lastCh5ScrollY = window.scrollY || window.pageYOffset || 0;

  const clearCh5QueuedCalls = () => {
    if (introDelayCall) {
      introDelayCall.kill();
      introDelayCall = null;
    }
    if (titleDelayCall) {
      titleDelayCall.kill();
      titleDelayCall = null;
    }
    hasQueuedIntroPanel = false;
    hasQueuedCh5Intro = false;
  };

  const resetCh5Intro = () => {
    clearCh5QueuedCalls();
    introPanelTl.pause(0);
    setIntroPanelRestState();
    tlCh5Intro.pause(0);
    setTitlePanelRestState();
    if (tiltedPanelsTl) {
      tiltedPanelsTl.pause(0);
      pauseTiltedPanelPulse();
      resetTiltedSpinTrails();
      setTiltedPanelsRestState();
    }
    hasPlayedIntroPanel = false;
    hasPlayedCh5Intro = false;
    hasPlayedTiltedPanels = false;
  };

  const updateCh5IntroByScroll = () => {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const scrollingUp = currentScrollY < (lastCh5ScrollY - 0.5);
    lastCh5ScrollY = currentScrollY;

    const rect = ch5.getBoundingClientRect();
    const scrubProgress = gsap.utils.clamp(
      0,
      1,
      ((window.innerHeight * 1.16) - rect.top) / (window.innerHeight * 2.45)
    );
    // Delay panel 2 so it animates while visible, and start title/tilted sooner.
    const introProg = gsap.utils.clamp(0, 1, (scrubProgress - 0.27) / 0.28);
    const titleProg = gsap.utils.clamp(0, 1, (scrubProgress - 0.21) / 0.26);
    const tiltedProg = gsap.utils.clamp(0, 1, (scrubProgress - 0.27) / 0.30);

    // Scrub timelines directly from scroll so fast scrolling can't skip them.
    clearCh5QueuedCalls();
    introPanelTl.progress(introProg).pause();
    tlCh5Intro.progress(titleProg).pause();
    if (tiltedPanelsTl) {
      tiltedPanelsTl.progress(tiltedProg).pause();
      if (tiltedProg >= 0.9) {
        playTiltedPanelPulse();
      } else {
        pauseTiltedPanelPulse();
        resetTiltedSpinTrails();
      }
    }

    hasPlayedIntroPanel = introProg >= 0.98;
    hasPlayedCh5Intro = titleProg >= 0.98;
    hasPlayedTiltedPanels = tiltedProg >= 0.98;

    if (scrubProgress <= 0.001 && !scrollingUp) {
      setIntroPanelRestState();
      setTitlePanelRestState();
      setTiltedPanelsRestState();
    }
    return;

    const tiltedAnchorTop = hasTiltedPanels
      ? tiltedPanels[1].getBoundingClientRect().top
      : Number.POSITIVE_INFINITY;
    const introStartReached = rect.top <= (window.innerHeight * 0.86);
    const titleStartReached = rect.top <= (window.innerHeight * 0.64);
    const introReverseReached = rect.top >= (window.innerHeight * 0.02);
    const titleReverseReached = rect.top >= (window.innerHeight * 0.18);
    const resetReached = rect.top > (window.innerHeight * 0.90);
    const tiltedStartReached =
      tiltedAnchorTop <= (window.innerHeight * 0.96) ||
      rect.top <= (window.innerHeight * 0.72);
    const tiltedReverseReached =
      tiltedAnchorTop >= (window.innerHeight * 0.52);
    const tiltedReverseReady = !tiltedPanelsTl || tiltedPanelsTl.progress() <= 0.02;
    const introReverseReady = tlCh5Intro.progress() <= 0.72;

    if (scrollingUp && tiltedReverseReached && hasPlayedTiltedPanels && tiltedPanelsTl) {
      hasPlayedTiltedPanels = false;
      pauseTiltedPanelPulse();
      tiltedPanelsTl.reverse();
    }

    if (
      scrollingUp &&
      titleReverseReached &&
      hasPlayedCh5Intro &&
      !hasPlayedTiltedPanels &&
      tiltedReverseReady
    ) {
      if (titleDelayCall) {
        titleDelayCall.kill();
        titleDelayCall = null;
      }
      hasQueuedCh5Intro = false;
      hasPlayedCh5Intro = false;
      tlCh5Intro.reverse();
    }

    if (
      scrollingUp &&
      introReverseReached &&
      hasPlayedIntroPanel &&
      introReverseReady
    ) {
      if (introDelayCall) {
        introDelayCall.kill();
        introDelayCall = null;
      }
      hasQueuedIntroPanel = false;
      hasPlayedIntroPanel = false;
      introPanelTl.reverse();
    }

    if (!scrollingUp && introStartReached && !hasPlayedIntroPanel && !hasQueuedIntroPanel) {
      hasQueuedIntroPanel = true;
      introDelayCall = gsap.delayedCall(triggerDelaySeconds, () => {
        introDelayCall = null;
        hasQueuedIntroPanel = false;
        if (hasPlayedIntroPanel) return;
        hasPlayedIntroPanel = true;
        introPanelTl.restart(true);
      });
    }

    if (!scrollingUp && titleStartReached && !hasPlayedCh5Intro && !hasQueuedCh5Intro) {
      hasQueuedCh5Intro = true;
      titleDelayCall = gsap.delayedCall(triggerDelaySeconds, () => {
        titleDelayCall = null;
        hasQueuedCh5Intro = false;
        if (hasPlayedCh5Intro) return;
        hasPlayedCh5Intro = true;
        playCh5Intro();
      });
    }

    if (!scrollingUp && tiltedStartReached && !hasPlayedTiltedPanels && tiltedPanelsTl) {
      hasPlayedTiltedPanels = true;
      tiltedPanelsTl.restart(true);
    }

    if (resetReached && (hasPlayedIntroPanel || hasPlayedCh5Intro || hasPlayedTiltedPanels || hasQueuedIntroPanel || hasQueuedCh5Intro)) {
      resetCh5Intro();
    }
  };

  window.addEventListener("scroll", updateCh5IntroByScroll, { passive: true });
  const handleChapter5ResizeSettled = () => {
    if (tiltedPanelsTl) {
      tiltedPanelsTl.invalidate();
      setTiltedPanelsRestState();
      resetTiltedSpinTrails();
    }
    setupBlackoutTrigger();
    updateCh5IntroByScroll();
  };
  window.addEventListener("comic:resize-settled", handleChapter5ResizeSettled);
  requestAnimationFrame(() => {
    updateCh5IntroByScroll();
  });
});

/* =========================================================
   CHAPTER 5 OUTRO — scrubbed fade-in for last two panels
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const outro = document.querySelector("#chapter-5-outro");
  if (!outro) return;

  const panelOne = outro.querySelector(".panel:nth-child(1)");
  const panelTwo = outro.querySelector(".panel:nth-child(2)");
  const powerfulWord = outro.querySelector(".ch5-powerful-word");
  if (!panelOne || !panelTwo) return;

  let wipe = outro.querySelector("#ch5-outro-wipe");
  if (!wipe) {
    wipe = document.createElement("div");
    wipe.id = "ch5-outro-wipe";
    wipe.setAttribute("aria-hidden", "true");
    outro.appendChild(wipe);
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const legacyVolcano = ScrollTrigger.getById("ch5-outro-volcano");
  if (legacyVolcano) legacyVolcano.kill();
  const fadeTriggerId = "ch5-outro-fade";

  if (prefersReducedMotion) {
    gsap.set([panelOne, panelTwo], { clearProps: "all" });
    if (powerfulWord) gsap.set(powerfulWord, { clearProps: "all" });
    gsap.set([outro, wipe], { clearProps: "all" });
    return;
  }

  let tlFade = null;
  const positionWipeCircle = () => {
    if (!wipe) return;

    const outroRect = outro.getBoundingClientRect();
    if (!outroRect.width || !outroRect.height) return;

    const wordRect = powerfulWord?.getBoundingClientRect();
    const centerX = wordRect
      ? (wordRect.left - outroRect.left) + (wordRect.width * 0.5)
      : (outroRect.width * 0.5);
    const centerY = wordRect
      ? (wordRect.top - outroRect.top) + (wordRect.height * 0.5)
      : (outroRect.height * 0.5);

    // Keep wipe perfectly circular by forcing equal width/height.
    const size = Math.max(outroRect.width, outroRect.height) * 3.4;
    wipe.style.width = `${size}px`;
    wipe.style.height = `${size}px`;

    gsap.set(wipe, {
      x: centerX - (size * 0.5),
      y: centerY - (size * 0.5),
      transformOrigin: "50% 50%"
    });
  };

  const setupOutroFade = () => {
    const existingFade = ScrollTrigger.getById(fadeTriggerId);
    if (existingFade) existingFade.kill();
    if (tlFade) {
      tlFade.kill();
      tlFade = null;
    }

    gsap.set(outro, { backgroundColor: "var(--chapter-transition-gray)" });
    if (powerfulWord) {
      gsap.set(powerfulWord, {
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
        transformOrigin: "50% 68%",
        force3D: false
      });
    }
    // Measure wipe anchor from the word's resting position (before panel offset-in).
    gsap.set(panelOne, { x: 0, y: 0 });
    gsap.set(panelTwo, { x: 0, y: 0 });
    positionWipeCircle();

    gsap.set(panelOne, {
      autoAlpha: 0,
      x: -56,
      y: 72
    });
    gsap.set(panelTwo, {
      autoAlpha: 0,
      x: 56,
      y: 80
    });
    gsap.set(wipe, {
      autoAlpha: 0,
      scale: 0.001,
      backgroundColor: "var(--surface-primary)"
    });

    tlFade = gsap.timeline({
      scrollTrigger: {
        id: fadeTriggerId,
        trigger: outro,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 1.35)}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    tlFade
      .to(panelOne, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.54,
        ease: "none"
      }, 0.00)
      .to(panelTwo, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.54,
        ease: "none"
      }, 0.52);

    if (powerfulWord) {
      tlFade
        .to(powerfulWord, {
          scale: 1.24,
          duration: 0.14,
          ease: "none"
        }, 1.00)
        .to(powerfulWord, {
          keyframes: [
            { x: -5, y: 2, rotation: -3.5, duration: 0.05, ease: "none" },
            { x: 6, y: -2, rotation: 3.5, duration: 0.05, ease: "none" },
            { x: -4, y: 1, rotation: -2.5, duration: 0.05, ease: "none" },
            { x: 3, y: -1, rotation: 2, duration: 0.05, ease: "none" },
            { x: 0, y: 0, rotation: 0, duration: 0.04, ease: "none" }
          ]
        }, 1.14)
        .to(powerfulWord, {
          scale: 34,
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.44,
          ease: "power3.in",
          force3D: false
        }, 1.36);
    }

    tlFade.to(wipe, {
      autoAlpha: 1,
      scale: 1.06,
      duration: 0.46,
      ease: "power2.in"
    }, 1.36);
    tlFade.to(wipe, {
      scale: 1.2,
      duration: 0.26,
      ease: "none"
    }, 1.82);
  };

  setupOutroFade();
  window.addEventListener("comic:resize-settled", setupOutroFade);
});



/* =========================================================
   CHAPTER 6 — scrubbed panel draw + typed text
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch6 = document.querySelector("#chapter-6");
  if (!ch6) return;

  const content = ch6.querySelector(".section__content");
  if (!content) return;
  const guidesSvg = ch6.querySelector(".svg-guides");

  const panels = Array.from(content.querySelectorAll(".panel"));
  if (!panels.length) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const firstTriggerId = "ch6-draw-type-first";
  const secondTriggerId = "ch6-draw-type-second";
  const thirdTriggerId = "ch6-draw-type-third";
  const guidesTriggerId = "ch6-guides-draw";
  const phaseStartFirst = "top 44%";
  const phaseEndFirst = "top 0%";
  const phaseStartSecond = "top 26%";
  const phaseEndSecond = "top -18%";
  const phaseStartThird = "top 8%";
  const phaseEndThird = "top -36%";
  let tlCh6First = null;
  let tlCh6Second = null;
  let tlCh6Third = null;
  let tlCh6Guides = null;

  const escapeHtml = (text) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const readPanelText = (el) =>
    el.innerHTML
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .trim();

  const setTypedText = (el, fullText, count) => {
    const safeCount = Math.max(0, Math.min(fullText.length, Math.floor(count)));
    const slice = fullText.slice(0, safeCount);
    el.innerHTML = escapeHtml(slice).replace(/\n/g, "<br>");
  };

  const ensureOutline = (panel) => {
    let outline = panel.querySelector(":scope > .ch6-draw-outline");
    if (!outline) {
      outline = document.createElement("div");
      outline.className = "ch6-draw-outline";
      outline.innerHTML = `
        <span class="ch6-draw-line ch6-draw-line--top"></span>
        <span class="ch6-draw-line ch6-draw-line--right"></span>
        <span class="ch6-draw-line ch6-draw-line--bottom"></span>
        <span class="ch6-draw-line ch6-draw-line--left"></span>
      `;
      panel.appendChild(outline);
    }

    return {
      top: outline.querySelector(".ch6-draw-line--top"),
      right: outline.querySelector(".ch6-draw-line--right"),
      bottom: outline.querySelector(".ch6-draw-line--bottom"),
      left: outline.querySelector(".ch6-draw-line--left")
    };
  };

  const getPanelAccent = (index) => {
    const panelNumber = index + 1;
    if (panelNumber === 1 || panelNumber === 4 || panelNumber === 7) {
      return "var(--accent-primary)";
    }
    if (panelNumber === 2 || panelNumber === 5 || panelNumber === 8) {
      return "var(--accent-secondary)";
    }
    return "var(--accent-highlight)";
  };

  const panelData = panels.map((panel, index) => {
    const heading = panel.querySelector("h2, h4, p");
    const fullText = heading ? readPanelText(heading) : "";
    const lines = ensureOutline(panel);
    const accent = getPanelAccent(index);
    return { panel, heading, fullText, lines, accent };
  });

  const setReducedMotionState = () => {
    panelData.forEach(({ panel, heading, fullText, lines, accent }) => {
      if (heading) {
        heading.innerHTML = escapeHtml(fullText).replace(/\n/g, "<br>");
      }
      gsap.set([lines.top, lines.bottom], { scaleX: 1, autoAlpha: 1, backgroundColor: accent });
      gsap.set([lines.right, lines.left], { scaleY: 1, autoAlpha: 1, backgroundColor: accent });
      gsap.set(panel, { backgroundColor: "var(--surface-primary)" });
      if (heading) gsap.set(heading, { color: "var(--text-primary)" });
    });
  };

  const setupGuideLines = () => {
    if (!guidesSvg) return;

    const existingGuides = ScrollTrigger.getById(guidesTriggerId);
    if (existingGuides) existingGuides.kill();

    if (tlCh6Guides) {
      tlCh6Guides.kill();
      tlCh6Guides = null;
    }

    guidesSvg.innerHTML = "";

    if (prefersReducedMotion) return;

    const contentRect = content.getBoundingClientRect();
    const width = Math.max(1, Math.round(contentRect.width));
    const height = Math.max(1, Math.round(contentRect.height));
    guidesSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    guidesSvg.setAttribute("preserveAspectRatio", "none");

    const ns = "http://www.w3.org/2000/svg";
    const accentTokens = ["var(--accent-primary)", "var(--accent-secondary)", "var(--accent-highlight)"];
    const accentClasses = ["is-accent-primary", "is-accent-secondary", "is-accent-highlight"];
    const resolveColorToken = (token) => {
      const probe = document.createElement("span");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.color = token;
      content.appendChild(probe);
      const resolved = getComputedStyle(probe).color.trim();
      probe.remove();
      return resolved || token;
    };
    const palette = accentTokens.map(resolveColorToken);
    const createdLines = [];
    const candidates = [];

    panels.forEach((panel) => {
      const rect = panel.getBoundingClientRect();
      const x = rect.left - contentRect.left;
      const y = rect.top - contentRect.top;
      const w = rect.width;
      const h = rect.height;

      // Full-span lines aligned to panel edges.
      candidates.push({
        orientation: "h",
        pos: y,
        sortY: y,
        x1: 0,
        y1: y,
        x2: width,
        y2: y,
        color: null
      });
      candidates.push({
        orientation: "h",
        pos: y + h,
        sortY: y + h,
        x1: 0,
        y1: y + h,
        x2: width,
        y2: y + h,
        color: null
      });
      candidates.push({
        orientation: "v",
        pos: x,
        sortY: y,
        x1: x,
        y1: 0,
        x2: x,
        y2: height,
        color: null
      });
      candidates.push({
        orientation: "v",
        pos: x + w,
        sortY: y,
        x1: x + w,
        y1: 0,
        x2: x + w,
        y2: height,
        color: null
      });
    });

    const seen = new Set();
    candidates.forEach((candidate) => {
      const key = `${candidate.orientation}:${Math.round(candidate.pos)}`;
      if (seen.has(key)) return;
      seen.add(key);

      const line = document.createElementNS(ns, "line");
      line.classList.add("guide", "ch6-guide-line");
      line.setAttribute("x1", `${candidate.x1}`);
      line.setAttribute("y1", `${candidate.y1}`);
      line.setAttribute("x2", `${candidate.x2}`);
      line.setAttribute("y2", `${candidate.y2}`);
      const paletteIndex = createdLines.length % palette.length;
      const color = palette[paletteIndex];
      line.style.stroke = color;
      line.setAttribute("stroke", color);
      line.style.opacity = "1";
      line.setAttribute("stroke-opacity", "1");
      line.classList.add(accentClasses[paletteIndex]);
      line.dataset.sortY = `${candidate.sortY}`;
      guidesSvg.appendChild(line);
      createdLines.push(line);
    });

    const orderedLines = createdLines
      .slice()
      .sort((a, b) => Number(a.dataset.sortY) - Number(b.dataset.sortY));

    orderedLines.forEach((line) => {
      const length = line.getTotalLength();
      gsap.set(line, {
        strokeDasharray: length,
        strokeDashoffset: length,
        autoAlpha: 1,
        strokeOpacity: 1
      });
    });

    tlCh6Guides = gsap.timeline({
      scrollTrigger: {
        id: guidesTriggerId,
        trigger: ch6,
        start: phaseStartFirst,
        end: phaseEndThird,
        scrub: 0.2,
        invalidateOnRefresh: true
      }
    });

    tlCh6Guides.to(orderedLines, {
      strokeDashoffset: 0,
      duration: 1,
      stagger: { each: 0.015, from: 0 },
      ease: "none"
    }, 1.5);
  };

  const addRandomPanelAnimations = (
    timeline,
    group,
    {
      startMin = 0.0,
      startMax = 0.22,
      drawMin = 0.10,
      drawMax = 0.18,
      typeMin = 0.12,
      typeMax = 0.2,
      typeDelayMin = 0.01,
      typeDelayMax = 0.06
    } = {}
  ) => {
    group.forEach(({ panel, heading, fullText, lines, accent }) => {
      const at = gsap.utils.random(startMin, startMax, 0.001);
      const drawDuration = gsap.utils.random(drawMin, drawMax, 0.001);
      const lineStagger = drawDuration * gsap.utils.random(0.3, 0.5, 0.001);
      const lineDuration = drawDuration * gsap.utils.random(0.32, 0.42, 0.001);
      const lineOrder = gsap.utils.shuffle(["top", "right", "bottom", "left"]);
      const typeDelay = gsap.utils.random(typeDelayMin, typeDelayMax, 0.001);
      const typeDuration = gsap.utils.random(typeMin, typeMax, 0.001);
      const drawEnd = at + (lineStagger * Math.max(0, lineOrder.length - 1)) + lineDuration;
      const typeEnd = at + typeDelay + typeDuration;
      const confirmAt = Math.max(drawEnd, typeEnd) + 0.02;

      lineOrder.forEach((lineKey, lineIndex) => {
        const isHorizontal = lineKey === "top" || lineKey === "bottom";
        timeline.to(lines[lineKey], {
          [isHorizontal ? "scaleX" : "scaleY"]: 1,
          duration: lineDuration,
          ease: "none"
        }, at + (lineIndex * lineStagger));
      });

      timeline.to(panel, {
        backgroundColor: "var(--surface-primary)",
        duration: drawDuration * 0.92,
        ease: "none"
      }, at + (drawDuration * 0.12));

      if (!heading || !fullText.length) return;

      const typeState = { count: 0 };
      timeline.to(typeState, {
        count: fullText.length,
        duration: typeDuration,
        ease: "none",
        onUpdate: () => {
          setTypedText(heading, fullText, typeState.count);
        }
      }, at + typeDelay);

      timeline.to(panel, {
        y: -4,
        scale: 1.014,
        duration: 0.12,
        ease: "none"
      }, confirmAt);
      timeline.to(panel, {
        y: 0,
        scale: 1,
        duration: 0.16,
        ease: "none"
      }, confirmAt + 0.12);
      timeline.to([lines.top, lines.right, lines.bottom, lines.left], {
        backgroundColor: "var(--neutrals__neutral100)",
        duration: 0.28,
        ease: "none"
      }, confirmAt + 0.06);

      gsap.set([lines.top, lines.right, lines.bottom, lines.left], {
        backgroundColor: accent
      });
    });
  };

  const setupChapter6Timeline = () => {
    const existingFirst = ScrollTrigger.getById(firstTriggerId);
    const existingSecond = ScrollTrigger.getById(secondTriggerId);
    const existingThird = ScrollTrigger.getById(thirdTriggerId);
    if (existingFirst) existingFirst.kill();
    if (existingSecond) existingSecond.kill();
    if (existingThird) existingThird.kill();

    if (tlCh6First) {
      tlCh6First.kill();
      tlCh6First = null;
    }
    if (tlCh6Second) {
      tlCh6Second.kill();
      tlCh6Second = null;
    }
    if (tlCh6Third) {
      tlCh6Third.kill();
      tlCh6Third = null;
    }

    setupGuideLines();

    if (prefersReducedMotion) {
      setReducedMotionState();
      return;
    }

    panelData.forEach(({ panel, heading, lines, accent }) => {
      if (heading) heading.innerHTML = "";
      gsap.set(panel, { backgroundColor: "transparent", y: 0, scale: 1 });
      if (heading) gsap.set(heading, { color: "var(--text-primary)" });
      gsap.set([lines.top, lines.bottom], { scaleX: 0, autoAlpha: 1, backgroundColor: accent });
      gsap.set([lines.right, lines.left], { scaleY: 0, autoAlpha: 1, backgroundColor: accent });
    });

    const firstGroup = panelData.slice(0, 3);
    const secondGroup = panelData.slice(3, 7);
    const thirdGroup = panelData.slice(7, 8);

    tlCh6First = gsap.timeline({
      scrollTrigger: {
        id: firstTriggerId,
        trigger: ch6,
        start: phaseStartFirst,
        end: phaseEndFirst,
        scrub: 0.28,
        invalidateOnRefresh: true
      }
    });
    addRandomPanelAnimations(tlCh6First, firstGroup, {
      startMin: 0.22,
      startMax: 0.46,
      drawMin: 0.16,
      drawMax: 0.26,
      typeMin: 0.18,
      typeMax: 0.3,
      typeDelayMin: 0.03,
      typeDelayMax: 0.08
    });

    tlCh6Second = gsap.timeline({
      scrollTrigger: {
        id: secondTriggerId,
        trigger: ch6,
        start: phaseStartSecond,
        end: phaseEndSecond,
        scrub: 0.22,
        invalidateOnRefresh: true
      }
    });
    addRandomPanelAnimations(tlCh6Second, secondGroup, {
      startMin: 0.20,
      startMax: 0.34,
      drawMin: 0.12,
      drawMax: 0.12,
      typeMin: 0.12,
      typeMax: 0.18,
      typeDelayMin: 0.01,
      typeDelayMax: 0.04
    });

    tlCh6Third = gsap.timeline({
      scrollTrigger: {
        id: thirdTriggerId,
        trigger: ch6,
        start: phaseStartThird,
        end: phaseEndThird,
        scrub: 0.22,
        invalidateOnRefresh: true
      }
    });
    addRandomPanelAnimations(tlCh6Third, thirdGroup, {
      startMin: 0.20,
      startMax: 0.28,
      drawMin: 0.12,
      drawMax: 0.12,
      typeMin: 0.10,
      typeMax: 0.16,
      typeDelayMin: 0.0,
      typeDelayMax: 0.03
    });
  };

  setupChapter6Timeline();
  window.addEventListener("comic:resize-settled", setupChapter6Timeline);
});



/* =========================================================
   CHAPTER 1 — helpers for click-to-open comic panels
   ========================================================= */
function splitBrLinesToSpans(el) {
  if (el.dataset.split === "true") return Array.from(el.querySelectorAll(".line"));
  el.dataset.split = "true";

  const html = el.innerHTML;
  const parts = html.split(/<br\s*\/?>/gi).map((s) => s.trim());

  el.innerHTML = parts
    .map((line) => `<span class="line" style="display:block">${line}</span>`)
    .join("");

  return Array.from(el.querySelectorAll(".line"));
}

function restoreBrLinesFromSpans(el) {
  if (!el || el.dataset.split !== "true") return;

  const lines = Array.from(el.querySelectorAll(".line"));
  if (!lines.length) return;

  el.innerHTML = lines.map((line) => line.textContent).join("<br>");
  delete el.dataset.split;
}

function animateCh1CodePanel(panel) {
  const bodyText = panel.querySelector("p");
  if (!bodyText) return;

  const lines = splitBrLinesToSpans(bodyText);
  if (lines.length < 4) return;

  const [cssLine, svgLine, animLine, genLine] = lines;

  gsap.set(lines, { clearProps: "transform,filter" });
  gsap.set(lines, { willChange: "transform, filter" });

  gsap.from(cssLine, {
    x: -18,
    skewX: -10,
    duration: 0.35,
    ease: "power2.out"
  });

  gsap.from(svgLine, {
    scale: 0.6,
    duration: 0.55,
    ease: "elastic.out(1, 0.55)",
    delay: 0.08
  });

  gsap.from(animLine, {
    y: 10,
    duration: 0.25,
    ease: "power2.out",
    delay: 0.16
  });

  gsap.to(animLine, {
    rotate: 2,
    duration: 0.12,
    ease: "power1.inOut",
    yoyo: true,
    repeat: 5,
    transformOrigin: "50% 50%",
    delay: 0.24
  });

  gsap.from(genLine, {
    filter: "blur(6px)",
    duration: 0.25,
    ease: "power2.out",
    delay: 0.28
  });

  gsap.to(genLine, {
    x: () => gsap.utils.random(-2, 2),
    y: () => gsap.utils.random(-1, 1),
    duration: 0.04,
    repeat: 10,
    yoyo: true,
    ease: "none",
    delay: 0.32,
    onComplete: () => gsap.set(genLine, { clearProps: "filter" })
  });
}

function animateCh1PanelText(panel) {
  const panels = Array.from(panel.parentElement.querySelectorAll(".panel"));
  const index = panels.indexOf(panel) + 1;

  const h2 = panel.querySelector("h2");
  const h4 = panel.querySelector("h4");
  const bodyText = panel.querySelector("p");

  switch (index) {
    case 1: {
      if (!h2) break;

      gsap.from(h2, {
        y: -16,
        duration: 0.35,
        ease: "power3.out"
      });

      gsap.from(panel, {
        rotation: -1.5,
        duration: 0.25,
        ease: "power2.out"
      });

      gsap.to(panel, {
        x: 2,
        duration: 0.06,
        repeat: 3,
        yoyo: true,
        ease: "power1.inOut",
        delay: 0.18,
        clearProps: "x"
      });
      break;
    }

    case 2: {
      if (!bodyText) break;

      gsap.from(bodyText, {
        x: 18,
        duration: 0.35,
        ease: "power2.out"
      });
      break;
    }

    case 3: {
      if (!bodyText) break;

      gsap.from(bodyText, {
        scale: 0.92,
        duration: 0.4,
        ease: "back.out(2)"
      });
      break;
    }

    case 4: {
      animateCh1CodePanel(panel);
      break;
    }

    case 5: {
      if (!bodyText) break;

      gsap.from(bodyText, {
        y: 12,
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.to(panel, {
        scale: 1.01,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
        delay: 0.12,
        clearProps: "scale"
      });
      break;
    }

    case 6: {
      if (!h4) break;

      gsap.from(h4, {
        y: 10,
        duration: 0.28,
        ease: "power2.out"
      });

      gsap.from(h4, {
        scale: 0.95,
        duration: 0.4,
        ease: "back.out(2)",
        delay: 0.06
      });
      break;
    }
  }
}

function createCh1PulseTween(panel) {
  return gsap.to(panel, {
    scale: 1.03,
    opacity: 0.9,
    duration: gsap.utils.random(1.2, 1.8),
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
    delay: Math.random() * 1.4,
    paused: true
  });
}

function syncCh1PulseState(panel) {
  if (!panel._pulseTween || panel.classList.contains("is-open")) return;

  const ch1 = document.querySelector("#chapter-1");
  if (!ch1) return;

  // If chapter 1 is currently visible enough, pulse immediately
  if (ScrollTrigger.isInViewport(ch1, 0.2)) {
    panel._pulseTween.play();
  } else {
    panel._pulseTween.pause(0);
  }
}

function resetCh1Panel(panel) {
  const content = panel.children;

  panel.classList.remove("is-open");
  panel.classList.add("is-ghost");
  panel.style.pointerEvents = "auto";

  gsap.set(panel, {
    clearProps: "backgroundColor",
    scale: 1,
    opacity: 0.55
  });

  gsap.set(content, {
    autoAlpha: 0,
    y: 10
  });

  const bodyText = panel.querySelector("p");
  if (bodyText) restoreBrLinesFromSpans(bodyText);

  if (panel._pulseTween) {
    panel._pulseTween.kill();
  }

  panel._pulseTween = createCh1PulseTween(panel);
  syncCh1PulseState(panel);
}



/* =========================================================
   CHAPTER 1 — ghost pulse + click-to-open panels
   Pulse only runs while chapter 1 is active in view
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch1 = document.querySelector("#chapter-1");
  const ch1Panels = document.querySelectorAll("#chapter-1 .panel");
  if (!ch1 || ch1Panels.length === 0) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  ch1Panels.forEach((panel) => {
    const content = panel.children;
    makeKeyboardActivatable(panel, `Open panel: ${panel.textContent?.trim() || "Chapter 1 item"}`);

    panel.classList.add("is-ghost");

    // Start hidden for scrubbed entrance timeline
    gsap.set(panel, { opacity: 0, scale: 1 });
    gsap.set(content, { autoAlpha: 0, y: 10 });

    if (!prefersReducedMotion) {
      panel._pulseTween = createCh1PulseTween(panel);
    } else {
      gsap.set(panel, { opacity: 0.85 });
    }

    panel.addEventListener("click", () => {
      if (panel.classList.contains("is-open")) return;

      if (panel._pulseTween) {
        panel._pulseTween.kill();
        panel._pulseTween = null;
      }

      panel.classList.remove("is-ghost");
      panel.classList.add("is-open");
      panel.style.pointerEvents = "none";

      const tl = gsap.timeline();

      tl.to(panel, {
        opacity: 1,
        scale: 0.92,
        duration: 0.08,
        ease: "power1.out"
      })
      .to(
        panel,
        {
          scale: 1,
          backgroundColor: "var(--surface-primary)",
          duration: 0.6,
          ease: "back.out(1.8)"
        },
        "<"
      )
      .add(() => {
        gsap.set(content, { autoAlpha: 1, y: 0 });
        animateCh1PanelText(panel);
      }, "<0.12");
    });
  });

  if (!prefersReducedMotion) {
    ScrollTrigger.create({
      trigger: ch1,
      start: "top 75%",
      end: "bottom top",
      onEnter: () => {
        ch1Panels.forEach((panel) => {
          if (!panel.classList.contains("is-open") && panel._pulseTween) {
            panel._pulseTween.play();
          }
        });
      },
      onLeave: () => {
        ch1Panels.forEach((panel) => {
          if (!panel.classList.contains("is-open") && panel._pulseTween) {
            panel._pulseTween.pause(0);
          }
        });
      },
      onEnterBack: () => {
        ch1Panels.forEach((panel) => {
          if (!panel.classList.contains("is-open") && panel._pulseTween) {
            panel._pulseTween.play();
          }
        });
      },
      onLeaveBack: () => {
        ch1Panels.forEach((panel) => {
          if (!panel.classList.contains("is-open") && panel._pulseTween) {
            panel._pulseTween.pause(0);
          }
        });
      }
    });

    ScrollTrigger.create({
      trigger: ch1,
      start: "top 45%",
      end: "top top",
      onLeaveBack: () => {
        ch1Panels.forEach((panel) => resetCh1Panel(panel));
      }
    });
  }
});

/* =========================================================
   CHAPTER 1 — fade out on scroll + reset panels
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch1 = document.querySelector("#chapter-1");
  const ch1Panels = document.querySelectorAll("#chapter-1 .panel");
  if (!ch1 || ch1Panels.length === 0) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  gsap.timeline({
    scrollTrigger: {
      trigger: ch1,
      start: "bottom 75%",
      end: "bottom top",
      scrub: 1,
      onLeave: () => {
        ch1Panels.forEach((panel) => {
          resetCh1Panel(panel);
        });
      },
      onLeaveBack: () => {
        ch1Panels.forEach((panel) => {
          resetCh1Panel(panel);
        });
      }
    }
  }).to(ch1Panels, {
    autoAlpha: 0,
    stagger: 0.04,
    ease: "none"
  });
});


/* =========================================================
   CHAPTER 2 — split entrance animation
   Stage 1: pin title + first two rows
   Stage 2: unpinned reveal for arrow + last panel
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch2 = document.querySelector("#chapter-2");
  if (!ch2) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const content = ch2.querySelector(".section__content");
  if (!content) return;

  const p1 = content.querySelector(".panel:nth-child(1)");
  const p2 = content.querySelector(".panel:nth-child(2)");
  const p3 = content.querySelector(".panel:nth-child(3)");
  const p4 = content.querySelector(".panel:nth-child(4)");
  const p5 = content.querySelector(".panel:nth-child(5)");
  const p6 = content.querySelector(".panel:nth-child(6)");
  const arrowWrap = content.querySelector("#arrow");
  const p7 = content.querySelector("#arrow + .panel");

  if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !arrowWrap || !p7) {
    return;
  }

  if (prefersReducedMotion) {
    gsap.set([p1, p2, p3, p4, p5, p6, p7], { clearProps: "all" });
    gsap.set(arrowWrap, { clearProps: "all" });
    return;
  }

  // Initial states
  gsap.set(p1, { x: 90, autoAlpha: 0 });
  gsap.set([p2, p3], { x: -90, autoAlpha: 0 });
  gsap.set([p4, p5, p6], { x: 90, autoAlpha: 0 });

  gsap.set(arrowWrap, {
    x: -40,
    y: -40,
    scale: 0.2,
    autoAlpha: 0,
    transformOrigin: "0% 0%"
  });

  gsap.set(p7, {
    scale: 0.2,
    autoAlpha: 0,
    transformOrigin: "50% 50%"
  });

  /* -------------------------
     STAGE 1 — pin main layout
     Starts a little later so layout sits higher
     ------------------------- */
  const tlMain = gsap.timeline({
    scrollTrigger: {
      trigger: ch2,
      start: "top top",
      end: () => "+=" + Math.round(window.innerHeight * 0.2),
      scrub: 1,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true
    }
  });

  tlMain
    .to(p1, {
      x: 0,
      autoAlpha: 1,
      duration: 0.8,
      ease: "none"
    }, 0)

    .to(p2, {
      x: 0,
      autoAlpha: 1,
      duration: 0.65,
      ease: "none"
    }, 0.20)

    .to(p3, {
      x: 0,
      autoAlpha: 1,
      duration: 0.65,
      ease: "none"
    }, 0.42)

    .to(p4, {
      x: 0,
      autoAlpha: 1,
      duration: 0.6,
      ease: "none"
    }, 0.60)

    .to(p5, {
      x: 0,
      autoAlpha: 1,
      duration: 0.6,
      ease: "none"
    }, 0.74)

    .to(p6, {
      x: 0,
      autoAlpha: 1,
      duration: 0.6,
      ease: "none"
    }, 0.88);

  /* -------------------------
     STAGE 2 — much later reveal
     for arrow + final panel
     ------------------------- */
  const tlLower = gsap.timeline({
    scrollTrigger: {
      trigger: p7,
      start: "top 115%",
      end: "top 15%",
      scrub: 1,
      invalidateOnRefresh: true
    }
  });

  tlLower
    .to(arrowWrap, {
      autoAlpha: 1,
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.55,
      ease: "none"
    }, 0)

    .to(p7, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.75,
      ease: "none"
    }, 0.35);
});


/* =========================================================
   CHAPTER 2 — bomb to boom transition
   Shorter pin, later wipe, quicker release
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch2 = document.querySelector("#chapter-2");
  const ch3 = document.querySelector("#chapter-3");
  if (!ch2 || !ch3) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const content = ch2.querySelector(".section__content");
  const bombWrap = ch2.querySelector("#ch2-bomb");
  const bombSvg = ch2.querySelector("#ch2-bomb .bomb");
  const spark = ch2.querySelector("#ch2-bomb .bomb-spark");
  const wick = ch2.querySelector("#ch2-bomb .bomb-wick");

  const boomWrap = ch2.querySelector("#ch2-boom");
  const boomPath = ch2.querySelector("#ch2-boom .pow-shape");
  const letters = ch2.querySelectorAll("#ch2-boom .boom-letter");

  const wipe = ch2.querySelector("#ch2-wipe");

  if (!content || !bombWrap || !bombSvg || !boomWrap || !boomPath || !wipe) return;

  let nextBg = getComputedStyle(ch3).backgroundColor;
  if (!nextBg || nextBg === "rgba(0, 0, 0, 0)" || nextBg === "transparent") {
    nextBg = getComputedStyle(document.querySelector("main") || document.body).backgroundColor;
  }

  if (prefersReducedMotion) {
    gsap.set(boomWrap, { autoAlpha: 0 });
    gsap.set(wipe, { opacity: 0, backgroundColor: nextBg });
    return;
  }

  const getContentLeft = () => {
    const contentRect = content.getBoundingClientRect();
    const ch2Rect = ch2.getBoundingClientRect();
    return contentRect.left - ch2Rect.left;
  };

  const bombTravelX = () => {
    const left = getContentLeft();
    const w = content.clientWidth;
    const bombW = bombWrap.offsetWidth || 120;
    return Math.max(0, left + w - bombW - 24);
  };

  const placeBoomAtBomb = () => {
    const ch2Rect = ch2.getBoundingClientRect();
    const bombRect = bombWrap.getBoundingClientRect();

    const cx = (bombRect.left - ch2Rect.left) + bombRect.width / 2;
    const cy = (bombRect.top - ch2Rect.top) + bombRect.height / 2;

    gsap.set(boomWrap, { x: cx, y: cy });
  };

  // Initial states
  gsap.set(ch2, { backgroundColor: "var(--surface-primary)" });
  gsap.set(bombWrap, { x: () => getContentLeft(), autoAlpha: 1 });
  gsap.set(bombSvg, { rotation: 0, transformOrigin: "50% 50%" });

  if (spark) gsap.set(spark, { scale: 1, opacity: 1, transformOrigin: "50% 50%" });
  if (wick) gsap.set(wick, { rotation: 0, transformOrigin: "0% 100%" });

  gsap.set(boomWrap, { autoAlpha: 0, scale: 0.12, transformOrigin: "50% 50%" });
  gsap.set(boomPath, { fill: "#ff6b35" });
  gsap.set(letters, { fill: "#ffffff" });
  gsap.set(wipe, { opacity: 0, backgroundColor: nextBg });

  placeBoomAtBomb();

  ScrollTrigger.addEventListener("refreshInit", () => {
    gsap.set(bombWrap, { x: () => getContentLeft() });
    placeBoomAtBomb();
  });

  const tlBoom = gsap.timeline({
    scrollTrigger: {
      trigger: ch2,
      start: "bottom bottom",
      end: () => "+=" + Math.round(window.innerHeight * 0.75),
      scrub: true,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true
    }
  });

  // 1) bomb rolls
  tlBoom.to(bombWrap, {
    x: () => bombTravelX(),
    ease: "none",
    duration: 0.45
  }, 0);

  tlBoom.to(bombSvg, {
    rotation: 540,
    ease: "none",
    duration: 0.45
  }, 0);

  if (spark) {
    tlBoom.to(spark, {
      scale: 1.35,
      opacity: 0.6,
      duration: 0.06,
      repeat: 5,
      yoyo: true,
      ease: "sine.inOut"
    }, 0.04);
  }

  if (wick) {
    tlBoom.to(wick, {
      rotation: -8,
      duration: 0.10,
      repeat: 4,
      yoyo: true,
      ease: "sine.inOut"
    }, 0.04);
  }

  // 2) boom spawns from bomb
  tlBoom.add(() => placeBoomAtBomb(), 0.43);

  tlBoom.to(boomWrap, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.05,
    ease: "power1.out"
  }, 0.46);

  tlBoom.to(letters, {
    x: () => gsap.utils.random(-4, 4),
    y: () => gsap.utils.random(-3, 3),
    duration: 0.025,
    repeat: 6,
    yoyo: true,
    ease: "none",
    clearProps: "x,y"
  }, 0.48);

  // 3) fast expansion
  tlBoom.to(boomWrap, {
    scale: 18,
    duration: 0.14,
    ease: "power2.in"
  }, 0.56);

  // 4) wipe happens late so chapter 2 doesn't feel gray too early
  tlBoom.to(wipe, {
    opacity: 1,
    duration: 0.10,
    ease: "none"
  }, 0.74);

  // 5) hide boom before release
  tlBoom.set(boomWrap, { autoAlpha: 0 }, 0.9);
});



/* =========================================================
   CHAPTER 3 — freefall + icon rain + split panel reveal
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch3 = document.querySelector("#chapter-3");
  if (!ch3) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const content = ch3.querySelector(".section__content");
  if (!content) return;

  const titlePanel = content.querySelector(".panel:nth-child(1)");
  const captionPanel = content.querySelector("#caption-panel");
  const screamFigureShell = captionPanel?.querySelector(".ch3-scream-shell");
  const screamFigure = captionPanel?.querySelector(".ch3-scream-figure");
  const middlePanel = content.querySelector(".panel:nth-child(3)");
  const rightPanel = content.querySelector(".panel:nth-child(4)");
  const questionsPanel = content.querySelector(".panel:nth-child(5)");
  const revealText = content.querySelector("#text-reveal");
  const splitLeftHalf = questionsPanel?.querySelector(".left-half");
  const splitRightHalf = questionsPanel?.querySelector(".right-half");
  const panelContent = questionsPanel?.querySelector(".panel-content");

  if (
    !titlePanel ||
    !captionPanel ||
    !middlePanel ||
    !rightPanel ||
    !questionsPanel ||
    !revealText ||
    !splitLeftHalf ||
    !splitRightHalf ||
    !panelContent
  ) {
    return;
  }

  /* -------------------------
     Build icon layer
     ------------------------- */
  let iconLayer = ch3.querySelector(".ch3-icon-rain");

  if (!iconLayer) {
    iconLayer = document.createElement("div");
    iconLayer.className = "ch3-icon-rain";
    ch3.appendChild(iconLayer);
  }

  const iconNames = [
    "square-terminal",
    "box",
    "toggle-right",
    "mouse-pointer-click",
    "layers",
    "database",
    "message-square",
    "zap",
    "eye",
    "repeat-2"
  ];

  iconLayer.innerHTML = "";

  const iconCount = 40;
  for (let i = 0; i < iconCount; i++) {
    const iconWrap = document.createElement("div");
    iconWrap.className = "ch3-float-icon";
    iconWrap.innerHTML = `<i data-lucide="${iconNames[i % iconNames.length]}"></i>`;
    iconLayer.appendChild(iconWrap);
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({
      attrs: {
        width: 72,
        height: 72,
        "stroke-width": 2.25
      }
    });
  }

  const floatingIcons = iconLayer.querySelectorAll(".ch3-float-icon");
  const staticParallaxIcons = ch3.querySelectorAll(".p-icon");

  if (prefersReducedMotion) {
    // Keep Chapter 3 transition timeline active for narrative continuity.
    gsap.set(floatingIcons, { autoAlpha: 0.14 });
  }

  /* -------------------------
     Initial states
     ------------------------- */
  gsap.set(titlePanel, {
    y: -220,
    rotation: -10,
    autoAlpha: 0
  });

  gsap.set([captionPanel, middlePanel, rightPanel], {
    y: -300,
    autoAlpha: 0
  });

  gsap.set(captionPanel, { rotation: -20 });
  gsap.set(middlePanel, { rotation: 12 });
  gsap.set(rightPanel, { rotation: 24 });
  if (screamFigureShell) {
    gsap.set(screamFigureShell, {
      rotation: -4,
      x: 0,
      y: 0,
      transformOrigin: "50% 85%"
    });
  }
  if (screamFigure && screamFigureShell) {
    const enableScreamFallback = () => screamFigureShell.classList.add("is-fallback");
    if (screamFigure.complete && screamFigure.naturalWidth === 0) {
      enableScreamFallback();
    } else {
      screamFigure.addEventListener("error", enableScreamFallback, { once: true });
    }
  }

  gsap.set(questionsPanel, {
    y: 220,
    autoAlpha: 0
  });

  gsap.set(panelContent, {
    autoAlpha: 1
  });

  gsap.set([splitLeftHalf, splitRightHalf], {
    x: 0,
    y: 0,
    rotation: 0,
    autoAlpha: 1
  });

  gsap.set(revealText, {
    y: 0,
    xPercent: -50,
    yPercent: -50,
    left: "50%",
    top: "50%",
    width: "min(86vw, 960px)",
    position: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    rotation: 0,
    autoAlpha: 0,
    scale: 0.32,
    transformOrigin: "50% 50%"
  });

  floatingIcons.forEach((icon) => {
    const leftPct = Math.random() * 92;
    const topPct = Math.random() * 90;
    gsap.set(icon, {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      xPercent: 0,
      yPercent: 0,
      autoAlpha: gsap.utils.random(0.1, 0.26),
      rotation: gsap.utils.random(-40, 40),
      scale: gsap.utils.random(0.55, 1.35)
    });
  });

  staticParallaxIcons.forEach((icon) => {
    const leftPct = Math.random() * 90;
    const topPct = Math.random() * 86;
    gsap.set(icon, {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      autoAlpha: gsap.utils.random(0.09, 0.2),
      rotation: gsap.utils.random(-35, 35),
      scale: gsap.utils.random(0.65, 1.4)
    });
  });

  const getQuestionsPanelCenteredY = () => {
    const panelRect = questionsPanel.getBoundingClientRect();
    const chapterRect = ch3.getBoundingClientRect();
    const panelCenterInChapter = (panelRect.top - chapterRect.top) + (panelRect.height * 0.5);
    const targetY = (window.innerHeight * 0.5) - panelCenterInChapter + 220;
    return gsap.utils.clamp(
      -window.innerHeight * 0.45,
      window.innerHeight * 0.35,
      targetY
    );
  };

/* -------------------------
   Stage 1 — pinned freefall
   top cluster enters, drifts, and fully exits
   bottom panel stays hidden until after that
   ------------------------- */
const tlFall = gsap.timeline({
  scrollTrigger: {
    trigger: ch3,
    start: "top top",
    end: () => "+=" + Math.round(window.innerHeight * 3.8),
    scrub: 1,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true,
    onRefreshInit: () => {
      gsap.set(questionsPanel, { y: 220, autoAlpha: 0 });
      gsap.set(panelContent, { autoAlpha: 1 });
      gsap.set([splitLeftHalf, splitRightHalf], {
        x: 0,
        y: 0,
        rotation: 0,
        autoAlpha: 1
      });
      if (screamFigureShell) {
        gsap.set(screamFigureShell, {
          rotation: -4,
          x: 0,
          y: 0
        });
      }
      gsap.set(revealText, {
        left: "50%",
        top: "50%",
        xPercent: -50,
        yPercent: -50,
        y: 0,
        scale: 0.32,
        autoAlpha: 0
      });
    }
  }
});

// top cluster enters
tlFall
  .to(titlePanel, {
    y: 0,
    rotation: -6,
    autoAlpha: 1,
    duration: 0.24,
    ease: "none"
  }, 0.02)

  .to(captionPanel, {
    y: 0,
    rotation: -15,
    autoAlpha: 1,
    duration: 0.22,
    ease: "none"
  }, 0.12)

  // Scream figure rocks like the mode-toggle bomb while the panel settles.
  .to(screamFigureShell, {
    rotation: 9,
    x: 2,
    duration: 0.10,
    ease: "none"
  }, 0.16)
  .to(screamFigureShell, {
    rotation: -8,
    x: -2,
    duration: 0.10,
    ease: "none"
  }, 0.26)
  .to(screamFigureShell, {
    rotation: 7,
    x: 2,
    duration: 0.10,
    ease: "none"
  }, 0.36)
  .to(screamFigureShell, {
    rotation: -6,
    x: -1,
    duration: 0.10,
    ease: "none"
  }, 0.46)
  .to(screamFigureShell, {
    rotation: 5,
    x: 1,
    duration: 0.10,
    ease: "none"
  }, 0.56)
  .to(screamFigureShell, {
    rotation: 0,
    x: 0,
    duration: 0.12,
    ease: "none"
  }, 0.66)

  .to(middlePanel, {
    y: 0,
    rotation: 6,
    autoAlpha: 1,
    duration: 0.22,
    ease: "none"
  }, 0.18)

  .to(rightPanel, {
    y: 0,
    rotation: 18,
    autoAlpha: 1,
    duration: 0.22,
    ease: "none"
  }, 0.24)

  // they keep drifting downward
  .to(titlePanel, {
    y: 120,
    rotation: -4,
    duration: 0.18,
    ease: "none"
  }, 0.34)

  .to(captionPanel, {
    y: 170,
    rotation: -11,
    duration: 0.22,
    ease: "none"
  }, 0.40)

  .to(middlePanel, {
    y: 185,
    rotation: 8,
    duration: 0.22,
    ease: "none"
  }, 0.44)

  .to(rightPanel, {
    y: 200,
    rotation: 22,
    duration: 0.22,
    ease: "none"
  }, 0.48)

  // top cluster fully exits BEFORE bottom panel
  .to(titlePanel, {
    y: 420,
    autoAlpha: 0,
    duration: 0.18,
    ease: "none"
  }, 0.62)

  .to(captionPanel, {
    y: 520,
    autoAlpha: 0,
    duration: 0.20,
    ease: "none"
  }, 0.66)

  .to(middlePanel, {
    y: 560,
    autoAlpha: 0,
    duration: 0.20,
    ease: "none"
  }, 0.68)

  .to(rightPanel, {
    y: 600,
    autoAlpha: 0,
    duration: 0.20,
    ease: "none"
  }, 0.70)

  // hard reset split panel state before it enters (prevents carry-over/hide states)
  .set(questionsPanel, {
    y: 220,
    autoAlpha: 0
  }, 0.88)
  .set(panelContent, {
    autoAlpha: 1
  }, 0.88)
  .set([splitLeftHalf, splitRightHalf], {
    x: 0,
    y: 0,
    rotation: 0,
    autoAlpha: 1
  }, 0.88)

  // only now does the bottom panel come up
  .to(questionsPanel, {
    y: () => getQuestionsPanelCenteredY(),
    autoAlpha: 1,
    duration: 0.50,
    ease: "none"
  }, 0.94)

  // hold panel for readability
  .to(questionsPanel, {
    autoAlpha: 1,
    duration: 0.34,
    ease: "none"
  }, 1.38)

  // panel text vanishes first
  .to(panelContent, {
    autoAlpha: 0,
    duration: 0.18,
    ease: "none"
  }, 1.56)

  // split and fall
  .to(splitLeftHalf, {
    x: () => -(window.innerWidth * 0.52),
    y: () => window.innerHeight * 0.84,
    rotation: -28,
    autoAlpha: 1,
    duration: 0.68,
    ease: "none"
  }, 1.62)
  .to(splitRightHalf, {
    x: () => window.innerWidth * 0.52,
    y: () => window.innerHeight * 0.84,
    rotation: 28,
    autoAlpha: 1,
    duration: 0.68,
    ease: "none"
  }, 1.62)

  // lock reveal text to exact viewport center before showing
  .set(revealText, {
    left: "50%",
    top: "50%",
    xPercent: -50,
    yPercent: -50,
    y: 0
  }, 1.55)

  // reveal final text behind split panel
  .fromTo(revealText, {
    autoAlpha: 0,
    scale: 0.45
  }, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.30,
    ease: "none"
  }, 1.58)

  // zoom text into white transition
  .to(revealText, {
    scale: 4.9,
    autoAlpha: 1,
    duration: 0.44,
    ease: "none"
  }, 2.02)
  .to([splitLeftHalf, splitRightHalf], {
    autoAlpha: 0,
    duration: 0.16,
    ease: "none"
  }, 2.20)
  .to(ch3, {
    backgroundColor: "var(--surface-primary)",
    duration: 0.28,
    ease: "none"
  }, 2.24)
  .set([floatingIcons, staticParallaxIcons], {
    autoAlpha: 0,
  }, 2.34)
  .set(revealText, {
    autoAlpha: 0,
  }, 2.44);

  // Keep icon motion tied to the same pinned timeline to prevent scroll-jump conflicts.
  const iconMotionDuration = 2.34;

  floatingIcons.forEach((icon) => {
    tlFall.to(icon, {
      y: gsap.utils.random(260, 760),
      x: gsap.utils.random(-160, 160),
      rotation: `+=${gsap.utils.random(-140, 140)}`,
      autoAlpha: gsap.utils.random(0.08, 0.24),
      duration: iconMotionDuration,
      ease: "none"
    }, 0);
  });

  staticParallaxIcons.forEach((icon) => {
    tlFall.to(icon, {
      y: gsap.utils.random(320, 900),
      x: gsap.utils.random(-180, 180),
      rotation: `+=${gsap.utils.random(-170, 170)}`,
      autoAlpha: gsap.utils.random(0.08, 0.22),
      duration: iconMotionDuration,
      ease: "none"
    }, 0);
  });

});


/* =========================================================
   CHAPTER 7 — sequential fades + full-viewport finale wipe
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const ch7 = document.querySelector("#chapter-7");
  const finaleSection = document.querySelector("#chapter-7-finale");
  if (!ch7) return;
  if (!finaleSection) return;

  const content = ch7.querySelector(".section__content");
  if (!content) return;

  const panels = Array.from(content.querySelectorAll(".panel"));
  if (panels.length < 6) return;

  const introPanels = panels.slice(0, 6);
  const finalPanel = finaleSection.querySelector("#ch7-final-panel");
  const scrollToTopBtn = document.querySelector("#scroll-to-top-btn");
  if (!finalPanel) return;

  let scrollUpLinesLayer = document.querySelector("#scroll-up-lines");
  if (!scrollUpLinesLayer) {
    scrollUpLinesLayer = document.createElement("div");
    scrollUpLinesLayer.id = "scroll-up-lines";
    scrollUpLinesLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrollUpLinesLayer);
  }

  let scrollUpFxTween = null;
  const playScrollUpFx = () => {
    if (!scrollUpLinesLayer) return;
    scrollUpLinesLayer.innerHTML = "";

    const palette = [
      "var(--accent-primary)",
      "var(--accent-secondary)",
      "var(--accent-highlight)",
      "#ff6b35",
      "#3b82f6",
      "#f59e0b"
    ];
    const lineCount = 42;
    const lines = [];
    const viewportHeight = window.innerHeight || 900;

    for (let i = 0; i < lineCount; i += 1) {
      const line = document.createElement("span");
      line.className = "scroll-up-line";
      line.style.width = `${gsap.utils.random(2, 4, 1)}px`;
      line.style.height = `${gsap.utils.random(240, 620, 1)}px`;
      line.style.left = `${gsap.utils.random(-2, 98, 1)}vw`;
      line.style.top = `${gsap.utils.random(108, 170, 1)}vh`;
      line.style.backgroundColor = palette[i % palette.length];
      scrollUpLinesLayer.appendChild(line);

      gsap.set(line, {
        rotation: 0,
        scaleY: gsap.utils.random(0.56, 1),
        autoAlpha: 0
      });
      lines.push(line);
    }

    if (scrollUpFxTween) {
      scrollUpFxTween.kill();
      scrollUpFxTween = null;
    }

    scrollUpFxTween = gsap.timeline({
      defaults: { ease: "none" },
      onComplete: () => {
        gsap.set(scrollUpLinesLayer, { autoAlpha: 0 });
        scrollUpLinesLayer.innerHTML = "";
        scrollUpFxTween = null;
      }
    });

    scrollUpFxTween
      .set(scrollUpLinesLayer, { autoAlpha: 1 }, 0)
      .to(lines, {
        autoAlpha: 0.94,
        duration: 0.08,
        stagger: { each: 0.006, from: "random" }
      }, 0)
      .to(lines, {
        y: () => -gsap.utils.random(viewportHeight * 1.7, viewportHeight * 2.35),
        x: 0,
        autoAlpha: 0,
        duration: () => gsap.utils.random(0.95, 1.45),
        stagger: { each: 0.008, from: "random" }
      }, 0.02);
  };

  if (scrollToTopBtn && !scrollToTopBtn.dataset.bound) {
    scrollToTopBtn.dataset.bound = "true";
    scrollToTopBtn.addEventListener("click", () => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reducedMotion) {
        playScrollUpFx();
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  let wipe = document.querySelector("#ch7-end-wipe");
  if (!wipe) {
    wipe = document.createElement("div");
    wipe.id = "ch7-end-wipe";
    wipe.setAttribute("aria-hidden", "true");
    document.body.appendChild(wipe);
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const introTriggerId = "ch7-sequential-fade";
  const finaleTriggerId = "ch7-finale";
  const introFadeDuration = 3.2;
  const introPauseDuration = 0.0;
  const introSegmentDuration = introFadeDuration + introPauseDuration;
  const introTotalDuration = ((introPanels.length - 1) * introSegmentDuration) + introFadeDuration + 0.4;
  let tlIntro = null;
  let tlFinale = null;

  const killExisting = () => {
    const existingIntro = ScrollTrigger.getById(introTriggerId);
    if (existingIntro) existingIntro.kill();
    const existingFinale = ScrollTrigger.getById(finaleTriggerId);
    if (existingFinale) existingFinale.kill();

    if (tlIntro) {
      tlIntro.kill();
      tlIntro = null;
    }
    if (tlFinale) {
      tlFinale.kill();
      tlFinale = null;
    }
  };

  const setRestState = () => {
    gsap.set(introPanels, {
      autoAlpha: 0,
      y: 24,
      scale: 0.985,
      force3D: true
    });

    gsap.set(finalPanel, {
      autoAlpha: 0,
      y: 34,
      scale: 0.965,
      transformOrigin: "50% 50%",
      force3D: true
    });

    gsap.set(wipe, {
      autoAlpha: 0,
      scaleY: 0,
      transformOrigin: "50% 100%"
    });

    if (scrollToTopBtn) {
      gsap.set(scrollToTopBtn, {
        autoAlpha: 0,
        y: 14,
        pointerEvents: "none"
      });
    }
  };

  if (prefersReducedMotion) {
    killExisting();
    gsap.set([...introPanels, finalPanel], { clearProps: "all" });
    gsap.set(wipe, { autoAlpha: 0, scaleY: 0 });
    if (scrollToTopBtn) gsap.set(scrollToTopBtn, { autoAlpha: 0, y: 14, pointerEvents: "none" });
    return;
  }

  const setupChapter7Timelines = () => {
    killExisting();
    setRestState();

    tlIntro = gsap.timeline({
      scrollTrigger: {
        id: introTriggerId,
        trigger: ch7,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * Math.max(4.2, introTotalDuration * 0.24))}`,
        scrub: 0.8,
        pin: ch7,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    introPanels.forEach((panel, index) => {
      tlIntro.to(panel, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: introFadeDuration,
        ease: "none"
      }, index * introSegmentDuration);
    });
    tlIntro.to({}, { duration: 0.4, ease: "none" }, introTotalDuration);

    tlFinale = gsap.timeline({
      scrollTrigger: {
        id: finaleTriggerId,
        trigger: finaleSection,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 3.1)}`,
        scrub: 0.7,
        pin: finaleSection,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          if (!scrollToTopBtn) return;
          scrollToTopBtn.style.pointerEvents = self.progress >= 0.98 ? "auto" : "none";
        },
        invalidateOnRefresh: true
      }
    });

    tlFinale
      .to(finalPanel, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "none"
      }, 0)
      .to({}, { duration: 5 }, 0.8)
      .to(finalPanel, {
        keyframes: [
          { y: -18, scale: 1.035, duration: 0.18, ease: "none" },
          { y: 6, scale: 0.992, duration: 0.14, ease: "none" },
          { y: -140, scale: 0.9, autoAlpha: 0, duration: 0.64, ease: "none" }
        ]
      }, 5.8)
      .to(wipe, {
        autoAlpha: 1,
        scaleY: 1,
        duration: 0.9,
        ease: "none"
      }, 6.08);

    if (scrollToTopBtn) {
      tlFinale.to(scrollToTopBtn, {
        autoAlpha: 1,
        y: 0,
        duration: 0.24,
        ease: "none"
      }, 7.0);
    }
  };

  setupChapter7Timelines();
  window.addEventListener("comic:resize-settled", setupChapter7Timelines);
});

/* =========================================================
   GLOBAL REDUCED-MOTION FALLBACK
   Ensures fully readable static content when motion is reduced.
   ========================================================= */
function applyReducedMotionFallback() {
  requestAnimationFrame(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));

    document.querySelectorAll(".pin-spacer").forEach((spacer) => {
      const parent = spacer.parentNode;
      const child = spacer.firstElementChild;
      if (!parent || !child) return;
      parent.insertBefore(child, spacer);
      spacer.remove();
    });

    const revealTargets = document.querySelectorAll(
      ".section--hero .section__content > *, .section--chapter .panel, #chapter-3 #text-reveal, #chapter-4 #full-view-panel, #chapter-5-blackout #blackout, #chapter-7-finale #ch7-final-panel"
    );
    gsap.set(revealTargets, {
      autoAlpha: 1,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0
    });

    gsap.set("#chapter-3-panel-5 .panel-content", { autoAlpha: 1 });
    gsap.set(
      "#chapter-3 .panel-half, #chapter-2 .ch2-fx, #chapter-3 .parallax-icons, #chapter-3 .ch3-icon-rain, #chapter-4 .ch4-fireworks, #chapter-5-outro #ch5-outro-wipe, #ch7-end-wipe",
      { autoAlpha: 0, display: "none" }
    );

    ScrollTrigger.refresh();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!prefersReducedMotionGlobal) return;
  applyReducedMotionFallback();
});
