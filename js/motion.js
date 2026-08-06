/**
 * motion.js — Motion Design System Controller
 * Ashraf Islamia Model Public Secondary School
 *
 * Responsibilities:
 *  1. Enhanced scroll-reveal (extends main.js for inner pages)
 *  2. Image lazy reveal (fade + translateY on load + intersection)
 *  3. Button press feedback (data-pressed attribute)
 *  4. Mobile drawer link stagger on open
 *  5. Inner-page hero reveal (.page-hero)
 *  6. Footer column reveal
 *
 * Does NOT touch: intro cinematic, counter animation, slideshow.
 * Always respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  /* ── Reduced Motion Gate ────────────────────────────────── */

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  /* ══════════════════════════════════════════════════════════
     1. SCROLL REVEAL
     Works alongside main.js — runs on all pages.
     main.js handles index.html (waits for intro:complete).
     motion.js handles inner pages immediately.
  ══════════════════════════════════════════════════════════ */

  function initScrollReveal() {
    const revealEls = document.querySelectorAll(
      '.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)'
    );

    if (!revealEls.length) return;

    // No IntersectionObserver fallback — show everything immediately
    if (!('IntersectionObserver' in window) || prefersReduced) {
      revealEls.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -48px 0px'
      }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  }


  /* ══════════════════════════════════════════════════════════
     2. IMAGE LAZY REVEAL
     Marks lazy images as img-pending, then reveals them
     once they are both loaded and in the viewport.
  ══════════════════════════════════════════════════════════ */

  function initImageReveal() {
    // Only fade lazy images; eager/hero images load with page
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    if (!lazyImgs.length) return;

    if (prefersReduced) return; // images visible immediately

    if (!('IntersectionObserver' in window)) return;

    function revealImg(img) {
      img.classList.remove('img-pending');
      img.classList.add('img-revealed');
    }

    const imgObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          imgObserver.unobserve(img);

          if (img.complete && img.naturalWidth > 0) {
            // Already loaded — reveal immediately
            revealImg(img);
          } else {
            // Wait for load event
            img.addEventListener('load', function () { revealImg(img); }, { once: true });
            img.addEventListener('error', function () { revealImg(img); }, { once: true });
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    lazyImgs.forEach(function (img) {
      // Guard: don't mark images already on screen before JS runs
      // Only apply pending state if not yet complete
      if (!img.complete) {
        img.classList.add('img-pending');
      }
      imgObserver.observe(img);
    });
  }


  /* ══════════════════════════════════════════════════════════
     3. BUTTON PRESS FEEDBACK
     Sets data-pressed on pointerdown for CSS-driven tap effect.
     Works on touch and mouse. No JS animation loops.
  ══════════════════════════════════════════════════════════ */

  function initButtonFeedback() {
    if (prefersReduced) return;

    function onPointerDown(e) {
      var btn = e.currentTarget;
      btn.dataset.pressed = '1';
    }

    function onPointerUp(e) {
      var btn = e.currentTarget;
      delete btn.dataset.pressed;
    }

    document.querySelectorAll('.btn, .nav-cta, .filter-btn').forEach(function (btn) {
      btn.addEventListener('pointerdown', onPointerDown);
      btn.addEventListener('pointerup', onPointerUp);
      btn.addEventListener('pointercancel', onPointerUp);
      btn.addEventListener('pointerleave', onPointerUp);
    });
  }


  /* ══════════════════════════════════════════════════════════
     4. DRAWER LINK STAGGER
     Cascades nav-link opacity/transform when drawer opens.
     Uses MutationObserver to detect .open class toggle.
  ══════════════════════════════════════════════════════════ */

  function initDrawerStagger() {
    const drawer = document.getElementById('nav-drawer');
    if (!drawer || prefersReduced) return;

    const links = drawer.querySelectorAll('.nav-link, .nav-cta');
    if (!links.length) return;

    // Apply initial hidden state
    function resetLinks() {
      links.forEach(function (link) {
        link.style.opacity = '0';
        link.style.transform = 'translateX(16px)';
        link.style.transition = 'none';
      });
    }

    function staggerLinks() {
      links.forEach(function (link, i) {
        // Cascade: 60ms per item, starting at 80ms after drawer starts opening
        var delay = 80 + i * 60;
        link.style.transition =
          'opacity 220ms cubic-bezier(0.22,1,0.36,1) ' + delay + 'ms, ' +
          'transform 280ms cubic-bezier(0.22,1,0.36,1) ' + delay + 'ms';
        // Force a reflow to ensure the transition fires from the hidden state
        void link.offsetWidth;
        link.style.opacity = '1';
        link.style.transform = 'translateX(0)';
      });
    }

    resetLinks();

    // Observe the drawer for class changes
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === 'class') {
          if (drawer.classList.contains('open')) {
            staggerLinks();
          } else {
            // Reset immediately when closing so next open starts fresh
            setTimeout(resetLinks, 320);
          }
        }
      });
    });

    observer.observe(drawer, { attributes: true, attributeFilter: ['class'] });
  }


  /* ══════════════════════════════════════════════════════════
     5. INNER-PAGE HERO REVEAL
     On non-home pages (body.intro-complete.about-page etc.),
     applies page-in animation to .page-hero direct children.
  ══════════════════════════════════════════════════════════ */

  function initPageHeroReveal() {
    // Only run on inner pages (not homepage which has its own cascade)
    var isInnerPage = document.body.classList.contains('intro-complete') &&
                      !document.querySelector('#intro-overlay');

    if (!isInnerPage) return;

    var pageHero = document.querySelector('.page-hero, [id$="-hero"] .container');
    if (!pageHero) return;

    if (prefersReduced) return;

    // Add page-hero-revealed class with staggered delays to immediate children
    var children = Array.from(pageHero.children);
    children.forEach(function (child, i) {
      if (i < 3) {
        child.classList.add('page-hero-revealed');
        if (i > 0) child.classList.add('delay-' + i);
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     6. FOOTER COLUMNS REVEAL
     Adds reveal + stagger to footer grid columns if not
     already present (non-destructive — checks first).
  ══════════════════════════════════════════════════════════ */

  function initFooterReveal() {
    var footerGrid = document.querySelector('.footer-grid');
    if (!footerGrid) return;

    // Add reveal + stagger to direct children that don't already have it.
    // initScrollReveal() will observe these on its next pass.
    var cols = footerGrid.children;
    Array.from(cols).forEach(function (col) {
      if (!col.classList.contains('reveal') && !col.classList.contains('reveal-stagger')) {
        col.classList.add('reveal', 'reveal-stagger');
      }
    });
  }


  /* ══════════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════════ */

  function init() {
    initButtonFeedback();
    initDrawerStagger();
    initPageHeroReveal();
    initFooterReveal();
    initImageReveal();

    // Scroll reveal runs:
    //  - Immediately on inner pages (body.intro-complete is set in HTML)
    //  - On index.html: main.js already handles intro:complete
    //    but motion.js supplements for any elements main.js missed
    var isInnerPage = document.body.classList.contains('intro-complete') ||
                      document.body.classList.contains('intro-skip');

    if (isInnerPage) {
      initScrollReveal();
    } else {
      // On homepage, wait for intro to complete then supplement
      document.addEventListener('intro:complete', function () {
        setTimeout(initScrollReveal, 900); // After main.js runs at 800ms
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
