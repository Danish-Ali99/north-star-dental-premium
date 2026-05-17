(function () {
  'use strict';

  // Route the "Location" nav link to the home page's #location section
  // instead of the dedicated location.html page. Also redirect any visitor
  // (mobile OR desktop) who lands directly on location.html.
  (() => {
    if (/\/location\.html$/i.test(window.location.pathname)) {
      window.location.replace('index.html#location');
      return;
    }
    document.querySelectorAll('a[href$="location.html"]').forEach((a) => {
      a.setAttribute('href', 'index.html#location');
    });
  })();

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
  const preventTouchMove = (e) => { e.preventDefault(); };
  const lockScroll = () => {
    document.documentElement.classList.add('menu-open');
    document.body.classList.add('menu-open');
    document.addEventListener('touchmove', preventTouchMove, { passive: false });
  };
  const unlockScroll = () => {
    document.documentElement.classList.remove('menu-open');
    document.body.classList.remove('menu-open');
    document.removeEventListener('touchmove', preventTouchMove);
  };
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      if (isOpen) lockScroll(); else unlockScroll();
      menuToggle.innerHTML = isOpen
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    });
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', (e) => {
        // Don't close the panel when tapping a parent that toggles a dropdown
        if (link.closest('.has-mega') && link.parentElement.classList.contains('has-mega') && window.innerWidth <= 768) return;
        if (link.closest('.mega-cat') && link.parentElement.classList.contains('mega-cat') && link.parentElement.querySelector('.mega-sub') && window.innerWidth <= 768) return;
        if (navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          unlockScroll();
          if (menuToggle) menuToggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
        }
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

  // Auto-stagger children inside grids (services, team, reviews, blog, etc.)
  // Run BEFORE the IntersectionObserver attaches so newly-tagged elements are observed.
  const STAGGER_TARGETS = [
    '.services-grid', '.team-trio', '.team-grid', '.team-page-grid',
    '.reviews-tile-grid', '.blog-grid', '.blog-page-grid', '.contact-grid',
    '.comfort-grid', '.clinic-cards', '.services-page-grid'
  ];
  STAGGER_TARGETS.forEach((sel) => {
    document.querySelectorAll(sel).forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        if (!child.classList.contains('fade-in')) child.classList.add('fade-in');
        if (!child.dataset.delay) child.dataset.delay = String(0.08 * i);
      });
    });
  });

  // Tag the about-section images so they reveal on scroll too
  document.querySelectorAll(
    '.about-stack-main, .about-stack-offset, .about-stack-badge'
  ).forEach((el, i) => {
    if (!el.classList.contains('fade-in')) el.classList.add('fade-in');
    if (!el.dataset.delay) el.dataset.delay = String(0.1 * i);
  });

  // Fade-in on scroll (supports per-element data-delay in seconds)
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseFloat(entry.target.dataset.delay || '0');
            if (delay > 0) {
              setTimeout(() => entry.target.classList.add('visible'), delay * 1000);
            } else {
              entry.target.classList.add('visible');
            }
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

  // Animated number counters — any element with [data-count] counts from 0
  // up to that number when it scrolls into view.
  if ('IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = !Number.isInteger(target);
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
        };
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach((el) => counterObs.observe(el));
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
        const range = window.innerWidth <= 768 ? 280 : 120;
        const translate = (progress - 0.5) * range;
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

  // Inject mobile menu footer (Book Online CTA + phone link) inside the open nav drawer
  (() => {
    if (!navLinks || document.querySelector('.mobile-menu-cta')) return;
    const wrap = document.createElement('div');
    wrap.className = 'mobile-menu-cta';
    wrap.innerHTML = `
      <a class="mobile-menu-book btn" href="https://click4appointment.com/clinic-details/drvdentalaesthetics-3361" target="_blank" rel="noopener">Book Online</a>
      <a class="mobile-menu-phone" href="tel:+919035462760">+91 90354 62760</a>
    `;
    navLinks.appendChild(wrap);
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
      <a class="mbb-item mbb-item--whatsapp" href="https://wa.me/919035462760?text=Hello%20North%20Star%20Dental%2C%20I%27d%20like%20to%20enquire%20about%20an%20appointment." target="_blank" rel="noopener" aria-label="Contact us on WhatsApp">
        <span class="mbb-icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/></svg></span>
        <span class="mbb-label">WhatsApp</span>
      </a>
    `;
    document.body.appendChild(bar);
  })();

  // Location toggle (two-clinic tabs)
  (() => {
    const tabs = document.querySelectorAll('.location-tab');
    const panels = document.querySelectorAll('.location-panel');
    if (!tabs.length || !panels.length) return;
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.loc;
        tabs.forEach((t) => {
          const active = t.dataset.loc === target;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach((p) => {
          const active = p.dataset.loc === target;
          p.classList.toggle('is-active', active);
          if (active) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
        });
      });
    });
  })();

  // Team trio → swipeable carousel on mobile (one doctor at a time, arrows + dots)
  (() => {
    const trio = document.querySelector('.team-home .team-trio');
    if (!trio) return;
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile()) return;
    if (trio.classList.contains('team-carousel')) return;

    trio.classList.add('team-carousel');
    const cards = Array.from(trio.children).filter((c) => c.classList.contains('team-card'));
    if (!cards.length) return;

    // Build controls
    const controls = document.createElement('div');
    controls.className = 'team-carousel-controls';
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'team-carousel-btn';
    prevBtn.setAttribute('aria-label', 'Previous doctor');
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'team-carousel-btn';
    nextBtn.setAttribute('aria-label', 'Next doctor');
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
    const dots = document.createElement('div');
    dots.className = 'team-carousel-dots';
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'team-carousel-dot' + (i === 0 ? ' is-active' : '');
      d.setAttribute('aria-label', 'Go to doctor ' + (i + 1));
      d.dataset.idx = String(i);
      dots.appendChild(d);
    });
    controls.appendChild(prevBtn);
    controls.appendChild(dots);
    controls.appendChild(nextBtn);
    trio.parentNode.insertBefore(controls, trio.nextSibling);

    const scrollTo = (i) => {
      const clamped = Math.max(0, Math.min(cards.length - 1, i));
      cards[clamped].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };
    const currentIdx = () => {
      const center = trio.scrollLeft + trio.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const cardCenter = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    };
    const syncDots = () => {
      const idx = currentIdx();
      dots.querySelectorAll('.team-carousel-dot').forEach((d, i) => {
        d.classList.toggle('is-active', i === idx);
      });
    };

    prevBtn.addEventListener('click', () => scrollTo(currentIdx() - 1));
    nextBtn.addEventListener('click', () => scrollTo(currentIdx() + 1));
    dots.addEventListener('click', (e) => {
      const t = e.target.closest('.team-carousel-dot');
      if (!t) return;
      scrollTo(parseInt(t.dataset.idx, 10));
    });
    let scrollTick;
    trio.addEventListener('scroll', () => {
      clearTimeout(scrollTick);
      scrollTick = setTimeout(syncDots, 80);
    }, { passive: true });
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
