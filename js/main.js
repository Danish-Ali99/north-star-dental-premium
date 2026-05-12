(function () {
  'use strict';

  // Sticky nav shadow on scroll + color flip when over dark sections
  const nav = document.querySelector('.nav');
  if (nav) {
    const darkSections = document.querySelectorAll(
      '.services-home, .booking, .page-hero, .location-info, .footer'
    );
    const updateNav = () => {
      if (window.scrollY > 30) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      const navBottom = nav.getBoundingClientRect().bottom;
      let onDark = false;
      darkSections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= navBottom && r.bottom > navBottom) onDark = true;
      });
      nav.classList.toggle('is-light', onDark);
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();
  }

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      menuToggle.innerHTML = isOpen
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    });
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('active');
      item.parentElement.querySelectorAll('.faq-item.active').forEach((other) => {
        if (other !== item) other.classList.remove('active');
      });
      item.classList.toggle('active', !wasOpen);
    });
  });

  // Fade-in on scroll
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
  }

  // FAQ category filter (faq.html)
  document.querySelectorAll('.faq-cat').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.faq-item').forEach((item) => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Set current year in footer
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Scroll-spy: highlight nav link for the section currently in view
  const spyLinks = document.querySelectorAll('.nav-links a[data-section]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const sectionMap = new Map();
    spyLinks.forEach((link) => {
      const sec = document.getElementById(link.dataset.section);
      if (sec) sectionMap.set(sec, link);
    });
    if (sectionMap.size) {
      const visible = new Map();
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) visible.set(e.target, e.intersectionRatio);
            else visible.delete(e.target);
          });
          if (visible.size) {
            let bestEl = null;
            let bestRatio = -1;
            visible.forEach((ratio, el) => {
              if (ratio > bestRatio) { bestRatio = ratio; bestEl = el; }
            });
            spyLinks.forEach((l) => l.classList.remove('active'));
            const link = sectionMap.get(bestEl);
            if (link) link.classList.add('active');
          }
        },
        { threshold: [0.25, 0.5, 0.75], rootMargin: '-100px 0px -40% 0px' }
      );
      sectionMap.forEach((_, sec) => spyObserver.observe(sec));
    }
  }

  // Click-to-toggle for the Services mega-menu (in addition to hover)
  document.querySelectorAll('.has-mega').forEach((mega) => {
    const trigger = mega.querySelector(':scope > a');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      // On desktop, intercept the first click to reveal the menu; second click follows the link
      if (window.innerWidth > 768 && !mega.classList.contains('is-open')) {
        e.preventDefault();
        document.querySelectorAll('.has-mega.is-open').forEach((m) => {
          if (m !== mega) m.classList.remove('is-open');
        });
        mega.classList.add('is-open');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-mega')) {
      document.querySelectorAll('.has-mega.is-open').forEach((m) => m.classList.remove('is-open'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.has-mega.is-open').forEach((m) => m.classList.remove('is-open'));
    }
  });

  // Open the right service / category when arriving via #hash from the mega-menu
  const handleServiceHash = () => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!hash) return;

    const categories = ['cosmetic', 'restorative', 'preventive', 'specialty', 'family'];
    if (categories.includes(hash)) {
      const catBtn = document.querySelector(`.faq-cat[data-cat="${hash}"]`);
      if (catBtn) catBtn.click();
      const cats = document.querySelector('.faq-categories');
      if (cats) cats.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const item = document.getElementById(hash);
    if (!item || !item.classList.contains('faq-item')) return;

    const allBtn = document.querySelector('.faq-cat[data-cat="all"]');
    if (allBtn && !allBtn.classList.contains('active')) allBtn.click();

    if (!item.classList.contains('active')) {
      const q = item.querySelector('.faq-question');
      if (q) q.click();
    }

    setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'center' }), 220);
  };
  window.addEventListener('load', handleServiceHash);
  window.addEventListener('hashchange', handleServiceHash);

  // About-section carousel: auto-rotate slides + dot click
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const slides = root.querySelectorAll('.carousel-slide');
    const dots = root.querySelectorAll('.carousel-dots .dot');
    const slideNum = root.querySelector('[data-slide-num]');
    if (slides.length < 2) return;
    let idx = 0;
    let timer;
    const goTo = (next) => {
      slides[idx].classList.remove('is-active');
      dots[idx]?.classList.remove('is-active');
      idx = (next + slides.length) % slides.length;
      slides[idx].classList.add('is-active');
      dots[idx]?.classList.add('is-active');
      if (slideNum) slideNum.textContent = idx + 1;
    };
    if (slideNum) slideNum.textContent = idx + 1;
    const start = () => { timer = setInterval(() => goTo(idx + 1), 3000); };
    const stop = () => clearInterval(timer);
    dots.forEach((d, i) => d.addEventListener('click', () => { stop(); goTo(i); start(); }));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  });

  // Scroll-driven parallax for the quote section background
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    document.querySelectorAll('[data-parallax]').forEach((section) => {
      const bg = section.querySelector('[data-parallax-bg]');
      if (!bg) return;
      let ticking = false;
      const update = () => {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) { ticking = false; return; }
        const progress = (vh - rect.top) / (vh + rect.height);
        const translate = (progress - 0.5) * 120;
        bg.style.transform = `translate3d(0, ${translate.toFixed(1)}px, 0)`;
        ticking = false;
      };
      const onScroll = () => {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('scroll', onScroll, { passive: true, capture: true });
      document.body.addEventListener('scroll', onScroll, { passive: true });
      update();
    });
  }
  window.__parallaxInit = true;

})();
