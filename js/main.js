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

  // Journal mark — scroll-linked: logo rotates 90°→0° and line draws as you scroll through the section
  const blogSection = document.querySelector('.blog-home');
  const journalLogo = document.querySelector('.journal-logo');
  const journalLine = document.querySelector('.journal-line');

  if (blogSection && journalLogo && journalLine) {
    const updateJournal = () => {
      const rect = blogSection.getBoundingClientRect();
      const wh = window.innerHeight;
      // progress 0 = section top just entered bottom of screen
      // progress 1 = section top has reached 20% from top of screen
      const start = wh;
      const end = wh * 0.20;
      const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      journalLogo.style.transform = `rotate(${90 - 90 * progress}deg)`;
      journalLine.style.transform = `scaleX(${progress})`;
    };
    window.addEventListener('scroll', updateJournal, { passive: true });
    window.addEventListener('resize', updateJournal);
    updateJournal();
  }
})();
