/* CURRENT IMAGES AND STATISTICS ARE TEMPORARY DEVELOPMENT CONTENT. REPLACE THROUGH ADMIN PANEL AFTER CLIENT VERIFICATION. */

(function () {
  'use strict';

  /**
   * Centralized configuration data object for About Page.
   * CMS-ready structure: values & image URLs can later be updated or populated via API/Admin Panel.
   */
  const aboutContent = {
    heroImage: {
      id: "about-hero-img",
      url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000",
      alt: "Prestigious educational campus building architecture",
      objectPosition: "center center",
      temporary: true
    },
    whoWeAreImage: {
      id: "about-whoweare-img",
      url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000",
      alt: "Students learning and collaborating in an educational classroom environment",
      objectPosition: "center center",
      temporary: true
    },
    communityImage: {
      id: "about-community-img",
      url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000",
      alt: "Students together in a positive school community environment",
      objectPosition: "center 30%",
      temporary: true
    },
    leadershipImage: {
      id: "about-leadership-img",
      url: null,
      alt: "Leadership Portrait Placeholder",
      objectPosition: "center 20%",
      temporary: true
    },
    futureVisionImage: {
      id: "about-future-img",
      url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000",
      alt: "Modern educational technology and academic ambition",
      objectPosition: "center center",
      temporary: true
    },
    statistics: [
      {
        id: "about-stat-years",
        target: 30,
        suffix: "+",
        label: "YEARS OF EXCELLENCE",
        temporary: true
      },
      {
        id: "about-stat-students",
        target: 1200,
        suffix: "+",
        formatComma: true,
        label: "STUDENTS",
        temporary: true
      },
      {
        id: "about-stat-teachers",
        target: 80,
        suffix: "+",
        label: "FACULTY MEMBERS",
        temporary: true
      },
      {
        id: "about-stat-achievements",
        target: 100,
        suffix: "+",
        label: "ACHIEVEMENTS",
        temporary: true
      }
    ]
  };

  /**
   * Graceful Image Population with Fallback System.
   * If `item.url` is present and valid, appends an `<img>` element.
   * If `item.url` is empty or fails to load, leaves the existing placeholder overlay visual untouched.
   */
  function populateImages() {
    const imagesToPopulate = [
      aboutContent.heroImage,
      aboutContent.whoWeAreImage,
      aboutContent.communityImage,
      aboutContent.leadershipImage,
      aboutContent.futureVisionImage
    ];

    imagesToPopulate.forEach((item) => {
      if (!item || !item.id || !item.url) return;

      const container = document.getElementById(item.id);
      if (!container) return;

      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.alt || 'School visual';
      img.loading = item.id.includes('hero') ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (item.objectPosition) {
        img.style.objectPosition = item.objectPosition;
      }

      // Fallback handling: only display if image loads successfully
      img.onerror = () => {
        img.remove(); // Remove broken image element so CSS placeholder remains visible
      };

      container.appendChild(img);
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function setCounterText(el, numStr, suffix) {
    el.textContent = numStr + (suffix || '');
  }

  /**
   * Natural Count-up Statistics Animation.
   * Animates numbers from 0 to target when #about-stats enters the viewport.
   */
  function initAboutStatsAnimation() {
    const statsSection = document.getElementById('about-stats');
    if (!statsSection) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        aboutContent.statistics.forEach((stat) => {
          const valEl = document.getElementById(stat.id);
          const lblEl = document.getElementById(stat.id + '-lbl');

          if (lblEl && stat.label) {
            lblEl.textContent = stat.label;
          }

          if (!valEl) return;

          const formattedTarget = stat.formatComma
            ? stat.target.toLocaleString()
            : stat.target.toString();

          if (prefersReduced) {
            setCounterText(valEl, formattedTarget, stat.suffix);
            return;
          }

          const duration = 1800;
          const start = performance.now();

          function step(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const currentNum = Math.round(eased * stat.target);
            const currentStr = stat.formatComma
              ? currentNum.toLocaleString()
              : currentNum.toString();

            setCounterText(valEl, currentStr, stat.suffix);

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCounterText(valEl, formattedTarget, stat.suffix);
            }
          }

          requestAnimationFrame(step);
        });

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

  function init() {
    populateImages();
    initAboutStatsAnimation();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
