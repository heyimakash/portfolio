// ============================================================
//  SHARED JS — Navigation, Scroll Animations, Mobile Menu
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Active nav link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Hamburger / Mobile Menu ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
      }
    });
  }

  // ---- Scroll animations (Intersection Observer) ----
  const fadeEls = document.querySelectorAll('.fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));

  // ---- Navbar scroll effect ----
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,0.5)';
      } else {
        navbar.style.boxShadow = 'none';
      }
    });
  }

  // ---- Animated counter ----
  function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // ---- Skill bar animation ----
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.dataset.width;
        setTimeout(() => { bar.style.width = width + '%'; }, 100);
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(b => skillObserver.observe(b));

  // ---- Typewriter effect ----
  const typeEl = document.getElementById('typewriter');
  if (typeEl) {
    const phrases = [
      'Executive Merchandiser',
      'Supply Chain Strategist',
      'Operations Leader',
      'Client Relations Expert',
      'Python Programmer',
      'Data-Driven Professional',
    ];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let pauseTimer = null;

    function type() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        typeEl.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) {
          deleting = true;
          pauseTimer = setTimeout(type, 1800);
          return;
        }
      } else {
        typeEl.textContent = current.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      const speed = deleting ? 50 : 80;
      pauseTimer = setTimeout(type, speed);
    }
    type();
  }

  // ---- Particle canvas (subtle bg) ----
  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function mkParticle() {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        a: Math.random() * 0.5 + 0.1,
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: 60 }, mkParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init);
  }

});
