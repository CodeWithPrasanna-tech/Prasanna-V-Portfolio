/* ═══════════════════════════════════════════════════════
   PRASANNA V · PORTFOLIO ENHANCEMENTS v2
   Fixed: achievement popups, cert popups, resume view btn,
          hero glowing balls, card hover tilt, image fitting,
          tech head image, lazy load + modal data-src fix
═══════════════════════════════════════════════════════ */
'use strict';

function throttle(fn, ms) {
  let last = 0;
  return function(...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}

/* ═══════════════════════════════════════════════════════
   CANVAS PARTICLE NETWORK BACKGROUND
═══════════════════════════════════════════════════════ */
(function initCanvasBg() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], raf;
  const N = 42;

  function isDark() { return document.body.classList.contains('dark-mode'); }
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }

  function mkPt() {
    return { x: Math.random()*W, y: Math.random()*H,
             vx: (Math.random()-0.5)*0.30, vy: (Math.random()-0.5)*0.30,
             r: Math.random()*1.6+0.5, a: Math.random()*0.42+0.08,
             ci: Math.floor(Math.random()*4) };
  }

  const LC = ['rgba(26,60,94,','rgba(46,125,82,','rgba(181,69,27,','rgba(200,148,42,'];
  const DC = ['rgba(80,140,220,','rgba(70,190,130,','rgba(220,120,70,','rgba(200,170,60,'];

  function draw() {
    ctx.clearRect(0,0,W,H);
    const C = isDark() ? DC : LC;
    for (let i=0;i<pts.length;i++) {
      for (let j=i+1;j<pts.length;j++) {
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.sqrt(dx*dx+dy*dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle = C[0]+((1-d/120)*(isDark()?0.08:0.05))+')';
          ctx.lineWidth=0.8; ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=C[p.ci]+p.a+')'; ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      p.a+=(Math.random()-0.5)*0.008; p.a=Math.max(0.05,Math.min(0.55,p.a));
      if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
      if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
    });
  }

  function start() {
    resize(); pts=[];
    for(let i=0;i<N;i++) pts.push(mkPt());
    if(raf) cancelAnimationFrame(raf);
    (function loop(){ draw(); raf=requestAnimationFrame(loop); })();
  }

  window.addEventListener('resize', throttle(()=>{resize();pts=[];for(let i=0;i<N;i++)pts.push(mkPt());},300));
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) cancelAnimationFrame(raf); else start(); });
  start();
})();


/* ═══════════════════════════════════════════════════════
   HERO: PREMIUM DEPTH SYSTEM
   Injects: ambient orbs, photo glow ring, 3 glow balls,
            extra photo rings, entrance animation
═══════════════════════════════════════════════════════ */
(function initHeroEffects() {
  const hero = document.getElementById('hero');
  const wrap = document.querySelector('.hero-photo-wrap');
  if (!hero || !wrap) return;

  /* ── 1. Ambient mesh glow orbs (behind everything) ── */
  ['hero-orb-a', 'hero-orb-b'].forEach(function(cls) {
    const o = document.createElement('div');
    o.className = 'hero-orb ' + cls;
    hero.insertBefore(o, hero.firstChild);
  });

  /* ── 2. Photo glow pulse (sits behind photo, inside wrap) ── */
  const glow = document.createElement('div');
  glow.className = 'hero-photo-glow';
  wrap.insertBefore(glow, wrap.firstChild);

  /* ── 3. Extra spinning rings ── */
  ['hero-photo-ring-2', 'hero-photo-ring-3'].forEach(function(cls) {
    if (wrap.querySelector('.' + cls)) return; // don't double-inject
    const r = document.createElement('div');
    r.className = cls;
    wrap.appendChild(r);
  });

  /* ── 4. Three floating glow balls ── */
  ['hero-glow-ball-1', 'hero-glow-ball-2', 'hero-glow-ball-3'].forEach(function(cls) {
    if (wrap.querySelector('.' + cls)) return; // guard
    const b = document.createElement('div');
    b.className = 'hero-glow-ball ' + cls;
    wrap.appendChild(b);
  });

  /* ── 5. Terracotta mid-section orb (deep background) ── */
  const terracotta = document.createElement('div');
  terracotta.style.cssText = [
    'position:absolute', 'width:300px', 'height:300px', 'border-radius:50%',
    'pointer-events:none', 'z-index:2', 'filter:blur(70px)',
    'background:rgba(181,69,27,1)', 'opacity:0.055',
    'top:50%', 'left:11%', 'transform:translateY(-50%)',
    'animation:heroBgPulse 16s ease-in-out infinite 3s',
    'will-change:transform'
  ].join(';');
  hero.appendChild(terracotta);
})();


/* ═══════════════════════════════════════════════════════
   HERO: TECH ICON FLOATERS
═══════════════════════════════════════════════════════ */
(function initTechFloaters() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  const icons=['fa-microchip','fa-brain','fa-robot','fa-database','fa-wifi','fa-cogs','fa-code','fa-network-wired','fa-laptop-code'];
  const colors=['var(--accent-1)','var(--accent-3)','var(--accent-teal)','var(--accent-gold)','var(--accent-2)'];
  for(let i=0;i<8;i++){
    const f=document.createElement('i');
    f.className='fas '+icons[Math.floor(Math.random()*icons.length)]+' tech-floater';
    f.style.cssText='left:'+(Math.random()*88+6)+'%;top:'+(Math.random()*88+6)+'%;color:'+colors[Math.floor(Math.random()*colors.length)]+';animation-duration:'+(Math.random()*14+8)+'s;animation-delay:'+(Math.random()*12)+'s;animation-iteration-count:infinite;font-size:'+(Math.random()*10+8)+'px;position:absolute;';
    hero.appendChild(f);
  }
})();


/* ═══════════════════════════════════════════════════════
   FLOATING GEOMETRIC SHAPES
═══════════════════════════════════════════════════════ */
(function initGeoShapes() {
  const types=['triangle','square','circle-outline','diamond'];
  function addShapes(container, count) {
    if(getComputedStyle(container).position==='static') container.style.position='relative';
    for(let i=0;i<count;i++){
      const s=document.createElement('div');
      s.className='geo-shape '+types[Math.floor(Math.random()*types.length)];
      s.style.cssText='left:'+(Math.random()*88+6)+'%;top:'+(Math.random()*80+10)+'%;animation-duration:'+(Math.random()*12+8)+'s;animation-delay:'+(Math.random()*8)+'s;animation-iteration-count:infinite;opacity:0;position:absolute;';
      container.appendChild(s);
    }
  }
  document.querySelectorAll('.section').forEach(s=>addShapes(s,3));
  const hero=document.getElementById('hero'); if(hero) addShapes(hero,5);
})();


/* ═══════════════════════════════════════════════════════
   SECTION BACKGROUND BLOBS
═══════════════════════════════════════════════════════ */
(function initSectionBlobs() {
  const colors=['#1a3c5e','#2e7d52','#1d6f78','#c8942a'];
  document.querySelectorAll('.section.alt-bg').forEach((sec,i)=>{
    sec.style.position='relative'; sec.style.overflow='hidden';
    const b=document.createElement('div');
    b.style.cssText='position:absolute;width:380px;height:380px;border-radius:50%;filter:blur(100px);opacity:0.045;pointer-events:none;z-index:0;will-change:transform;background:'+colors[i%4]+';'+(i%2===0?'top:-90px;right:-90px;':'bottom:-90px;left:-90px;')+'animation:blobDrift '+(14+i*3)+'s ease-in-out infinite alternate;';
    sec.insertBefore(b,sec.firstChild);
  });
  document.querySelectorAll('.section .container').forEach(c=>{ c.style.position='relative'; c.style.zIndex='1'; });
})();


/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════════════════ */
(function initScrollReveal() {
  const map=[
    ['.project-card','reveal-fade'],
    ['.skill-card','reveal-scale'],
    ['.timeline-item','reveal-left'],
    ['.edu-card','reveal-fade'],
    ['.cert-card','reveal-scale'],
    ['.achievement-item','reveal-fade'],
    ['.achievement-letter-card','reveal-right'],
    ['.conf-card','reveal-fade'],
    ['.about-img-col','reveal-left'],
    ['.about-text-col','reveal-right'],
    ['.resume-panel','reveal-fade'],
    ['.contact-grid','reveal-fade'],
    ['.section-title','reveal-fade'],
  ];
  const stags=['stagger-1','stagger-2','stagger-3','stagger-4','stagger-5'];
  map.forEach(([sel,cls])=>{
    document.querySelectorAll(sel).forEach((el,i)=>{
      el.classList.add(cls); if(i<5) el.classList.add(stags[i]);
    });
  });
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); } });
  },{threshold:0.07,rootMargin:'0px 0px -28px 0px'});
  document.querySelectorAll('.reveal-fade,.reveal-left,.reveal-right,.reveal-scale').forEach(el=>obs.observe(el));
})();


/* ═══════════════════════════════════════════════════════
   CARD PROXIMITY TILT (subtle mouse effect)
═══════════════════════════════════════════════════════ */
(function initCardTilt() {
  const cards=document.querySelectorAll('.project-card,.skill-card,.cert-card,.edu-card');
  const MAX=6; // max degrees
  cards.forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const dx=(e.clientX-cx)/(r.width/2)*MAX;
      const dy=(e.clientY-cy)/(r.height/2)*MAX;
      card.style.transform=`translateY(-6px) rotateX(${-dy*0.4}deg) rotateY(${dx*0.4}deg)`;
    });
    card.addEventListener('mouseleave',()=>{
      card.style.transform='';
      card.style.transition='transform 0.5s ease, box-shadow 0.35s ease, border-color 0.35s ease';
    });
    card.addEventListener('mouseenter',()=>{
      card.style.transition='transform 0.15s ease, box-shadow 0.35s ease, border-color 0.35s ease';
    });
  });
})();


/* ═══════════════════════════════════════════════════════
   LAZY IMAGE LOADING
═══════════════════════════════════════════════════════ */
(function initLazyImages() {
  if(!('IntersectionObserver' in window)) return;
  const BLANK='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const img=e.target, src=img.dataset.src;
        if(src){ const t=new Image(); t.onload=()=>{ img.src=src; img.classList.remove('lazy-loading'); img.classList.add('lazy-loaded'); }; t.src=src; }
        obs.unobserve(img);
      }
    });
  },{rootMargin:'280px 0px'});
  // Skip hero photo (above fold)
  document.querySelectorAll('img:not(.hero-photo):not([src^="data:"])').forEach(img=>{
    if(!img.src||img.closest('video')||img.id==='enhImgSrc') return;
    img.dataset.src=img.src; img.src=BLANK; img.classList.add('lazy-loading');
    obs.observe(img);
  });
  document.querySelectorAll('video').forEach(v=>v.setAttribute('preload','none'));
})();


/* ═══════════════════════════════════════════════════════
   IMAGE POPUPS, CERT MODALS, RESUME BUTTONS
   → Fully handled by popup.js (loaded before this file)
   → PM.open(), PM.openResume(), window.openModal() patched there
═══════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════
   VOICE PANEL FAB + WAVEFORM + PATCHES
═══════════════════════════════════════════════════════ */
(function initVoiceFAB(){
  // FAB
  const fab=document.createElement('button');
  fab.id='voiceFab'; fab.title='AI Voice Assistant';
  fab.innerHTML='<i class="fas fa-microphone-alt"></i>';
  document.body.appendChild(fab);

  // Scroll to top
  const stb=document.createElement('button');
  stb.id='scrollTopBtn'; stb.title='Back to top';
  stb.innerHTML='<i class="fas fa-chevron-up"></i>';
  stb.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  document.body.appendChild(stb);
  window.addEventListener('scroll',throttle(()=>{ stb.classList.toggle('visible',window.scrollY>400); },120));

  // Waveform inside status
  const statusEl=document.getElementById('voiceStatus');
  if(statusEl){
    const wave=document.createElement('div');
    wave.className='voice-wave'; wave.id='voiceWave';
    wave.innerHTML='<span></span><span></span><span></span><span></span><span></span>';
    statusEl.appendChild(wave);
  }

  function getPanel(){ return document.getElementById('voicePanel'); }

  fab.addEventListener('click',()=>{
    const panel=getPanel(); if(!panel) return;
    const hidden=panel.classList.contains('hidden');
    if(hidden){ panel.classList.remove('hidden'); fab.classList.add('panel-open'); fab.innerHTML='<i class="fas fa-times"></i>'; }
    else { panel.classList.add('hidden'); fab.classList.remove('panel-open'); fab.innerHTML='<i class="fas fa-microphone-alt"></i>'; }
  });

  const navBtn=document.getElementById('voiceBtn');
  if(navBtn) navBtn.addEventListener('click',e=>{ e.stopPropagation(); fab.click(); });

  // Patch speakSection
  const origSpeak=window.speakSection;
  if(origSpeak){
    window.speakSection=function(section){
      origSpeak(section);
      document.getElementById('voiceWave')?.classList.add('active');
      document.querySelectorAll('.voice-section-btns button').forEach(b=>{
        b.classList.remove('speaking');
        if((b.getAttribute('onclick')||'').includes("'"+section+"'")||(b.getAttribute('onclick')||'').includes('"'+section+'"')) b.classList.add('speaking');
      });
    };
  }
  const origStop=window.stopSpeaking;
  if(origStop){ window.stopSpeaking=function(){ origStop(); document.getElementById('voiceWave')?.classList.remove('active'); document.querySelectorAll('.voice-section-btns button').forEach(b=>b.classList.remove('speaking')); }; }
  const origStopPanel=window.stopVoiceover;
  if(origStopPanel){ window.stopVoiceover=function(){ origStopPanel(); fab.classList.remove('panel-open'); fab.innerHTML='<i class="fas fa-microphone-alt"></i>'; document.getElementById('voiceWave')?.classList.remove('active'); }; }
})();


/* ═══════════════════════════════════════════════════════
   HERO ENTRANCE — photo wrap fade-in (text handled by animations.css)
═══════════════════════════════════════════════════════ */
(function heroEntrance(){
  /* Photo wrap enters from slight scale */
  const wrap = document.querySelector('.hero-photo-wrap');
  if (wrap) {
    wrap.style.cssText += 'opacity:0;transform:translateX(-18px);transition:opacity 1.0s cubic-bezier(0.22,1,0.36,1),transform 1.0s cubic-bezier(0.22,1,0.36,1);';
    setTimeout(function() { wrap.style.opacity='1'; wrap.style.transform='translateX(0)'; }, 80);
  }
})();


/* ═══════════════════════════════════════════════════════
   PERFORMANCE: LOW-END DEVICE ADAPTATION
═══════════════════════════════════════════════════════ */
(function perfAdapt(){
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const lowEnd=(navigator.hardwareConcurrency||4)<=2||(navigator.deviceMemory||4)<=2;
  if(reduced||lowEnd){
    const c=document.getElementById('bg-canvas'); if(c) c.style.display='none';
    document.querySelectorAll('.geo-shape,.tech-floater,.hero-orb,.hero-photo-glow').forEach(function(el){
      el.style.animation='none'; el.style.display='none';
    });
    /* Keep balls but remove blur for performance */
    document.querySelectorAll('.hero-glow-ball').forEach(function(el){
      el.style.filter='none'; el.style.opacity='0.3';
    });
  }
})();
