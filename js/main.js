/**
 * main.js — Core Application Logic
 * Ashraf Islamia Model Public Secondary School
 * Navigation, scroll reveals, mobile drawer, ripple effects.
 */

(function () {
  'use strict';

  // ── Navigation ──────────────────────────────────────────────

  function initNavbar() {
    const navbar     = document.getElementById('navbar');
    const burger     = document.getElementById('nav-burger');
    const drawer     = document.getElementById('nav-drawer');
    const overlay    = document.getElementById('nav-overlay');
    const closeBtn   = document.getElementById('nav-drawer-close');

    if (!navbar) return;

    // Scroll compaction
    const scrollHandler = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler(); // run immediately

    // All focusable items inside drawer
    function getDrawerFocusables() {
      return drawer
        ? Array.from(drawer.querySelectorAll('a, button'))
        : [];
    }

    // Mobile drawer toggle
    function openDrawer() {
      drawer?.classList.add('open');
      overlay?.classList.add('visible');
      burger?.classList.add('open');
      burger?.setAttribute('aria-expanded', 'true');
      drawer?.setAttribute('aria-hidden', 'false');
      overlay?.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Make drawer links focusable
      getDrawerFocusables().forEach(el => el.removeAttribute('tabindex'));

      // Focus the close button (first interactive element)
      setTimeout(() => closeBtn?.focus(), 50);
    }

    function closeDrawer() {
      drawer?.classList.remove('open');
      overlay?.classList.remove('visible');
      burger?.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
      drawer?.setAttribute('aria-hidden', 'true');
      overlay?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Remove drawer links from tab order
      getDrawerFocusables().forEach(el => el.setAttribute('tabindex', '-1'));
    }

    // Hamburger button
    burger?.addEventListener('click', () => {
      const isOpen = drawer?.classList.contains('open');
      isOpen ? closeDrawer() : openDrawer();
    });

    // Dedicated close button
    closeBtn?.addEventListener('click', () => {
      closeDrawer();
      burger?.focus();
    });

    overlay?.addEventListener('click', closeDrawer);

    // Close drawer when a navigation link is clicked
    drawer?.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeDrawer();
        burger?.focus();
      });
    });

    // Escape key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer?.classList.contains('open')) {
        closeDrawer();
        burger?.focus();
      }
    });

    // Active link tracking on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              const isActive = link.getAttribute('href') === `#${entry.target.id}`;
              link.classList.toggle('active', isActive);
            });
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach((s) => sectionObserver.observe(s));
  }

  // ── Scroll Reveal ────────────────────────────────────────────

  let revealInitialised = false;

  function initScrollReveal() {
    if (revealInitialised) return;
    revealInitialised = true;

    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  // ── Button Ripple Effect ─────────────────────────────────────

  function initRipples() {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 10px;
          height: 10px;
          background: rgba(255,255,255,0.4);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.55s ease forwards;
          pointer-events: none;
        `;
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // ── Smooth Scroll for Anchor Links ──────────────────────────

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // ── Hero Text Animation on Slide Change ─────────────────────

  function initHeroTextAnimation() {
    const headline = document.getElementById('hero-headline');
    const sub = document.getElementById('hero-sub');
    const label = document.getElementById('hero-label');

    if (!headline) return;

    // Observe changes and animate
    const observer = new MutationObserver(() => {
      [headline, sub, label].forEach((el) => {
        if (!el) return;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'hero-text-rise 0.7s cubic-bezier(0.22,1,0.36,1) both';
      });
    });

    observer.observe(headline, { childList: true, subtree: true, characterData: true });
  }

  // ── Init ─────────────────────────────────────────────────────

  function init() {
    initNavbar();
    initRipples();
    initSmoothScroll();
    initHeroTextAnimation();

    // Listen for intro completion to trigger scroll reveal & unlock scroll
    document.addEventListener('intro:complete', () => {
      // Unlock scroll (intro.js may not have cleared it on session-skip)
      document.body.style.overflow = '';

      // Small delay so the hero cascade animations have started
      setTimeout(() => {
        initScrollReveal();
      }, 800);
    });

    // If intro was already complete/skipped when this script runs, initialise
    // scroll reveal immediately to avoid elements being permanently hidden.
    if (
      document.body.classList.contains('intro-skip') ||
      document.body.classList.contains('intro-complete')
    ) {
      initScrollReveal();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
