/* ============================================================
   ADMISSIONS-DATA.JS — Ashraf Islamia Model Public Secondary School
   CMS-ready data layer for the Admissions page.
   Images and details here are TEMPORARY DEVELOPMENT PLACEHOLDERS.
   Replace through Admin Panel after client verification.
   ============================================================ */

(function () {
  'use strict';

  /**
   * Conceptual structure for future Admin Panel integration:
   * admissionsData = {
   *   hero: { heading: "...", image: "..." },
   *   introduction: { heading: "...", text: "..." },
   *   reasons: [ { title: "...", desc: "..." }, ... ],
   *   eligibility: [ { level: "...", desc: "..." }, ... ],
   *   process: [ { step: 1, title: "...", desc: "..." }, ... ],
   *   documents: [ "...", "..." ],
   *   importantInformation: [ { title: "...", text: "..." } ],
   *   nextSteps: [ ... ],
   *   faqs: [ { q: "...", a: "..." } ],
   *   cta: { ... }
   * }
   */
  
  const admissionForm = {
    title: "Official Admission Form",
    file: "assets/admissionform.pdf",
    fileType: "PDF"
  };

  const admissionsData = {
    images: [
      {
        id: 'admissions-hero-img',
        url: 'assets/images/admissions_hero_students.png',
        alt: 'Students in uniform wearing animal character hats during a creative school activity at Ashraf Islamia Model Public School',
        objectPosition: 'center center',
        temporary: false
      }
    ]
  };

  /* -- Admission Form Initialization -------------------------- */

  function initAdmissionFormLinks() {
    const downloadBtn = document.getElementById('form-download-btn');
    const viewBtn = document.getElementById('form-view-btn');

    if (downloadBtn) {
      downloadBtn.href = admissionForm.file;
      downloadBtn.setAttribute('download', 'Ashraf-Islamia-Admission-Form.pdf');
    }
    if (viewBtn) {
      viewBtn.href = admissionForm.file;
    }
  }

  /* -- Image Population ---------------------------------------- */

  function populateImages() {
    admissionsData.images.forEach(function (item) {
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

  /* -- FAQ Accordion Logic ------------------------------------- */

  function initFAQ() {
    const faqButtons = document.querySelectorAll('.faq-question');
    if (!faqButtons.length) return;

    faqButtons.forEach(button => {
      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        // Optional: Close all other accordions (uncomment if desired)
        /*
        faqButtons.forEach(btn => {
          btn.setAttribute('aria-expanded', 'false');
          btn.nextElementSibling.style.maxHeight = null;
        });
        */

        // Toggle current accordion
        button.setAttribute('aria-expanded', !isExpanded);
        const answer = button.nextElementSibling;
        
        if (!isExpanded) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = null;
        }
      });
    });
  }

  /* -- Timeline Animation (Optional reveal logic) -------------- */

  function initTimelineReveal() {
    const timelineItems = document.querySelectorAll('.process-step');
    if (!timelineItems.length) return;

    if (!('IntersectionObserver' in window)) {
      timelineItems.forEach(item => item.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    timelineItems.forEach(item => observer.observe(item));
  }

  /* -- Init ---------------------------------------------------- */
  function init() { 
    populateImages(); 
    initFAQ();
    initTimelineReveal();
    initAdmissionFormLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
