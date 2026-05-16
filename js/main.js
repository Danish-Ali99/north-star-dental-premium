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
      link.addEventListener('click', (e) => {
        // Don't close the panel when tapping a parent that toggles a dropdown
        if (link.closest('.has-mega') && link.parentElement.classList.contains('has-mega') && window.innerWidth <= 768) return;
        if (link.closest('.mega-cat') && link.parentElement.classList.contains('mega-cat') && link.parentElement.querySelector('.mega-sub') && window.innerWidth <= 768) return;
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

  // Click-to-toggle for the Services / Resources mega-menu (in addition to hover on desktop)
  document.querySelectorAll('.has-mega').forEach((mega) => {
    const trigger = mega.querySelector(':scope > a');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        // Mobile: always toggle on tap, never follow the link
        e.preventDefault();
        const wasOpen = mega.classList.contains('is-open');
        document.querySelectorAll('.has-mega.is-open').forEach((m) => {
          if (m !== mega) m.classList.remove('is-open');
        });
        mega.classList.toggle('is-open', !wasOpen);
      } else if (!mega.classList.contains('is-open')) {
        // Desktop: first click reveals, second click follows link
        e.preventDefault();
        document.querySelectorAll('.has-mega.is-open').forEach((m) => {
          if (m !== mega) m.classList.remove('is-open');
        });
        mega.classList.add('is-open');
      }
    });
  });

  // Mobile: nested mega-cat toggles its sub-menu on tap
  document.querySelectorAll('.mega-cat').forEach((cat) => {
    const trigger = cat.querySelector(':scope > a');
    const sub = cat.querySelector(':scope > .mega-sub');
    if (!trigger || !sub) return;
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const wasOpen = cat.classList.contains('is-open');
      cat.parentElement.querySelectorAll(':scope > .mega-cat.is-open').forEach((c) => {
        if (c !== cat) c.classList.remove('is-open');
      });
      cat.classList.toggle('is-open', !wasOpen);
    });
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 768 && !e.target.closest('.has-mega')) {
      document.querySelectorAll('.has-mega.is-open').forEach((m) => m.classList.remove('is-open'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.has-mega.is-open, .mega-cat.is-open').forEach((m) => m.classList.remove('is-open'));
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

  // Inject mobile menu footer (phone + Book Online CTA + close) inside the open nav drawer
  (() => {
    if (!navLinks || document.querySelector('.mobile-menu-cta')) return;
    const wrap = document.createElement('div');
    wrap.className = 'mobile-menu-cta';
    wrap.innerHTML = `
      <a class="mobile-menu-phone" href="tel:+919035462760">+91 90354 62760</a>
      <a class="mobile-menu-book btn" href="https://click4appointment.com/clinic-details/drvdentalaesthetics-3361" target="_blank" rel="noopener">Book Online</a>
      <button type="button" class="mobile-menu-close" aria-label="Close menu">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        <span>Close menu</span>
      </button>
    `;
    navLinks.appendChild(wrap);

    // Wire the close button to trigger the same toggle as the hamburger
    wrap.querySelector('.mobile-menu-close').addEventListener('click', () => {
      if (menuToggle) menuToggle.click();
    });
  })();

  // Inject persistent bottom navigation bar (mobile only via CSS)
  (() => {
    if (document.querySelector('.mobile-bottom-bar')) return;
    const bar = document.createElement('nav');
    bar.className = 'mobile-bottom-bar';
    bar.setAttribute('aria-label', 'Quick actions');
    bar.innerHTML = `
      <a class="mbb-item" href="tel:+919035462760" aria-label="Call clinic">
        <span class="mbb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg></span>
        <span class="mbb-label">Phone</span>
      </a>
      <a class="mbb-item" href="https://click4appointment.com/clinic-details/drvdentalaesthetics-3361" target="_blank" rel="noopener" aria-label="Book online">
        <span class="mbb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
        <span class="mbb-label">Book Online</span>
      </a>
      <a class="mbb-item" href="https://wa.me/919035462760" target="_blank" rel="noopener" aria-label="Contact us on WhatsApp">
        <span class="mbb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
        <span class="mbb-label">Contact Us</span>
      </a>
    `;
    document.body.appendChild(bar);
  })();

  // Back-to-top floating button — appears when scrolled, smooth-scrolls to top on click
  (() => {
    if (document.querySelector('.back-to-top')) return;
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);

    const toggle = () => {
      btn.classList.toggle('is-visible', window.scrollY > 320);
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    btn.addEventListener('click', () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  })();

})();
