/**
 * counters.js — Animated Number Counters
 * Ashraf Islamia Model Public Secondary School
 * Triggers on scroll into view using IntersectionObserver.
 */

(function () {
  'use strict';

  const COUNTER_CONFIG = [
    { id: 'stat-years',    target: 30,   suffix: '+',  duration: 1800 },
    { id: 'stat-students', target: 2000, suffix: '+',  duration: 2000 },
    { id: 'stat-teachers', target: 100,  suffix: '+',  duration: 1600 },
    { id: 'stat-success',  target: 90,   suffix: '%',  duration: 1900 },
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

  const FACULTY_COUNTER_CONFIG = [
    { id: 'faculty-stat-educators',  target: 100,  suffix: '+', duration: 1600 },
    { id: 'faculty-stat-areas',      target: 10,   suffix: '+', duration: 1400 },
    { id: 'faculty-stat-experience', target: 15,   suffix: '+', duration: 1600 },
    { id: 'faculty-stat-students',   target: 2000, suffix: '+', duration: 2000 },
  ];

  function initSectionCounters(sectionId, config) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window)) {
      config.forEach(({ id, target }) => {
        const el = document.getElementById(id);
        if (el) setLeadingText(el, target.toLocaleString());
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          config.forEach(({ id, target, duration }) => {
            const el = document.getElementById(id);
            if (!el) return;

            if (prefersReduced) {
              setLeadingText(el, target.toLocaleString());
            } else {
              animateCounter(el, target, duration);
            }
          });

          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
  }

  function initCounters() {
    initSectionCounters('stats', COUNTER_CONFIG);
    initSectionCounters('faculty-stats', FACULTY_COUNTER_CONFIG);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
