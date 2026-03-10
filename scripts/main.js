gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   HERO + CHAPTER 1 — pinned entrance on scroll
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector("#hero");
  const ch1 = document.querySelector("#chapter-1");
  const ch1Panels = document.querySelectorAll("#chapter-1 .panel");
  if (!hero || !ch1 || ch1Panels.length === 0) return;

  const title = hero.querySelector("h1");
  const sub = hero.querySelector("h5");
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
      // markers: true
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
        backgroundColor: () => (ch5 ? getComputedStyle(ch5).backgroundColor : "rgb(82, 82, 82)"),
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

  const themeKey = "comic-site-theme";

  const setTheme = (theme) => {
    const isDark = theme === "dark";
    document.body.classList.toggle("theme-dark", isDark);
    try {
      localStorage.setItem(themeKey, isDark ? "dark" : "light");
    } catch (_err) {
      // Ignore storage failures.
    }
  };

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(themeKey);
    } catch (_err) {
      return null;
    }
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

  if (hasPortalParts) {
    let activePortal = getSavedTheme() === "dark" ? "dark" : "light";
    let isSwapping = false;

    const syncPortalStates = () => {
      setPortalRestState(portalParts.light, activePortal === "light");
      setPortalRestState(portalParts.dark, activePortal === "dark");
      setTheme(activePortal === "dark" ? "dark" : "light");
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
  const h5 = panel.querySelector("h5");
  if (!h5) return;

  const lines = splitBrLinesToSpans(h5);
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
  const h5 = panel.querySelector("h5");

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
      if (!h5) break;

      gsap.from(h5, {
        x: 18,
        duration: 0.35,
        ease: "power2.out"
      });
      break;
    }

    case 3: {
      if (!h5) break;

      gsap.from(h5, {
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
      if (!h5) break;

      gsap.from(h5, {
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

  const h5 = panel.querySelector("h5");
  if (h5) restoreBrLinesFromSpans(h5);

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
      // markers: true
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
    console.log("Chapter 2 panels not found correctly");
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
      // markers: true
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
      // markers: true
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
      // markers: true
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
    console.log("Chapter 3 elements not found correctly");
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
    gsap.set(
      [titlePanel, captionPanel, middlePanel, rightPanel, questionsPanel, revealText, panelContent, splitLeftHalf, splitRightHalf],
      {
      clearProps: "all"
      }
    );
    gsap.set(staticParallaxIcons, { clearProps: "all" });
    gsap.set(floatingIcons, { autoAlpha: 0.14 });
    return;
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
    top: "42%",
    width: "min(86vw, 960px)",
    position: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 7,
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

  const getQuestionsPanelCenterDeltaY = () => {
    const rect = questionsPanel.getBoundingClientRect();
    return (window.innerHeight * 0.5) - (rect.top + rect.height * 0.5);
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
    end: () => "+=" + Math.round(window.innerHeight * 2.6),
    scrub: 1,
    pin: true,
    pinSpacing: true,
    invalidateOnRefresh: true
    // markers: true
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
  y: () => `+=${getQuestionsPanelCenterDeltaY()}`,
  autoAlpha: 1,
  duration: 0.28,
  ease: "none"
}, 0.92)

  // hold panel for readability
  .to(questionsPanel, {
    autoAlpha: 1,
    duration: 0.24,
    ease: "none"
  }, 1.10)

  // panel text vanishes first
  .to(panelContent, {
    autoAlpha: 0,
    duration: 0.14,
    ease: "none"
  }, 1.24)

  // split and fall
  .to(splitLeftHalf, {
    x: () => -(window.innerWidth * 0.8),
    y: () => window.innerHeight * 1.25,
    rotation: -46,
    autoAlpha: 1,
    duration: 0.44,
    ease: "none"
  }, 1.30)
  .to(splitRightHalf, {
    x: () => window.innerWidth * 0.8,
    y: () => window.innerHeight * 1.25,
    rotation: 46,
    autoAlpha: 1,
    duration: 0.44,
    ease: "none"
  }, 1.30)

  // lock reveal text to exact viewport center before showing
  .set(revealText, {
    left: "50%",
    top: "42%",
    xPercent: -50,
    yPercent: -50,
    y: 0
  }, 1.27)

  // reveal final text behind split panel
  .fromTo(revealText, {
    autoAlpha: 0,
    scale: 0.45
  }, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.28,
    ease: "none"
  }, 1.28)

  // zoom text into white transition
  .to(revealText, {
    scale: 4.9,
    autoAlpha: 1,
    duration: 0.38,
    ease: "none"
  }, 1.68)
  .to([splitLeftHalf, splitRightHalf], {
    autoAlpha: 0,
    duration: 0.14,
    ease: "none"
  }, 1.78)
  .to(ch3, {
    backgroundColor: "var(--surface-primary)",
    duration: 0.30,
    ease: "none"
  }, 1.82)
  .set([floatingIcons, staticParallaxIcons], {
    autoAlpha: 0,
  }, 1.98)
  .set(revealText, {
    autoAlpha: 0,
  }, 2.22);

  // Keep icon motion tied to the same pinned timeline to prevent scroll-jump conflicts.
  floatingIcons.forEach((icon) => {
    tlFall.to(icon, {
      y: gsap.utils.random(260, 760),
      x: gsap.utils.random(-160, 160),
      rotation: `+=${gsap.utils.random(-140, 140)}`,
      autoAlpha: gsap.utils.random(0.08, 0.24),
      duration: 1,
      ease: "none"
    }, 0);
  });

  staticParallaxIcons.forEach((icon) => {
    tlFall.to(icon, {
      y: gsap.utils.random(320, 900),
      x: gsap.utils.random(-180, 180),
      rotation: `+=${gsap.utils.random(-170, 170)}`,
      autoAlpha: gsap.utils.random(0.08, 0.22),
      duration: 1,
      ease: "none"
    }, 0);
  });

});
