/* ============================================================
   ACADEMICS-DATA.JS — Ashraf Islamia Model Public Secondary School
   CMS-ready data layer for the Academics page.
   Images and statistics here are TEMPORARY DEVELOPMENT PLACEHOLDERS.
   Replace through Admin Panel after client verification.
   ============================================================ */

(function () {
  'use strict';

  /**
   * Central content configuration for the Academics page.
   * Each entry maps to a DOM element by ID.
   * url: null   -> JS skips injection, CSS placeholder remains visible.
   * url: string -> JS injects <img> with onerror fallback.
   */
  const academicsData = {

    images: [
      {
        id: 'academics-hero-img',
        url: 'assets/images/academics_classroom.png',
        alt: 'Students engaged in learning inside a well-equipped academic classroom',
        objectPosition: 'center 40%',
        temporary: false
      },
      {
        id: 'academics-beyond-img',
        url: 'assets/images/academics_cocurricular.png',
        alt: 'Students participating in co-curricular activities and science experiments',
        objectPosition: 'center 30%',
        temporary: false
      },
      {
        id: 'academics-env-img',
        url: 'assets/images/academics_library.png',
        alt: 'Students studying in a well-stocked school library',
        objectPosition: 'center center',
        temporary: false
      }
    ],

    statistics: [
      {
        id:       'acad-stat-years',
        labelId:  'acad-stat-years-lbl',
        target:   30,
        suffix:   '+',
        label:    'Years of Excellence',
        temporary: true
      },
      {
        id:          'acad-stat-students',
        labelId:     'acad-stat-students-lbl',
        target:      1200,
        suffix:      '+',
        formatComma: true,
        label:       'Students Enrolled',
        temporary:   true
      },
      {
        id:       'acad-stat-faculty',
        labelId:  'acad-stat-faculty-lbl',
        target:   50,
        suffix:   '+',
        label:    'Dedicated Faculty',
        temporary: true
      },
      {
        id:       'acad-stat-achievement',
        labelId:  'acad-stat-achievement-lbl',
        target:   95,
        suffix:   '%',
        label:    'Student Achievement',
        temporary: true
      }
    ]
  };

  /* -- Image Population ---------------------------------------- */

  function populateImages() {
    academicsData.images.forEach(function (item) {
      if (!item || !item.id || !item.url) return;
      const container = document.getElementById(item.id);
      if (!container) return;
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.alt || 'School visual';
      img.loading = item.id.includes('hero') ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (item.objectPosition) img.style.objectPosition = item.objectPosition;
      img.onerror = () => img.remove();
      container.appendChild(img);
    });
  }

  /* -- Statistics Count-Up Animation --------------------------- */

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el, stat) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const formatted = stat.formatComma ? stat.target.toLocaleString() : stat.target.toString();
    if (prefersReduced) { el.textContent = formatted + (stat.suffix || ''); return; }
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.round(easeOutCubic(progress) * stat.target);
      el.textContent = (stat.formatComma ? current.toLocaleString() : current.toString()) + (stat.suffix || '');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatted + (stat.suffix || '');
    }
    requestAnimationFrame(step);
  }

  function initStatsAnimation() {
    const section = document.getElementById('academics-stats');
    if (!section) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        academicsData.statistics.forEach((stat) => {
          const valEl = document.getElementById(stat.id);
          const lblEl = document.getElementById(stat.labelId);
          if (lblEl && stat.label) lblEl.textContent = stat.label;
          if (valEl) animateCounter(valEl, stat);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  /* -- Init ---------------------------------------------------- */
  function init() { populateImages(); initStatsAnimation(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
