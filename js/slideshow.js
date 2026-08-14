/**
 * slideshow.js — Hero Slideshow Engine
 * Ashraf Islamia Model Public Secondary School
 * Cross-fade slideshow with Ken Burns effect.
 *
 * Performance optimisations:
 *  - Slide 0 loads eagerly; slides 1-4 lazy-load via data-src
 *  - loadSlideImage() sets src on demand and pre-fetches the next slide
 *  - IntersectionObserver pauses autoplay when hero is off-screen
 *  - startAuto() guards against duplicate interval timers
 */

(function () {
  'use strict';

  const INTERVAL_MS   = 6000;
  const FADE_DURATION = 1400; // matches CSS transition

  const slides = [
    {
      image: 'assets/images/hero_excellence.jpg',
      label: 'Est. Since Decades',
      headline: 'Where <em>Excellence</em><br>Finds Its Home',
      sub: 'A legacy of academic distinction, moral character, and transformative education — shaping the leaders of tomorrow.',
    },
    {
      image: 'assets/images/hero_classroom.png',
      label: 'Exceptional Education',
      headline: 'Learning That<br><em>Ignites</em> Potential',
      sub: 'Every classroom is a sanctuary of knowledge, guided by dedicated educators who inspire curiosity and critical thinking.',
    },
    {
      image: 'assets/images/hero_community_values.jpg',
      label: 'Vibrant Campus Life',
      headline: 'A Community<br>Built on <em>Values</em>',
      sub: 'Beyond academics, we nurture character, brotherhood, and a lifelong love of learning in every student we serve.',
    },
    {
      image: 'assets/images/hero_achievements.png',
      label: 'Pride & Achievement',
      headline: 'Celebrating<br><em>Every</em> Milestone',
      sub: 'Our students consistently achieve excellence in academics, competitions, and life — a testament to our institutional commitment.',
    },
    {
      image: 'assets/images/hero_sports_original.jpg',
      label: 'Body, Mind & Spirit',
      headline: 'Champions in<br>Every <em>Arena</em>',
      sub: 'Sport teaches discipline, teamwork, and resilience. Our students compete with distinction both on and off the field.',
    },
  ];

  let currentIndex    = 0;
  let autoTimer       = null;
  let isTransitioning = false;
  let heroVisible     = true; // tracks IntersectionObserver state

  function getElements() {
    return {
      slidesContainer: document.querySelector('.hero-slideshow'),
      dotsContainer:   document.querySelector('.hero-indicators'),
      headlineEl:      document.getElementById('hero-headline'),
      subEl:           document.getElementById('hero-sub'),
      labelEl:         document.getElementById('hero-label'),
    };
  }

  /**
   * Ensure a slide has its image src set (lazy-load on demand).
   * Also pre-fetches the *next* slide so it is ready before the transition.
   */
  function loadSlideImage(idx) {
    const { slidesContainer } = getElements();
    if (!slidesContainer) return;
    const slideEls = slidesContainer.querySelectorAll('.hero-slide');

    // Load target slide
    const targetEl = slideEls[idx];
    if (targetEl) {
      const img = targetEl.querySelector('img');
      if (img && img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
    }

    // Pre-fetch next slide
    const nextIdx   = (idx + 1) % slides.length;
    const nextEl    = slideEls[nextIdx];
    if (nextEl) {
      const nextImg = nextEl.querySelector('img');
      if (nextImg && nextImg.dataset.src && !nextImg.src) {
        nextImg.src = nextImg.dataset.src;
      }
    }
  }

  function buildSlides(container, dotsContainer) {
    slides.forEach((slide, i) => {
      const el = document.createElement('div');
      el.className = 'hero-slide' + (i === 0 ? ' active' : '');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', `Slide ${i + 1}: ${slide.label}`);

      const img     = document.createElement('img');
      img.alt       = slide.label;
      img.decoding  = 'async';

      if (i === 0) {
        // Slide 0: load immediately with high fetch priority
        img.src           = slide.image;
        img.loading       = 'eager';
        img.fetchPriority = 'high';
      } else {
        // Slides 1-4: defer via data-src; src set by loadSlideImage()
        img.dataset.src = slide.image;
        img.loading     = 'lazy';
      }

      el.appendChild(img);
      container.appendChild(el);

      // Dot indicator
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    // Pre-fetch slide 1 right after init so it is ready for the first auto-advance
    loadSlideImage(1);
  }

  function updateContent(idx) {
    const { headlineEl, subEl, labelEl } = getElements();
    const slide = slides[idx];
    if (labelEl)    labelEl.textContent  = slide.label;
    if (headlineEl) headlineEl.innerHTML = slide.headline;
    if (subEl)      subEl.textContent    = slide.sub;
  }

  function goToSlide(idx) {
    if (isTransitioning || idx === currentIndex) return;
    isTransitioning = true;

    const { slidesContainer, dotsContainer } = getElements();
    const slideEls = slidesContainer.querySelectorAll('.hero-slide');
    const dotEls   = dotsContainer.querySelectorAll('.hero-dot');

    // Lazy-load this slide's image (and pre-fetch the next)
    loadSlideImage(idx);

    // Reset Ken Burns on incoming slide
    const incoming = slideEls[idx];
    const img      = incoming.querySelector('img');
    if (img) {
      img.style.animation = 'none';
      void img.offsetWidth; // deliberate reflow — isolated to slide transition only
      img.style.animation = '';
    }

    slideEls[currentIndex].classList.remove('active');
    incoming.classList.add('active');

    dotEls[currentIndex].classList.remove('active');
    dotEls[currentIndex].setAttribute('aria-selected', 'false');
    dotEls[idx].classList.add('active');
    dotEls[idx].setAttribute('aria-selected', 'true');

    updateContent(idx);
    currentIndex = idx;

    setTimeout(() => { isTransitioning = false; }, FADE_DURATION);
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % slides.length);
  }

  function startAuto() {
    if (autoTimer) clearInterval(autoTimer); // prevent duplicate timers
    autoTimer = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function init() {
    const { slidesContainer, dotsContainer } = getElements();
    if (!slidesContainer || !dotsContainer) return;

    buildSlides(slidesContainer, dotsContainer);
    updateContent(0);

    const heroEl = document.getElementById('hero');

    // Pause autoplay when hero section is off-screen (conserves CPU)
    if (heroEl && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            heroVisible = entry.isIntersecting;
            heroVisible ? startAuto() : stopAuto();
          });
        },
        { threshold: 0.1 }
      );
      heroObserver.observe(heroEl);
    }

    // Pause on hover/focus so users can read the current slide
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stopAuto);
      heroEl.addEventListener('mouseleave', () => { if (heroVisible) startAuto(); });
      heroEl.addEventListener('focusin',    stopAuto);
      heroEl.addEventListener('focusout',   () => { if (heroVisible) startAuto(); });
    }

    // Keyboard navigation — only when not typing in an input
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        stopAuto();
        goToSlide((currentIndex - 1 + slides.length) % slides.length);
        if (heroVisible) startAuto();
      }
      if (e.key === 'ArrowRight') {
        stopAuto();
        nextSlide();
        if (heroVisible) startAuto();
      }
    });

    startAuto();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
