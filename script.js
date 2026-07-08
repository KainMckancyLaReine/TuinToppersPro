/* =========================================================
   TuinToppersPro — GSAP animaties, before/after slider,
   FAQ accordion, mobiel menu, terug-naar-boven
   ========================================================= */

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- YEAR ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- MOBILE MENU ---------- */
(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (!menuToggle || !nav) return;

  menuToggle.setAttribute('aria-expanded', 'false');
  nav.dataset.open = 'false';

  menuToggle.addEventListener('click', () => {
    const open = nav.dataset.open === 'true';
    nav.dataset.open = open ? 'false' : 'true';
    menuToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.dataset.open = 'false';
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- HEADER SCROLL STATE + BACK TO TOP ---------- */
(function () {
  const header = document.querySelector('.header');
  const totop = document.querySelector('.totop');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 20);
    if (totop) totop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (totop) {
    totop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* ---------- SMOOTH ANCHOR SCROLL OFFSET ---------- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

/* ---------- FAQ ACCORDION ---------- */
document.querySelectorAll('.faq__item').forEach((item) => {
  const btn = item.querySelector('.faq__q');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isOpen = item.dataset.open === 'true';
    item.closest('.faq').querySelectorAll('.faq__item').forEach((i) => {
      i.dataset.open = 'false';
      const q = i.querySelector('.faq__q');
      if (q) q.setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.dataset.open = 'true';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------- BEFORE / AFTER COMPARE SLIDER ---------- */
document.querySelectorAll('.compare').forEach((wrap) => {
  const after = wrap.querySelector('.compare__after');
  const handle = wrap.querySelector('.compare__handle');
  if (!after || !handle) return;

  let dragging = false;

  function setPos(clientX) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    /* "voor" staat links (zichtbaar via de onderliggende laag), "na" wordt
       vanaf rechts onthuld door alleen het stuk vanaf de handle te tonen. */
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
    wrap.setAttribute('aria-valuenow', Math.round(pct));
  }

  function start(clientX) {
    dragging = true;
    wrap.classList.add('is-dragged');
    setPos(clientX);
  }
  function move(clientX) {
    if (!dragging) return;
    setPos(clientX);
  }
  function end() { dragging = false; }

  wrap.addEventListener('mousedown', (e) => start(e.clientX));
  window.addEventListener('mousemove', (e) => move(e.clientX));
  window.addEventListener('mouseup', end);

  wrap.addEventListener('touchstart', (e) => start(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchmove', (e) => move(e.touches[0].clientX), { passive: true });
  wrap.addEventListener('touchend', end);

  wrap.addEventListener('click', (e) => setPos(e.clientX));

  // keyboard accessibility
  wrap.setAttribute('tabindex', '0');
  wrap.setAttribute('role', 'slider');
  wrap.setAttribute('aria-valuemin', '0');
  wrap.setAttribute('aria-valuemax', '100');
  wrap.setAttribute('aria-valuenow', '50');
  wrap.setAttribute('aria-label', 'Sleep om voor en na te vergelijken');
  wrap.addEventListener('keydown', (e) => {
    const rect = wrap.getBoundingClientRect();
    const current = parseFloat(handle.style.left) || 50;
    if (e.key === 'ArrowLeft') setPos(rect.left + (rect.width * (current - 5)) / 100);
    if (e.key === 'ArrowRight') setPos(rect.left + (rect.width * (current + 5)) / 100);
  });

  // init at 50%
  setPos(wrap.getBoundingClientRect().left + wrap.getBoundingClientRect().width / 2);
});

/* ---------- TOC ACTIVE SECTION (prijzen sidebar) ---------- */
(function () {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  const links = Array.from(toc.querySelectorAll('a'));
  const targets = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!targets.length) return;

  function onScroll() {
    let activeIdx = 0;
    targets.forEach((t, i) => {
      if (t.getBoundingClientRect().top - 130 <= 0) activeIdx = i;
    });
    links.forEach((a, i) => a.classList.toggle('is-active', i === activeIdx));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ================= GSAP ANIMATIES (alleen indien aanwezig) ================= */
if (window.gsap && window.ScrollTrigger) {

  /* Voorkom "verdwenen" tekst: laat-ladende afbeeldingen en webfonts
     kunnen de paginahoogte wijzigen NADAT ScrollTrigger de startposities
     al berekende. Zonder herberekening kan een animatie daardoor nooit
     meer triggeren, waardoor tekst permanent onzichtbaar blijft.
     Daarom herberekenen we ScrollTrigger zodra alles echt geladen is. */
  const refreshST = () => ScrollTrigger.refresh();
  window.addEventListener('load', refreshST);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(refreshST);
  }
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', refreshST, { once: true });
  });
  setTimeout(refreshST, 1200);
  setTimeout(refreshST, 2500);

  /* ---------- HOME HERO ---------- */
  if (document.querySelector('.hero__title .line')) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero .eyebrow', { y: 16, duration: 0.6 })
      .from('.hero__title .line', {
        yPercent: 110, duration: 1.05, stagger: 0.1, ease: 'power4.out',
      }, '-=0.3')
      .from('.hero__lead', { y: 20, duration: 0.8 }, '-=0.6')
      .from('.hero__cta .btn', { y: 18, duration: 0.6, stagger: 0.08 }, '-=0.4')
      .from('.hero__usps .usp', { y: 14, duration: 0.5, stagger: 0.06 }, '-=0.3')
      .from('.hero__image', { y: 30, duration: 1.1, ease: 'power3.out' }, '-=1.1')
      .from('.hero__badge', { y: 20, duration: 0.7, ease: 'power3.out' }, '-=0.5');

    gsap.set('.hero__image img', { scale: 1.15 });
    gsap.to('.hero__image img', {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
  }

  /* ---------- PAGE HERO (sub-pagina's) ---------- */
  if (document.querySelector('.pagehero')) {
    gsap.from('.pagehero .breadcrumb, .pagehero .eyebrow, .pagehero h1, .pagehero p, .pagehero__cta', {
      y: 20, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    });
  }

  /* ---------- HEADER SCROLL (ScrollTrigger versie, extra) ---------- */
  ScrollTrigger.create({
    start: 'top -20',
    toggleClass: { className: 'is-scrolled', targets: '.header' },
  });

  /* ---------- TRUST BAR ---------- */
  if (document.querySelector('.trustbar')) {
    gsap.from('.trust', {
      scrollTrigger: { trigger: '.trustbar', start: 'top 96%' },
      y: 20, duration: 0.6, stagger: 0.08, ease: 'power3.out',
    });
  }

  /* ---------- SECTION HEADS (alle pagina's) ---------- */
  gsap.utils.toArray('.section__head').forEach((head) => {
    const eyebrow = head.querySelector('.eyebrow');
    const title = head.querySelector('.section__title');
    const lead = head.querySelector('.section__lead');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: head, start: 'top 94%' },
      defaults: { ease: 'power3.out' },
    });
    if (eyebrow) tl.from(eyebrow, { y: 14, duration: 0.5 });
    if (title) tl.from(title, { y: 30, duration: 0.85 }, '-=0.3');
    if (lead) tl.from(lead, { y: 18, duration: 0.6 }, '-=0.55');
  });

  /* ---------- CONTACT STRIP ---------- */
  if (document.querySelector('.contactstrip')) {
    gsap.from('.contactstrip__copy, .contactstrip__phone, .contactstrip__cta', {
      scrollTrigger: { trigger: '.contactstrip', start: 'top 94%' },
      y: 25, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    });
  }

  /* ---------- SERVICE / BUBBLE CARDS ---------- */
  if (document.querySelector('.services__grid')) {
    gsap.from('.services__grid .bubble', {
      scrollTrigger: { trigger: '.services__grid', start: 'top 94%' },
      y: 40, duration: 0.75, stagger: 0.08, ease: 'power3.out',
    });
  }

  /* ---------- SERVICE DETAIL BLOCKS (diensten.html) ---------- */
  gsap.utils.toArray('.svcdetail').forEach((block) => {
    gsap.from(block.querySelectorAll('.svcdetail__media, .svcdetail__copy > *'), {
      scrollTrigger: { trigger: block, start: 'top 94%' },
      y: 35, duration: 0.8, stagger: 0.08, ease: 'power3.out',
    });
  });

  /* ---------- INTRO PROMO ---------- */
  if (document.querySelector('.intropromo')) {
    gsap.from('.intropromo__copy > *', {
      scrollTrigger: { trigger: '.intropromo', start: 'top 94%' },
      y: 25, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    });
    gsap.from('.intropromo__price', {
      scrollTrigger: { trigger: '.intropromo', start: 'top 94%' },
      y: 40, duration: 0.9, ease: 'power3.out', delay: 0.15,
    });
  }

  /* ---------- PACKAGES ---------- */
  if (document.querySelector('.packages__grid')) {
    gsap.from('.pkg', {
      scrollTrigger: { trigger: '.packages__grid', start: 'top 94%' },
      y: 50, duration: 0.85, stagger: 0.12, ease: 'power3.out',
    });
  }
  if (document.querySelector('.subpkg')) {
    gsap.from('.subpkg__card', {
      scrollTrigger: { trigger: '.subpkg', start: 'top 94%' },
      y: 30, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    });
  }

  /* ---------- COUNT-UP ---------- */
  gsap.utils.toArray('.pkg__price b, .intropromo__price b, .about__stats b, .statstrip b').forEach((el) => {
    const txt = el.textContent.trim();
    const num = parseInt(txt, 10);
    if (isNaN(num)) return;
    const suffix = txt.replace(/^[0-9]+/, '');
    const obj = { v: 0 };
    gsap.to(obj, {
      v: num, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 96%' },
      onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
    });
  });

  /* ---------- BEFORE / AFTER (home teaser) ---------- */
  if (document.querySelector('.ba')) {
    gsap.from('.ba__image, .compare-card', {
      scrollTrigger: { trigger: '.ba', start: 'top 94%' },
      y: 40, duration: 1, ease: 'power3.out',
    });
    gsap.from('.ba__feat', {
      scrollTrigger: { trigger: '.ba__features', start: 'top 94%' },
      y: 25, duration: 0.7, stagger: 0.12, ease: 'power3.out',
    });
  }

  /* ---------- PROJECTS GALLERY (projecten.html) ---------- */
  gsap.utils.toArray('.project-block').forEach((block) => {
    gsap.from(block.querySelectorAll('.compare-card, .compare'), {
      scrollTrigger: { trigger: block, start: 'top 94%' },
      y: 40, duration: 0.85, stagger: 0.12, ease: 'power3.out',
    });
  });

  /* ---------- HOW / TIMELINE ---------- */
  if (document.querySelector('.how__steps')) {
    gsap.from('.how__step', {
      scrollTrigger: { trigger: '.how__steps', start: 'top 94%' },
      y: 35, duration: 0.75, stagger: 0.15, ease: 'power3.out',
    });
  }
  gsap.utils.toArray('.timeline__item').forEach((item) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 94%' },
      x: -30, duration: 0.7, ease: 'power3.out',
    });
  });

  /* ---------- ICON ROW / GUARANTEES ---------- */
  if (document.querySelector('.iconrow')) {
    gsap.from('.iconcard', {
      scrollTrigger: { trigger: '.iconrow', start: 'top 94%' },
      y: 30, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    });
  }

  /* ---------- FAQ ---------- */
  if (document.querySelector('.faq')) {
    gsap.from('.faq__item', {
      scrollTrigger: { trigger: '.faq', start: 'top 94%' },
      y: 20, duration: 0.6, stagger: 0.06, ease: 'power3.out',
    });
  }

  /* ---------- CONTACT CARDS ---------- */
  if (document.querySelector('.contactgrid')) {
    gsap.from('.contactcard, .areamap', {
      scrollTrigger: { trigger: '.contactgrid', start: 'top 94%' },
      y: 30, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    });
  }

  /* ---------- ABOUT ---------- */
  if (document.querySelector('.about')) {
    gsap.from('.about__visual', {
      scrollTrigger: { trigger: '.about', start: 'top 94%' },
      x: -40, duration: 1, ease: 'power3.out',
    });
    gsap.from('.about__copy > *', {
      scrollTrigger: { trigger: '.about', start: 'top 94%' },
      y: 22, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    });
    gsap.from('.about__stats > div', {
      scrollTrigger: { trigger: '.about__stats', start: 'top 96%' },
      y: 20, duration: 0.6, stagger: 0.08, ease: 'power3.out',
    });
  }

  /* ---------- CTA ---------- */
  if (document.querySelector('.cta')) {
    gsap.from('.cta__copy > *', {
      scrollTrigger: { trigger: '.cta', start: 'top 94%' },
      y: 25, duration: 0.7, stagger: 0.1, ease: 'power3.out',
    });
    gsap.from('.cta__actions .btn', {
      scrollTrigger: { trigger: '.cta', start: 'top 94%' },
      y: 18, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.2,
    });
  }

  /* ---------- FOOTER ---------- */
  gsap.from('.footer__brand, .footer__col', {
    scrollTrigger: { trigger: '.footer', start: 'top 92%' },
    y: 20, duration: 0.6, stagger: 0.08, ease: 'power3.out',
  });
}
