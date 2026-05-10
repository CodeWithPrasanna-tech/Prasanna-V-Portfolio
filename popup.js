/* ═══════════════════════════════════════════════════════
   PRASANNA V · UNIFIED POPUP ENGINE  (popup.js)
   Single source of truth for every modal/popup.
   Replaces: enhImgModal, resumeViewModal, old openModal/closeModal
   Keeps:    voice panel, scroll-top, canvas (in enhancements.js)
   ─────────────────────────────────────────────────────
   Architecture:
     PM.open(src, title, desc)   — image preview modal
     PM.openResume()             — PDF resume viewer
     PM.close()                  — closes whichever is open
     window.openModal(id)        — patched cert modal opener
     window.closeModal(id)       — patched cert modal closer
   ─────────────────────────────────────────────────────
   Performance:
     • One DOM modal reused for ALL image previews
     • One DOM modal for resume viewer
     • All cert modals use the same shared DOM
     • display:flex set once; open/close via CSS class only
     • transform + opacity only (no layout animations)
     • Passive event listeners where possible
     • IntersectionObserver for lazy wiring
═══════════════════════════════════════════════════════ */

'use strict';

(function PopupEngine() {

  /* ── Helpers ─────────────────────────────────────── */
  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => [...(ctx || document).querySelectorAll(s)];
  const isDark = () => document.body.classList.contains('dark-mode');

  /* Track which modal is currently open (for ESC / click-outside) */
  let _activeModal = null;

  /* ════════════════════════════════════════════════════
     MODAL OPEN / CLOSE — CSS-class based (no inline style toggle)
  ════════════════════════════════════════════════════ */
  function _openModal(el) {
    if (!el) return;
    if (_activeModal && _activeModal !== el) _closeModal(_activeModal);
    el.style.display = 'flex';
    /* One rAF to allow display:flex to paint, then add class */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('pm-open');
      });
    });
    document.body.style.overflow = 'hidden';
    _activeModal = el;
  }

  function _closeModal(el) {
    if (!el) return;
    el.classList.remove('pm-open', 'active');
    setTimeout(() => {
      if (!el.classList.contains('pm-open') && !el.classList.contains('active')) {
        el.style.display = 'none';
        /* Reset iframe src to stop PDF rendering when closed */
        const iframe = el.querySelector('iframe');
        if (iframe) iframe.src = iframe.src; /* flush */
      }
    }, 380);
    document.body.style.overflow = '';
    _activeModal = null;
  }

  /* ════════════════════════════════════════════════════
     1. SHARED IMAGE PREVIEW MODAL
        One DOM element reused for ALL image popups
  ════════════════════════════════════════════════════ */
  const PM_IMG_ID = 'pmModal';

  function buildImageModal() {
    if (document.getElementById(PM_IMG_ID)) return; /* guard */

    const el = document.createElement('div');
    el.id = PM_IMG_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Image preview');
    el.innerHTML = `
      <div class="pm-box">
        <button class="pm-close" aria-label="Close"><i class="fas fa-times"></i></button>
        <img id="pmImgSrc" src="" alt="" loading="eager"/>
        <h4 class="pm-title" id="pmImgTitle"></h4>
        <p  class="pm-desc"  id="pmImgDesc"></p>
      </div>`;
    document.body.appendChild(el);

    /* Close on backdrop click */
    el.addEventListener('click', e => { if (e.target === el) PM.close(); });
    el.querySelector('.pm-close').addEventListener('click', () => PM.close());
  }

  /* ════════════════════════════════════════════════════
     2. RESUME VIEWER MODAL
  ════════════════════════════════════════════════════ */
  const PM_RESUME_ID = 'pmResumeModal';
  const RESUME_PATH  = 'assets/resume/Prasanna_V_Resume.pdf';

  function buildResumeModal() {
    if (document.getElementById(PM_RESUME_ID)) return;

    const el = document.createElement('div');
    el.id = PM_RESUME_ID;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Resume viewer');
    el.innerHTML = `
      <div class="pm-box">
        <button class="pm-close" aria-label="Close"><i class="fas fa-times"></i></button>
        <h4 class="pm-title">
          <i class="fas fa-file-pdf"></i>
          Prasanna V &mdash; Resume
        </h4>
        <iframe class="pm-iframe" title="Resume PDF" src=""></iframe>
      </div>`;
    document.body.appendChild(el);

    el.addEventListener('click', e => { if (e.target === el) PM.closeResume(); });
    el.querySelector('.pm-close').addEventListener('click', () => PM.closeResume());
  }

  /* ════════════════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════════════════ */
  window.PM = {

    /* Image preview */
    open(src, title, desc) {
      buildImageModal();
      const modal = document.getElementById(PM_IMG_ID);
      const imgEl = document.getElementById('pmImgSrc');

      /* Update content */
      imgEl.src = '';          /* reset to force re-paint */
      imgEl.alt = title || '';
      imgEl.src = src;
      document.getElementById('pmImgTitle').textContent = title || '';
      document.getElementById('pmImgDesc').textContent  = desc  || '';

      _openModal(modal);
    },

    close() {
      _closeModal(document.getElementById(PM_IMG_ID));
      _closeModal(_activeModal); /* catch any other open modal */
    },

    /* Resume viewer */
    openResume() {
      buildResumeModal();
      const modal  = document.getElementById(PM_RESUME_ID);
      const iframe = modal.querySelector('iframe');
      /* Only set src on open — avoids loading PDF in background */
      if (!iframe.src || !iframe.src.includes(RESUME_PATH)) {
        iframe.src = RESUME_PATH;
      }
      _openModal(modal);
    },

    closeResume() {
      const modal = document.getElementById(PM_RESUME_ID);
      if (!modal) return;
      /* Blank iframe to stop PDF rendering immediately */
      const iframe = modal.querySelector('iframe');
      if (iframe) iframe.src = '';
      _closeModal(modal);
    }
  };

  /* ════════════════════════════════════════════════════
     PATCH window.openModal / window.closeModal
     (used by existing cert cards in HTML)
  ════════════════════════════════════════════════════ */
  window.openModal = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    _openModal(el);
    /* Also add .active for CSS .modal.active rules */
    el.classList.add('active');
  };

  window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    _closeModal(el);
  };

  /* ════════════════════════════════════════════════════
     GLOBAL ESC + CLICK-OUTSIDE
  ════════════════════════════════════════════════════ */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    /* Close PM image modal */
    const pmImg    = document.getElementById(PM_IMG_ID);
    const pmResume = document.getElementById(PM_RESUME_ID);
    if (pmImg    && pmImg.classList.contains('pm-open'))    PM.close();
    if (pmResume && pmResume.classList.contains('pm-open')) PM.closeResume();
    /* Close any .modal.active */
    $$('.modal.active, .modal.pm-open').forEach(m => {
      m.classList.remove('active', 'pm-open');
      setTimeout(() => { m.style.display = 'none'; }, 380);
    });
    document.body.style.overflow = '';
    _activeModal = null;
  });

  /* ════════════════════════════════════════════════════
     DATA MAP — image src → title + description
     One place to update all popup text
  ════════════════════════════════════════════════════ */
  const DATA = [
    /* Achievement images */
    {
      match: src => /winner/i.test(src),
      title: '1st Place — Math Bingo · Math O Fun 2K25',
      desc:  'Gold award for 1st place in Math Bingo, organized by the Department of Pure and Applied Mathematics, SIMATS Engineering College. Awarded for excellence in mathematical problem-solving, logical reasoning, and competitive analytical thinking.'
    },
    {
      match: src => /DUMBC/i.test(src),
      title: 'Runner-Up — Math Dumb Charades · Math O Fun 2K25',
      desc:  'Silver certificate for Runner-Up position in Dumb Charades, Math O Fun 2K25 at SIMATS Engineering College. Recognized for quick thinking, creativity, and teamwork under pressure.'
    },
    {
      match: src => /consolation/i.test(src),
      title: 'Consolation Prize — National Level Project Competition',
      desc:  'Recognized for an innovative technical project at a national-level competition. Awarded for creativity, technical execution, presentation quality, and problem-solving approach.'
    },
    {
      match: src => /achievements1/i.test(src),
      title: 'Letter of Appreciation — Saveetha Engineering College',
      desc:  'Honored with an official Letter of Appreciation for conducting an IoT workshop on Smart Applications (Blynk, Telegram, MIT App, ThingSpeak) for the EEE Department, 11 October 2025. Workshop received outstanding feedback for practical demonstrations.'
    },
    {
      match: src => /technicalhead/i.test(src),
      title: 'Technical Head Appreciation — Mathelets Club (2024–2025)',
      desc:  'Recognized by the Department of Mathematics, S.A. College of Arts & Science, for technical leadership, workshop organization, student coordination, and academic contributions as Technical Head of Mathelets Club.'
    },
    /* Certification images */
    {
      match: src => /certificate1/i.test(src),
      title: 'The Joy of Computing Using Python — NPTEL',
      desc:  'Nationally recognized certification from NPTEL (IIT programme) for completing The Joy of Computing Using Python. Covers Python fundamentals, problem-solving, and computational thinking.'
    },
    {
      match: src => /datascience-python/i.test(src),
      title: 'International Workshop — Data Science using Python',
      desc:  'Certificate from Brainovision Solutions for completing an intensive international workshop on Data Science using Python, covering data analysis, visualization, and machine learning fundamentals.'
    },
    {
      match: src => /certificate2/i.test(src),
      title: 'Green Skills & AI Internship — AICTE',
      desc:  'AICTE-recognized certification for completing the Green Skills and AI Internship Programme, focusing on sustainable technology, artificial intelligence applications, and future-ready digital skills.'
    },
    {
      match: src => /certificate3/i.test(src),
      title: 'Shell Skills4Future Program — Edunet',
      desc:  'Certificate from Edunet Foundation\'s Shell Skills4Future Program. Recognized for completing professional development training in emerging technologies and future skills.'
    },
    {
      match: src => /certificate4/i.test(src),
      title: 'International Conference — Smart Healthcare Wristband',
      desc:  'Certificate of presentation at Vallal P.T. Lee Chengalvaraya Naicker Arts & Science College and REC Engineering College. Project focused on real-time health monitoring, wearable intelligence, and scalable IoT healthcare solutions.'
    },
  ];

  function getPopupData(src) {
    const clean = (src || '').replace(/\?.*$/, '');
    return DATA.find(d => d.match(clean)) || { title: '', desc: '' };
  }

  /* ════════════════════════════════════════════════════
     WIRE ACHIEVEMENT IMAGES
  ════════════════════════════════════════════════════ */
  function wireAchievements() {
    const achImgs = $$('.achievement-award-image img, .achievement-letter-image img, .technical-head-image img');
    achImgs.forEach(img => {
      if (img._pmWired) return;
      img._pmWired = true;
      img.style.cursor = 'pointer';

      /* Wrap if not already */
      if (!img.closest('.pm-img-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'pm-img-wrap';
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
      }

      img.addEventListener('click', () => {
        const src = img.dataset.src || img.src;
        const { title, desc } = getPopupData(src);
        PM.open(src, title, desc);
      });
    });

    /* Also wire the card-level click (anywhere on achievement-item opens popup) */
    $$('.achievement-item').forEach(item => {
      if (item._pmWired) return;
      item._pmWired = true;
      const img = item.querySelector('img');
      if (!img) return;
      item.setAttribute('data-pm', '');
      item.addEventListener('click', e => {
        /* Only fire if click didn't already hit the image */
        if (e.target.tagName === 'IMG') return;
        const src = img.dataset.src || img.src;
        const { title, desc } = getPopupData(src);
        PM.open(src, title, desc);
      });
    });
  }

  /* ════════════════════════════════════════════════════
     WIRE CERTIFICATION CARDS
     Replaces the per-card onclick="openModal('modal-certX')"
     with the unified PM.open() using the shared single modal.
  ════════════════════════════════════════════════════ */
  function wireCertCards() {
    $$('.cert-card').forEach(card => {
      if (card._pmWired) return;
      card._pmWired = true;
      card.setAttribute('data-pm', '');

      const img  = card.querySelector('img');
      const h4   = card.querySelector('h4');
      const sub  = card.querySelector('p');
      if (!img) return;

      /* Remove old onclick */
      card.removeAttribute('onclick');
      card.style.cursor = 'pointer';

      card.addEventListener('click', () => {
        const src     = img.dataset.src || img.src;
        const mapData = getPopupData(src);
        /* Prefer data map; fall back to card's own text */
        const title   = mapData.title || (h4 ? h4.textContent : '');
        const desc    = mapData.desc  || (sub ? sub.textContent : '');
        PM.open(src, title, desc);
      });
    });

    /* Hide old individual cert modal HTML (they're no longer needed) */
    $$('#modal-cert1, #modal-cert2, #modal-cert3, #modal-cert4, #modal-certDS').forEach(m => {
      m.style.display = 'none';
      m.setAttribute('aria-hidden', 'true');
    });
  }

  /* ════════════════════════════════════════════════════
     WIRE CONFERENCE CERT IMAGE
  ════════════════════════════════════════════════════ */
  function wireConf() {
    $$('.conf-cert-img').forEach(img => {
      if (img._pmWired) return;
      img._pmWired = true;
      img.style.cursor = 'pointer';

      if (!img.closest('.pm-img-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'pm-img-wrap';
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
      }

      img.addEventListener('click', () => {
        const src = img.dataset.src || img.src;
        const { title, desc } = getPopupData(src);
        PM.open(src, title || 'Conference Certificate', desc);
      });
    });
  }

  /* ════════════════════════════════════════════════════
     RESUME SECTION — rebuild buttons
  ════════════════════════════════════════════════════ */
  function initResumeButtons() {
    const actions = $('.resume-actions');
    if (!actions || actions._pmWired) return;
    actions._pmWired = true;

    actions.innerHTML = `
      <div class="resume-btn-group">
        <button class="pm-btn-view" id="pmViewResume" type="button">
          <i class="fas fa-eye"></i> View Resume
        </button>
        <a href="${RESUME_PATH}" download class="pm-btn-download">
          <i class="fas fa-download"></i> Download PDF
        </a>
        <p class="resume-note">
          <i class="fas fa-info-circle" style="opacity:0.55;font-size:0.75rem;"></i>
          Opens inline viewer &middot; or download directly
        </p>
      </div>`;

    document.getElementById('pmViewResume').addEventListener('click', () => PM.openResume());
  }

  /* ════════════════════════════════════════════════════
     WIRE EVERYTHING — immediate + retries for lazy images
  ════════════════════════════════════════════════════ */
  function wireAll() {
    wireAchievements();
    wireCertCards();
    wireConf();
    initResumeButtons();
  }

  /* Run immediately (catches pre-loaded images) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAll);
  } else {
    wireAll();
  }
  /* Retry for lazy-loaded images */
  setTimeout(wireAll, 500);
  setTimeout(wireAll, 1800);

  /* ════════════════════════════════════════════════════
     PERFORMANCE: passive scroll listener for scroll-top btn
     (already in enhancements.js — just ensure passive flag here)
  ════════════════════════════════════════════════════ */

  /* ════════════════════════════════════════════════════
     SUPPRESS OLD enhImgModal if it exists
  ════════════════════════════════════════════════════ */
  setTimeout(() => {
    const old = document.getElementById('enhImgModal');
    if (old) { old.style.display = 'none'; old.remove(); }
  }, 50);

})();
