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
  }, { threshold: 0.15 });
  els.forEach(el => observer.observe(el));
})();

// Carrusel con animación JS + drag
(function enhanceTechMarquee() {
  const track = document.getElementById('techTrack');
  if (!track) return;

  // Marcar para desactivar la animación CSS
  track.classList.add('marquee-js');

  // Duplicar contenido para loop infinito
  const cloneChildren = () => {
    const children = Array.from(track.children);
    const frag = document.createDocumentFragment();
    children.forEach(node => frag.appendChild(node.cloneNode(true)));
    track.appendChild(frag);
  };
  if (track.children.length > 0) cloneChildren();

  let pos = 0; // translateX actual
  let speed = 0.08; // px por ms (~80px/s) ajustable por breakpoint vía factor
  let lastTs = performance.now();
  let totalWidth = 0; // ancho del primer bloque (antes del duplicado)

  function measure() {
    const half = Math.floor(track.children.length / 2);
    totalWidth = 0;
    for (let i = 0; i < half; i++) {
      totalWidth += track.children[i].getBoundingClientRect().width;
      if (i < half - 1) {
        const gap = parseFloat(getComputedStyle(track).gap) || 40;
        totalWidth += gap;
      }
    }
  }

  function applyResponsiveSpeed() {
    const w = window.innerWidth;
    if (w <= 480) speed = 0.048; // iPhone (más lento)
    else if (w <= 1024) speed = 0.056; // iPad (más lento)
    else speed = 0.04; // desktop (más lento)
  }

  function loop(ts) {
    const dt = ts - lastTs; lastTs = ts;
    if (!isDragging) pos -= speed * dt;

    // Reposicionar para loop infinito
    if (pos <= -totalWidth) pos += totalWidth;
    if (pos > 0) pos -= totalWidth;

    track.style.transform = `translate3d(${pos}px,0,0)`;
    raf = requestAnimationFrame(loop);
  }

  // Drag/Swipe
  let isDragging = false;
  let startX = 0;
  let startPos = 0;
  let velocity = 0;
  let raf = 0;
  let lastDragTs = 0;

  function onDown(e) {
    isDragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    startPos = pos;
    velocity = 0;
    lastDragTs = performance.now();
    track.style.cursor = 'grabbing';
  }
  function onMove(e) {
    if (!isDragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    const now = performance.now();
    const dx = x - startX;
    const dt = Math.max(1, now - lastDragTs);
    pos = startPos + dx;
    velocity = dx / dt; // px/ms
    lastDragTs = now;
  }
  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = 'grab';
    // Inercia breve
    const inertiaStart = performance.now();
    const decay = 0.0022; // fricción
    function inertialStep(t) {
      const elapsed = t - inertiaStart;
      const v = velocity * Math.exp(-decay * elapsed);
      pos += v * 16; // aproximar 60fps
      if (Math.abs(v) > 0.02) requestAnimationFrame(inertialStep);
    }
    requestAnimationFrame(inertialStep);
  }

  track.addEventListener('mousedown', onDown);
  track.addEventListener('touchstart', onDown, { passive: true });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);

  function onResize() {
    cancelAnimationFrame(raf);
    applyResponsiveSpeed();
    measure();
    // Mantener dentro del rango tras medir
    if (pos <= -totalWidth) pos = -((Math.abs(pos) % totalWidth));
    if (pos > 0) pos = -((totalWidth - (pos % totalWidth)) % totalWidth);
    lastTs = performance.now();
    raf = requestAnimationFrame(loop);
  }

  applyResponsiveSpeed();
  measure();
  raf = requestAnimationFrame(loop);
  window.addEventListener('resize', onResize);
})();

// Menú móvil (hamburguesa)
(function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileMenu');
  const closeBtn = document.querySelector('.mobile-close');
  if (!toggle || !menu) return;

  function open() {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  toggle.addEventListener('click', () => {
    if (menu.classList.contains('open')) close(); else open();
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  menu.addEventListener('click', (e) => { if (e.target === menu) close(); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// Fullscreen para videos de proyectos
(function enableVideoFullscreen() {
  function requestFs(el) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || el.mozRequestFullScreen;
    if (fn) fn.call(el);
  }
  function exitFs() {
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen || document.mozCancelFullScreen;
    if (fn) fn.call(document);
  }
  function isFs() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
  }
  function toggleFs(video) { isFs() ? exitFs() : requestFs(video); }

  function bind(video) {
    if (!video) return;
    video.addEventListener('dblclick', () => toggleFs(video));
    video.addEventListener('click', (e) => {
      // Sólo hacer fullscreen en click si no se presionan controles
      if (e.target === video) toggleFs(video);
    });
  }

  document.querySelectorAll('video.project-video').forEach(bind);

  // Si se abre un modal y se inyecta el video luego del DOMContentLoaded
  const observer = new MutationObserver(() => {
    document.querySelectorAll('video.project-video').forEach(v => {
      if (!v.__fsBound) { bind(v); v.__fsBound = true; }
    });
  });
  observer.observe(document.body, { subtree: true, childList: true });
})();

// Corregir URL de icono CSS3 (asegurar logo correcto)
(function fixCSS3Icon() {
  const cssIcon = document.querySelector('.tech-icon img[alt="CSS3"], .tech-icon img[alt="Css3"], .tech-icon img[alt="css3"]');
  if (cssIcon) {
    cssIcon.src = 'https://cdn.simpleicons.org/css3/1572B6'; // azul oficial CSS3
  }
})();

// Año dinámico (no usado en footer actual, por compatibilidad)
(function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Toggle de contenido extra en tarjetas de proyectos
(function initProjectToggles() {
  const links = document.querySelectorAll('.card.project-card .card-link[data-extra]');
  if (!links.length) return;
  links.forEach(link => {
    const targetSel = link.getAttribute('data-extra');
    const target = document.querySelector(targetSel);
    if (!target) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const isHidden = target.hasAttribute('hidden');
      if (isHidden) target.removeAttribute('hidden'); else target.setAttribute('hidden', '');
      link.setAttribute('aria-expanded', String(isHidden));
      if (isHidden) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// Modal para proyectos (galería y descripción)
(function initModals() {
  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.open-modal[data-modal]').forEach(btn => {
    const sel = btn.getAttribute('data-modal');
    const modal = document.querySelector(sel);
    if (!modal) return;
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(modal); });
  });
  document.querySelectorAll('.modal').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(m => closeModal(m));
  });
})();

// Lightbox para ver imágenes en grande
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const img = document.getElementById('lightbox-img');
  const closeBtn = document.querySelector('.lightbox-close');
  function open(src, alt) {
    img.src = src; img.alt = alt || 'Imagen';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('.gallery-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-full') || btn.querySelector('img')?.src;
      const alt = btn.querySelector('img')?.alt || 'Imagen';
      if (src) open(src, alt);
    });
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})(); 