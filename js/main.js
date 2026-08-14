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

    if (!('IntersectionObserver' in window)) {
      return;
    }

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

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('visible'));
      return;
    }

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

  // ── Global Smooth Momentum Scroll Controller ─────────────────

  function initSmoothPageScroll() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let isScrolling = false;
    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let animId = null;

    function clampScroll(y) {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      return Math.max(0, Math.min(y, maxScroll));
    }

    function syncScroll() {
      if (!isScrolling) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }
    }
    window.addEventListener('scroll', syncScroll, { passive: true });

    function lerp(start, end, factor) {
      return start + (end - start) * factor;
    }

    function scrollLoop() {
      currentY = lerp(currentY, targetY, 0.12);

      if (Math.abs(targetY - currentY) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, Math.round(currentY));
        isScrolling = false;
        animId = null;
        return;
      }

      window.scrollTo(0, Math.round(currentY));
      animId = requestAnimationFrame(scrollLoop);
    }

    function onWheel(e) {
      // Allow intro or open drawer to handle their own scrolling
      if (
        document.body.classList.contains('prologue-active') ||
        document.getElementById('nav-drawer')?.classList.contains('open')
      ) {
        return;
      }

      // Allow native horizontal scrolling for slider/filter containers
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      // Respect scrollable nested elements (modals, dropdown lists, text areas)
      let el = e.target;
      while (el && el !== document.body && el !== document.documentElement) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
          const canScrollDown = e.deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1;
          const canScrollUp = e.deltaY < 0 && el.scrollTop > 1;
          if (canScrollDown || canScrollUp) return;
        }
        el = el.parentElement;
      }

      e.preventDefault();

      if (!isScrolling) {
        currentY = window.scrollY;
        targetY = window.scrollY;
      }

      isScrolling = true;

      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 32; // Firefox line mode
      } else if (e.deltaMode === 2) {
        delta *= window.innerHeight; // Page mode
      }

      // Moderate impulse so it never scrolls too fast or too slow
      const maxStep = 130;
      const clampedDelta = Math.sign(delta) * Math.min(Math.abs(delta) * 0.85, maxStep);

      targetY = clampScroll(targetY + clampedDelta);

      if (!animId) {
        animId = requestAnimationFrame(scrollLoop);
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false });

    // Smooth Anchor Scrolling with Navbar Offset
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;
        const targetPos = clampScroll(target.getBoundingClientRect().top + window.scrollY - navHeight);

        currentY = window.scrollY;
        targetY = targetPos;
        isScrolling = true;

        if (!animId) {
          animId = requestAnimationFrame(scrollLoop);
        }
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
    initSmoothPageScroll();
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
    // The revealInitialised flag inside initScrollReveal() prevents double-init.
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
