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

  if (!titlePanel || !captionPanel || !middlePanel || !rightPanel || !questionsPanel || !revealText) {
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

  const iconCount = 18;
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

  if (prefersReducedMotion) {
    gsap.set([titlePanel, captionPanel, middlePanel, rightPanel, questionsPanel, revealText], {
      clearProps: "all"
    });
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
    y: 180,
    autoAlpha: 0
  });

  gsap.set(revealText, {
    y: 120,
    rotation: 0,
    autoAlpha: 0
  });

  floatingIcons.forEach((icon, index) => {
    gsap.set(icon, {
      left: `${8 + (index % 5) * 18}%`,
      top: `${10 + Math.floor(index / 5) * 22}%`,
      xPercent: -50,
      yPercent: -50,
      autoAlpha: gsap.utils.random(0.12, 0.24),
      rotation: gsap.utils.random(-28, 28),
      scale: gsap.utils.random(0.7, 1.2)
    });
  });

/* -------------------------
   Stage 1 — pinned freefall
   top cluster enters, drifts, and fully exits
   bottom panel stays hidden until after that
   ------------------------- */
const tlFall = gsap.timeline({
  scrollTrigger: {
    trigger: ch3,
    start: "top top",
    end: () => "+=" + Math.round(window.innerHeight * 1.7),
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

  // only now does the bottom panel come up
.to(questionsPanel, {
  y: -340,
  autoAlpha: 1,
  duration: 0.22,
  ease: "none"
}, 0.92);

// icon parallax / drowning effect
floatingIcons.forEach((icon) => {
  tlFall.to(icon, {
    y: gsap.utils.random(220, 520),
    x: gsap.utils.random(-80, 80),
    rotation: `+=${gsap.utils.random(-90, 90)}`,
    autoAlpha: gsap.utils.random(0.08, 0.22),
    duration: 1,
    ease: "none"
  }, 0);
});

/* -------------------------
   Stage 2 — delayed split reveal for bottom panel
   starts only when the bottom panel is actually in view
   ------------------------- */
let splitRoot = questionsPanel.querySelector(".ch3-splitter");

if (!splitRoot) {
  splitRoot = document.createElement("div");
  splitRoot.className = "ch3-splitter";
  splitRoot.innerHTML = `
    <div class="ch3-split-half ch3-split-left"></div>
    <div class="ch3-split-half ch3-split-right"></div>
  `;
  questionsPanel.appendChild(splitRoot);
}

const splitLeft = splitRoot.querySelector(".ch3-split-left");
const splitRight = splitRoot.querySelector(".ch3-split-right");

// text INSIDE the breaking panel
const questionsText = questionsPanel.querySelectorAll("h4, h5, p");

// clean starting states
gsap.set(splitRoot, { autoAlpha: 0 });
gsap.set([splitLeft, splitRight], {
  xPercent: 0,
  autoAlpha: 1
});

gsap.set(revealText, {
  autoAlpha: 0,
  scale: 0.18,
  rotation: 0,
  transformOrigin: "50% 50%"
});

gsap.set(questionsPanel, {
  autoAlpha: 1,
  clearProps: "backgroundColor,borderColor"
});

const tlSplit = gsap.timeline({
  scrollTrigger: {
  trigger: ch3,
  start: () => tlFall.scrollTrigger.end,
  end: () => tlFall.scrollTrigger.end + window.innerHeight * 1.8,
  scrub: 1,
  pin: questionsPanel,
  pinSpacing: true,
  invalidateOnRefresh: true,
  anticipatePin: 1
  // markers: true
}
});

tlSplit
  // reset position first
  .set(questionsPanel, {
    y: 0,
    autoAlpha: 1
  }, 0)
  
  // hold the full panel visibly on screen
  .to(questionsPanel, {
    autoAlpha: 1,
    y: 0,
    duration: 0.16,
    ease: "none"
  }, 0)

  // fake split face appears
  .to(splitRoot, {
    autoAlpha: 1,
    duration: 0.08,
    ease: "none"
  }, 0.30)

  // original panel text disappears BEFORE split opens
  .to(questionsText, {
    autoAlpha: 0,
    duration: 0.10,
    ease: "none"
  }, 0.32)

  // original face fades away
  .to(questionsPanel, {
    autoAlpha: 0,
    duration: 0.08,
    ease: "none"
  }, 0.36)

  // split opens
  .to(splitLeft, {
    xPercent: -135,
    duration: 0.24,
    ease: "none"
  }, 0.46)

  .to(splitRight, {
    xPercent: 135,
    duration: 0.24,
    ease: "none"
  }, 0.46)

  // hidden text scales in
  .to(revealText, {
    autoAlpha: 1,
    scale: 1,
    duration: 0.22,
    ease: "none"
  }, 0.58)

  // hidden text grows huge
  .to(revealText, {
    scale: 4.8,
    autoAlpha: 1,
    duration: 0.24,
    ease: "none"
  }, 0.74)

  // background returns to white AFTER the text is clearly visible
  .to(ch3, {
    backgroundColor: "var(--surface-primary)",
    duration: 0.22,
    ease: "none"
  }, 0.80)

  // split face fades away
  .to(splitRoot, {
    autoAlpha: 0,
    duration: 0.10,
    ease: "none"
  }, 0.84)

  // huge text dissolves
  .to(revealText, {
    autoAlpha: 0,
    duration: 0.12,
    ease: "none"
  }, 0.96)}

);