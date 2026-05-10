/* ═══════════════════════════════════════════════════════
   PRASANNA V · PORTFOLIO SCRIPT
   Features: Theme toggle, mobile nav, modals,
             AI voiceover (Web Speech API),
             scroll effects, contact form
═══════════════════════════════════════════════════════ */

/* ── Theme Toggle ── */
function toggleTheme() {
  const body = document.body;
  const btn  = document.getElementById('themeToggle');
  body.classList.toggle('dark-mode');
  const isDark = body.classList.contains('dark-mode');
  btn.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

/* Persist theme on load */
(function() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
  }
})();

/* ── Mobile Nav ── */
function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}
/* Close menu on link click */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('open');
  });
});

/* ── Navbar scroll shadow ── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Modal helpers ── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
}
/* Close modal with Escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
});

/* ── Contact Form ── */
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = '✓ Message Sent!';
  btn.style.background = 'var(--accent-3)';
  setTimeout(() => {
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
}

/* ── Intersection Observer: fade-in sections ── */
const observerOpts = { threshold: 0.08 };
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, observerOpts);
document.querySelectorAll('.section').forEach(s => {
  s.style.animationPlayState = 'paused';
  observer.observe(s);
});

/* ═══════════════════════════════════════════════════════
   AI VOICEOVER (Web Speech API)
═══════════════════════════════════════════════════════ */
const voiceTexts = {
  about: `Prasanna V is an ambitious BCA graduate operating at the intersection of Artificial Intelligence, Data Science, and Embedded Systems. With a strong command of Python and C++, he architects end-to-end intelligent solutions. His work spans microcontroller programming with ESP32 and Raspberry Pi, real-time computer vision pipelines using OpenCV, and IoT ecosystems. He is deeply focused on system optimization, low-latency processing, and scalable design. Prasanna is driven not just to build systems, but to engineer experiences that are intelligent, reliable, and future-ready.`,

  projects: `Prasanna has developed three major projects. First, an IoT-Based Office Automation System using OpenCV and MediaPipe for real-time face detection, attendance tracking, and secure access control. Second, a Line Follower Robot — an autonomous robotic system using infrared sensors for accurate path navigation and real-time decision-making. Third, a Smart Healthcare Wristband, a wearable IoT solution for real-time health monitoring, presented at an international conference at two engineering colleges.`,

  skills: `Prasanna's core skills include Python, C++, and algorithmic thinking. In AI and Data Science, he works with Machine Learning, OpenCV, and MediaPipe. For IoT and Embedded Systems, he has expertise with ESP32, Raspberry Pi, and sensor integration. His development tools include Google Colab, GitHub, VS Code, and Jupyter Notebooks. He also specializes in debugging, code optimization, and system validation.`,

  experience: `Prasanna currently works as a Python Programmer at Chase Technologies since March 2025, contributing to Python-based applications with a focus on performance, debugging, and maintainability. He also served as Technical Head of the Mathelets Club from January 2024 to December 2025, where he led technical initiatives, organized workshops, and mentored peers in programming and problem-solving.`,

  education: `Prasanna is pursuing his Bachelor of Computer Applications from S.A. College of Arts and Science, Chennai, with a CGPA equivalent of 79.61%, graduating in 2026. He completed his Higher Secondary from Kalaimagal Matric Higher Secondary School with 69.17%, and his Secondary education with 60%.`,

  achievements: `Prasanna has achieved several notable recognitions. He secured 1st Place in Math Bingo at Math O Fun 2K25 organized by SIMATS Engineering College, awarded for excellence in mathematical problem-solving and analytical thinking. He also won the Runner-Up position in Dumb Charades at the same event. He received a Consolation Prize at a National Level Project Competition for his innovative technical project. Most notably, he received an official Letter of Appreciation from Saveetha Engineering College for conducting an IoT workshop on Smart Applications including Blynk, Telegram, and ThingSpeak for the Electrical and Electronics Engineering Department in October 2025.`,
};

let currentUtterance = null;

function toggleVoiceover() {
  const panel = document.getElementById('voicePanel');
  panel.classList.toggle('hidden');
}

function stopVoiceover() {
  stopSpeaking();
  document.getElementById('voicePanel').classList.add('hidden');
}

function speakSection(section) {
  if (!('speechSynthesis' in window)) {
    document.getElementById('voiceStatus').textContent = 'Speech synthesis not supported in this browser.';
    return;
  }

  stopSpeaking();

  const text = voiceTexts[section];
  if (!text) return;

  const statusEl = document.getElementById('voiceStatus');
  statusEl.textContent = `▶ Reading: ${section.charAt(0).toUpperCase() + section.slice(1)}...`;

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate  = 0.95;
  currentUtterance.pitch = 1.0;
  currentUtterance.volume = 1.0;

  /* Try to pick a good English voice */
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes('Google UK English Male') ||
    v.name.includes('Microsoft David') ||
    v.name.includes('Daniel') ||
    (v.lang === 'en-IN' || v.lang === 'en-US')
  );
  if (preferred) currentUtterance.voice = preferred;

  currentUtterance.onend = () => {
    statusEl.textContent = '✓ Done.';
    setTimeout(() => { statusEl.textContent = 'Ready. Select a section to listen to.'; }, 2000);
  };

  window.speechSynthesis.speak(currentUtterance);

  /* Scroll to section */
  const el = document.getElementById(section);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.getElementById('voiceStatus').textContent = '⏹ Stopped.';
}

/* Voices may load async — reload voices list */
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

/* ── Active nav link highlighting on scroll ── */
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll('section[id]');

const scrollSpy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const id = entry.target.getAttribute('id');
      const active = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => scrollSpy.observe(s));

/* Active nav link style */
const style = document.createElement('style');
style.textContent = `.nav-links a.active { color: var(--accent-1); background: rgba(26,60,94,0.09); }`;
document.head.appendChild(style);
