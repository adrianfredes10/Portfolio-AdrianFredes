// Fondo animado de "ondas fluidas"
(function initWaves() {
  const canvas = document.getElementById('bg-waves');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, dpr, startTime = performance.now();
  const config = {
    waveCount: 3,
    amplitude: 28,
    wavelength: 420,
    speed: 0.5,
    baseAlpha: 0.08
  };

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function drawWave(offset, color) {
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 2) {
      const t = (x + offset) / config.wavelength;
      const y = height * 0.5 + Math.sin(t) * config.amplitude * 0.8 + Math.sin(t * 0.7) * config.amplitude * 0.2;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function animate(now) {
    const t = (now - startTime) * 0.001 * config.speed;
    ctx.clearRect(0, 0, width, height);

    drawWave(t * 120, `rgba(255,255,255,${config.baseAlpha})`);
    drawWave(t * 160 + 80, `rgba(255,255,255,${config.baseAlpha * 0.8})`);
    drawWave(t * 90 + 150, `rgba(255,255,255,${config.baseAlpha * 0.6})`);

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// Efecto de profundidad (parallax) en Hero
(function initHeroParallax() {
  const wrapper = document.querySelector('.hero-image-wrapper');
  const inner = document.querySelector('.hero-image-3d');
  if (!wrapper || !inner) return;

  wrapper.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = wrapper.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    inner.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(20px)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    inner.style.transform = `rotateY(0deg) rotateX(0deg) translateZ(0px)`;
  });
})();

// Gestión de Modales y Lightbox
(function initModals() {
  const openButtons = document.querySelectorAll('.open-modal');
  const closeButtons = document.querySelectorAll('.modal-close, .modal');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      const modal = document.querySelector(modalId);
      if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Si el click es en el fondo del modal o en el botón cerrar
      if (e.target.classList.contains('modal') || e.target.closest('.modal-close')) {
        const modal = btn.closest('.modal') || e.target;
        if (modal && modal.classList.contains('modal')) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
          const video = modal.querySelector('video');
          if (video) video.pause();
        }
      }
    });
  });

  // Lightbox para imágenes de la galería
  document.addEventListener('click', (e) => {
    if (e.target.closest('.gallery-grid img')) {
      const img = e.target;
      if (lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightbox.classList.add('open');
      }
    }
  });

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('open');
      }
    });
  }
})();

// Navegación móvil
(function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const close = document.querySelector('.mobile-close');
  const links = document.querySelectorAll('.mobile-links a');

  if (!toggle || !menu) return;

  const openMenu = () => {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', (e) => { e.stopPropagation(); closeMenu(); });
  menu.addEventListener('click', (e) => { if (e.target === menu) closeMenu(); });
  links.forEach(link => link.addEventListener('click', closeMenu));
})();

// IntersectionObserver para revelar elementos al hacer scroll
(function initRevealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
})();