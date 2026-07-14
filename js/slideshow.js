/**
 * slideshow.js — Hero Slideshow Engine
 * Ashraf Islamia Model Public Secondary School
 * Cross-fade slideshow with Ken Burns effect.
 */

(function () {
  'use strict';

  const INTERVAL_MS = 6000;
  const FADE_DURATION = 1400; // matches CSS transition

  // Slide data: image path + content
  const slides = [
    {
      image: 'assets/images/hero_building.png',
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
      image: 'assets/images/hero_campus.png',
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
      image: 'assets/images/hero_sports.png',
      label: 'Body, Mind & Spirit',
      headline: 'Champions in<br>Every <em>Arena</em>',
      sub: 'Sport teaches discipline, teamwork, and resilience. Our students compete with distinction both on and off the field.',
    },
  ];

  let currentIndex = 0;
  let autoTimer = null;
  let isTransitioning = false;

  function getElements() {
    return {
      slidesContainer: document.querySelector('.hero-slideshow'),
      dotsContainer: document.querySelector('.hero-indicators'),
      headlineEl: document.getElementById('hero-headline'),
      subEl: document.getElementById('hero-sub'),
      labelEl: document.getElementById('hero-label'),
    };
  }

  function buildSlides(container, dotsContainer) {
    // Build slide DOM
    slides.forEach((slide, i) => {
      const el = document.createElement('div');
      el.className = 'hero-slide' + (i === 0 ? ' active' : '');
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', `Slide ${i + 1}: ${slide.label}`);

      const img = document.createElement('img');
      img.src = slide.image;
      img.alt = slide.label;
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.fetchPriority = i === 0 ? 'high' : 'auto';

      el.appendChild(img);
      container.appendChild(el);

      // Dot
      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  function updateContent(idx) {
    const { headlineEl, subEl, labelEl } = getElements();
    const slide = slides[idx];

    if (labelEl) labelEl.textContent = slide.label;
    if (headlineEl) headlineEl.innerHTML = slide.headline;
    if (subEl) subEl.textContent = slide.sub;
  }

  function goToSlide(idx) {
    if (isTransitioning || idx === currentIndex) return;
    isTransitioning = true;

    const { slidesContainer, dotsContainer } = getElements();
    const slideEls = slidesContainer.querySelectorAll('.hero-slide');
    const dotEls   = dotsContainer.querySelectorAll('.hero-dot');

    // Reset Ken Burns on new slide
    const incoming = slideEls[idx];
    const img = incoming.querySelector('img');
    if (img) {
      img.style.animation = 'none';
      void img.offsetWidth; // reflow
      img.style.animation = '';
    }

    // Fade
    slideEls[currentIndex].classList.remove('active');
    incoming.classList.add('active');

    dotEls[currentIndex].classList.remove('active');
    dotEls[idx].classList.add('active');

    updateContent(idx);
    currentIndex = idx;

    setTimeout(() => { isTransitioning = false; }, FADE_DURATION);
  }

  function nextSlide() {
    goToSlide((currentIndex + 1) % slides.length);
  }

  function startAuto() {
    autoTimer = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  function init() {
    const { slidesContainer, dotsContainer } = getElements();
    if (!slidesContainer || !dotsContainer) return;

    buildSlides(slidesContainer, dotsContainer);
    updateContent(0);

    // Pause on hover/focus
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.addEventListener('mouseenter', stopAuto);
      heroEl.addEventListener('mouseleave', startAuto);
      heroEl.addEventListener('focusin', stopAuto);
      heroEl.addEventListener('focusout', startAuto);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { stopAuto(); goToSlide((currentIndex - 1 + slides.length) % slides.length); startAuto(); }
      if (e.key === 'ArrowRight') { stopAuto(); nextSlide(); startAuto(); }
    });

    startAuto();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
