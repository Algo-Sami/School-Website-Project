/**
 * counters.js — Animated Number Counters
 * Ashraf Islamia Model Public Secondary School
 * Triggers on scroll into view using IntersectionObserver.
 */

(function () {
  'use strict';

  const COUNTER_CONFIG = [
    { id: 'stat-years',    target: 30,   suffix: '+',  duration: 1800 },
    { id: 'stat-students', target: 1200, suffix: '+',  duration: 2000 },
    { id: 'stat-teachers', target: 68,   suffix: '+',  duration: 1600 },
    { id: 'stat-success',  target: 98,   suffix: '%',  duration: 1900 },
  ];

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Updates only the leading text node of `el`, leaving any child elements
   * (e.g., <span class="stat-suffix">) untouched.
   * @param {HTMLElement} el
   * @param {string} value
   */
  function setLeadingText(el, value) {
    // Find or create the leading text node (always the first child node)
    let textNode = null;
    for (let i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === Node.TEXT_NODE) {
        textNode = el.childNodes[i];
        break;
      }
    }
    if (textNode) {
      textNode.nodeValue = value;
    } else {
      el.insertBefore(document.createTextNode(value), el.firstChild);
    }
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);

      setLeadingText(el, current.toLocaleString());

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setLeadingText(el, target.toLocaleString());
        // Pulse on completion
        el.style.animation = 'count-up-pulse 0.4s ease';
        setTimeout(() => { el.style.animation = ''; }, 400);
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    // Respect reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const statsSection = document.getElementById('stats');
    if (!statsSection) return;

    if (!('IntersectionObserver' in window)) {
      COUNTER_CONFIG.forEach(({ id, target }) => {
        const el = document.getElementById(id);
        if (el) {
          setLeadingText(el, target.toLocaleString());
        }
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          COUNTER_CONFIG.forEach(({ id, target, duration }) => {
            const el = document.getElementById(id);
            if (!el) return;

            if (prefersReduced) {
              // Set just the leading text; the suffix span is already in DOM
              setLeadingText(el, target.toLocaleString());
            } else {
              animateCounter(el, target, duration);
            }
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(statsSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
