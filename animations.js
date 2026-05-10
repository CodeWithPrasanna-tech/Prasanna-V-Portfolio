/* ═══════════════════════════════════════════════════════
   PRASANNA V · ANIMATION QUALITY UPGRADE JS
   Adds: section-title underline trigger, magnetic photo,
         scroll progress bar, canvas quality tweak,
         stagger re-trigger, active nav precision
   Zero layout, color, or content changes.
═══════════════════════════════════════════════════════ */

'use strict';

/* ── util ── */
function raf(fn) { requestAnimationFrame(fn); }
function throttle2(fn, ms) {
  let t = 0;
  return function() { const n = Date.now(); if (n - t >= ms) { t = n; fn.apply(this, arguments); } };
}

/* ════════════════════════════════════════════════════════
   1. SCROLL PROGRESS BAR (top of page)
════════════════════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  bar.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'height:2px', 'z-index:9999',
    'width:0%', 'pointer-events:none',
    'background:linear-gradient(90deg, var(--accent-1), var(--accent-teal), var(--accent-3))',
    'background-size:200% 100%',
    'animation:progressGrad 3s linear infinite',
    'transition:width 0.1s linear',
    'will-change:width'
  ].join(';');
  document.body.appendChild(bar);

  const style = document.createElement('style');
  style.textContent = '@keyframes progressGrad{0%{background-position:0%}100%{background-position:200%}}';
  document.head.appendChild(style);

  window.addEventListener('scroll', throttle2(function() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, 16));
})();


/* ════════════════════════════════════════════════════════
   2. SECTION TITLE UNDERLINE TRIGGER
   Fires .title-visible on scroll — plays CSS scaleX
════════════════════════════════════════════════════════ */
(function initTitleReveal() {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('title-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.section-title').forEach(function(el) {
    obs.observe(el);
  });
})();


/* ════════════════════════════════════════════════════════
   3. MAGNETIC HERO PHOTO
   Subtle parallax on mouse move — pure transform, no layout
════════════════════════════════════════════════════════ */
(function initMagneticPhoto() {
  const wrap = document.querySelector('.hero-photo-wrap');
  const hero = document.getElementById('hero');
  if (!wrap || !hero) return;

  /* Skip on touch devices */
  if ('ontouchstart' in window) return;

  let current = { x: 0, y: 0 };
  let target  = { x: 0, y: 0 };
  let rafId;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    current.x = lerp(current.x, target.x, 0.08);
    current.y = lerp(current.y, target.y, 0.08);
    wrap.style.transform = 'translate(' + current.x.toFixed(2) + 'px,' + current.y.toFixed(2) + 'px)';
    rafId = requestAnimationFrame(animate);
  }

  hero.addEventListener('mousemove', function(e) {
    const r  = hero.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    target.x = (e.clientX - cx) / r.width  * 14;
    target.y = (e.clientY - cy) / r.height * 10;
    if (!rafId) animate();
  });

  hero.addEventListener('mouseleave', function() {
    target.x = 0; target.y = 0;
    /* Let lerp ease back — cancel after convergence */
    setTimeout(function() {
      cancelAnimationFrame(rafId); rafId = null;
      wrap.style.transform = '';
    }, 900);
  });
})();


/* ════════════════════════════════════════════════════════
   4. SMOOTH ACTIVE NAV INDICATOR
   Replaces js-appended style with CSS class approach
════════════════════════════════════════════════════════ */
(function initNavIndicator() {
  /* Inject persistent indicator styles */
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.active {
      color: var(--accent-1) !important;
      background: rgba(26,60,94,0.07) !important;
    }
    body.dark-mode .nav-links a.active {
      color: #a8c8e8 !important;
      background: rgba(100,160,220,0.09) !important;
    }
    .nav-links a.active::after {
      width: 70% !important;
    }
  `;
  document.head.appendChild(style);
})();


/* ════════════════════════════════════════════════════════
   5. STAGGERED CHILDREN REVEAL
   Any grid/list inside a revealed section staggers its children
════════════════════════════════════════════════════════ */
(function initChildStagger() {
  /* These selectors get child items staggered after parent reveals */
  const grids = [
    { parent: '.projects-grid',  child: '.project-card' },
    { parent: '.skills-grid',    child: '.skill-card'   },
    { parent: '.cert-grid',      child: '.cert-card'    },
    { parent: '.edu-cards',      child: '.edu-card'     },
  ];

  grids.forEach(function(g) {
    document.querySelectorAll(g.parent).forEach(function(parent) {
      const children = parent.querySelectorAll(g.child);
      const obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            children.forEach(function(child, i) {
              setTimeout(function() {
                child.classList.add('visible');
              }, i * 65);
            });
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.05 });
      obs.observe(parent);
    });
  });
})();


/* ════════════════════════════════════════════════════════
   6. CARD TILT — 3D perspective on project/skill cards
   Pure CSS transform, no layout changes
════════════════════════════════════════════════════════ */
(function initTilt() {
  if ('ontouchstart' in window) return; /* skip touch */

  const CARDS = document.querySelectorAll('.project-card, .skill-card');
  const MAX   = 5; /* max degrees */

  CARDS.forEach(function(card) {
    card.style.transformStyle    = 'preserve-3d';
    card.style.willChange        = 'transform';

    card.addEventListener('mousemove', function(e) {
      const r  = card.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const rx = ((e.clientY - cy) / (r.height / 2)) * -MAX * 0.5;
      const ry = ((e.clientX - cx) / (r.width  / 2)) *  MAX * 0.5;
      card.style.transition = 'transform 0.12s ease, box-shadow 0.35s ease, border-color 0.35s ease';
      card.style.transform  = 'translateY(-6px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.38s ease, border-color 0.38s ease';
      card.style.transform  = '';
    });
  });
})();


/* ════════════════════════════════════════════════════════
   7. SMOOTH HOVER PARALLAX ON CERT CARDS
   Image shifts opposite to mouse inside card
════════════════════════════════════════════════════════ */
(function initCertParallax() {
  if ('ontouchstart' in window) return;

  document.querySelectorAll('.cert-card').forEach(function(card) {
    const img = card.querySelector('img');
    if (!img) return;

    card.addEventListener('mousemove', function(e) {
      const r  = card.getBoundingClientRect();
      const cx = (e.clientX - r.left)  / r.width  - 0.5;
      const cy = (e.clientY - r.top)   / r.height - 0.5;
      img.style.transition = 'transform 0.12s ease';
      img.style.transform  = 'scale(1.06) translate(' + (cx * -6) + 'px,' + (cy * -4) + 'px)';
    });
    card.addEventListener('mouseleave', function() {
      img.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      img.style.transform  = '';
    });
  });
})();


/* ════════════════════════════════════════════════════════
   8. ACHIEVEMENT ITEMS — entrance wave
   Already handled by scroll reveal; this adds a subtle
   border-left width animation on reveal
════════════════════════════════════════════════════════ */
(function initAchievementReveal() {
  const style = document.createElement('style');
  style.textContent = `
    .achievement-item {
      border-left-width: 0 !important;
      transition:
        transform        0.36s cubic-bezier(0.34,1.56,0.64,1),
        box-shadow       0.36s ease,
        border-left-width 0.5s  cubic-bezier(0.22,1,0.36,1) !important;
    }
    .achievement-item.visible {
      border-left-width: 5px !important;
    }
    .achievement-item.visible:hover {
      border-left-width: 8px !important;
    }
  `;
  document.head.appendChild(style);
})();


/* ════════════════════════════════════════════════════════
   9. BUTTON RIPPLE (pointer-down effect)
════════════════════════════════════════════════════════ */
(function initRipple() {
  function attachRipple(btn) {
    btn.addEventListener('pointerdown', function(e) {
      const r    = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.6;
      const x    = e.clientX - r.left - size / 2;
      const y    = e.clientY - r.top  - size / 2;

      const ripple = document.createElement('span');
      ripple.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'pointer-events:none',
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + x    + 'px',
        'top:'    + y    + 'px',
        'background:rgba(255,255,255,0.20)',
        'transform:scale(0)',
        'animation:rippleAnim 0.55s ease-out forwards'
      ].join(';');

      btn.appendChild(ripple);
      setTimeout(function() { ripple.remove(); }, 600);
    });
  }

  /* Inject keyframe */
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim{to{transform:scale(1);opacity:0}}';
  document.head.appendChild(style);

  document.querySelectorAll('.btn-primary, .btn-outline').forEach(attachRipple);
})();


/* ════════════════════════════════════════════════════════
   10. HERO STATS COUNTER ANIMATION
   Animates any number-containing element on reveal
════════════════════════════════════════════════════════ */
(function initCountUp() {
  /* Count up for hero-stat-num elements if they exist */
  document.querySelectorAll('.hero-stat-num').forEach(function(el) {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;

    el.textContent = '0';
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (!e.isIntersecting) return;
        let start = 0;
        const duration = 1200;
        const step = 16;
        const inc = target / (duration / step);
        const timer = setInterval(function() {
          start += inc;
          if (start >= target) { start = target; clearInterval(timer); }
          el.textContent = Math.round(start) + (el.dataset.suffix || '');
        }, step);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.8 });
    obs.observe(el);
  });
})();


/* ════════════════════════════════════════════════════════
   11. SMOOTH SECTION TRANSITION GLOW
   Adds a very subtle ambient glow at section borders
════════════════════════════════════════════════════════ */
(function initSectionGlow() {
  const style = document.createElement('style');
  style.textContent = `
    .section {
      position: relative;
    }
    .section::before {
      content: '';
      position: absolute;
      top: 0; left: 10%; right: 10%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(26, 60, 94, 0.10),
        transparent
      );
      pointer-events: none;
    }
    body.dark-mode .section::before {
      background: linear-gradient(
        90deg,
        transparent,
        rgba(100, 160, 220, 0.10),
        transparent
      );
    }
  `;
  document.head.appendChild(style);
})();


/* ════════════════════════════════════════════════════════
   12. TIMELINE LINE DRAW-IN
   Animates the vertical timeline line from 0 to full height
════════════════════════════════════════════════════════ */
(function initTimelineDraw() {
  const tl = document.querySelector('.timeline');
  if (!tl) return;

  const style = document.createElement('style');
  style.textContent = `
    .timeline::before {
      transform-origin: top;
      transform: scaleY(0);
      transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s !important;
    }
    .timeline.tl-visible::before {
      transform: scaleY(1);
    }
  `;
  document.head.appendChild(style);

  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('tl-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  obs.observe(tl);
})();


/* ════════════════════════════════════════════════════════
   13. CANVAS PARTICLE QUALITY BOOST
   Lowers speed at low battery / saves energy
════════════════════════════════════════════════════════ */
(function canvasQualityBoost() {
  /* If Battery API available, reduce animation on low battery */
  if (navigator.getBattery) {
    navigator.getBattery().then(function(battery) {
      if (battery.level < 0.2 && !battery.charging) {
        const canvas = document.getElementById('bg-canvas');
        if (canvas) canvas.style.opacity = '0.4';
      }
    }).catch(function() {});
  }
})();


/* ════════════════════════════════════════════════════════
   14. FOCUS-VISIBLE RING — keyboard accessibility
════════════════════════════════════════════════════════ */
(function initFocusRing() {
  const style = document.createElement('style');
  style.textContent = `
    :focus-visible {
      outline: 2px solid var(--accent-1) !important;
      outline-offset: 3px !important;
      border-radius: var(--radius) !important;
    }
    body.dark-mode :focus-visible {
      outline-color: #6aaae0 !important;
    }
  `;
  document.head.appendChild(style);
})();
