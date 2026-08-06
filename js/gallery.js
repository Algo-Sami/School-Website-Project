/**
 * gallery.js — Gallery Page Logic
 * Ashraf Islamia Model Public Secondary School
 *
 * Handles:
 *  - Main gallery listing (event albums)
 *  - Event detail view
 *  - Category filtering
 *  - Photo lightbox (keyboard + touch)
 *  - Video modal
 *  - Loading / skeleton states
 *  - URL hash-based routing (/gallery.html or /gallery.html#event-slug)
 *  - Scroll reveal
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     STATE
  ═══════════════════════════════════════════════════════════ */

  const state = {
    activeCategory: 'all',
    currentView:    'grid',   // 'grid' | 'event'
    currentEvent:   null,     // event object
    lightboxPhotos: [],
    lightboxIndex:  0,
    lightboxOpen:   false,
    videoOpen:      false,
    touchStartX:    0,
    touchStartY:    0,
  };

  /* ═══════════════════════════════════════════════════════════
     SHARED SCROLL REVEAL OBSERVER
     Single instance reused across all triggerReveal() calls —
     prevents memory leaks from repeated new IntersectionObserver.
  ═══════════════════════════════════════════════════════════ */

  let revealObserver = null;
  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
  }

  /* ═══════════════════════════════════════════════════════════
     DOM CACHE
  ═══════════════════════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  let dom = {};

  function cacheDom() {
    dom = {
      galleryView:     $('#gallery-view'),
      eventView:       $('#event-view'),
      albumGrid:       $('#album-grid'),
      filterBtns:      $$('.gallery-filter-btn'),
      eventTitle:      $('#event-title'),
      eventDate:       $('#event-date'),
      eventDesc:       $('#event-desc'),
      eventCoverWrap:  $('#event-cover-wrap'),
      eventCoverImg:   $('#event-cover-img'),
      eventPhotoCnt:   $('#event-photo-count'),
      eventVideoCnt:   $('#event-video-count'),
      photoGrid:       $('#photo-grid'),
      videoGrid:       $('#video-grid'),
      videoSection:    $('#video-section'),
      backBtn:         $('#back-to-gallery'),
      lightbox:        $('#gallery-lightbox'),
      lbImage:         $('#lb-image'),
      lbCounter:       $('#lb-counter'),
      lbClose:         $('#lb-close'),
      lbPrev:          $('#lb-prev'),
      lbNext:          $('#lb-next'),
      videoModal:      $('#video-modal'),
      vmClose:         $('#vm-close'),
      vmTitle:         $('#vm-title'),
      vmEmbed:         $('#vm-embed'),
    };
  }

  /* ═══════════════════════════════════════════════════════════
     ROUTING — hash-based SPA
  ═══════════════════════════════════════════════════════════ */

  function readHash() {
    // gallery.html#sports-day-2026  → show event
    // gallery.html                  → show grid
    return window.location.hash.replace('#', '').trim();
  }

  function setHash(slug) {
    history.pushState(null, '', slug ? `#${slug}` : '#');
  }

  function route() {
    const slug = readHash();
    if (slug) {
      const event = (window.GALLERY_EVENTS || []).find(e => e.id === slug);
      if (event) {
        showEventView(event);
        return;
      }
    }
    showGalleryView();
  }

  /* ═══════════════════════════════════════════════════════════
     GALLERY GRID VIEW
  ═══════════════════════════════════════════════════════════ */

  function showGalleryView() {
    state.currentView = 'grid';
    state.currentEvent = null;
    dom.galleryView.hidden = false;
    dom.eventView.hidden   = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderAlbums();
    requestAnimationFrame(() => triggerReveal(dom.galleryView));
  }

  function renderAlbums() {
    const events = (window.GALLERY_EVENTS || []).filter(e =>
      state.activeCategory === 'all' || e.category === state.activeCategory
    );

    if (!dom.albumGrid) return;

    if (events.length === 0) {
      dom.albumGrid.innerHTML = buildEmptyState();
      return;
    }

    // Build skeleton first for perceived performance
    dom.albumGrid.innerHTML = buildSkeletons(events.length);

    // Then replace with real cards after a brief pause (simulates loading)
    setTimeout(() => {
      dom.albumGrid.innerHTML = events.map((ev, i) => buildAlbumCard(ev, i)).join('');
      // Attach click listeners
      $$('.album-card', dom.albumGrid).forEach(card => {
        card.addEventListener('click', () => {
          const slug = card.dataset.eventId;
          const event = (window.GALLERY_EVENTS || []).find(e => e.id === slug);
          if (event) {
            setHash(slug);
            showEventView(event);
          }
        });
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
      // Trigger reveal animations
      requestAnimationFrame(() => triggerReveal(dom.albumGrid));
    }, 300);
  }

  function buildSkeletons(count) {
    return Array.from({ length: count }, () => `
      <div class="album-card-skeleton" aria-hidden="true">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-date"></div>
          <div class="skeleton-line skeleton-desc"></div>
          <div class="skeleton-meta">
            <div class="skeleton-line skeleton-badge"></div>
            <div class="skeleton-line skeleton-badge"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Map stagger index to utility delay class (defined in style.css)
  const CARD_DELAY_CLASSES = ['', 'delay-80', 'delay-160'];

  function buildAlbumCard(ev, index) {
    const delayClass = CARD_DELAY_CLASSES[index % 3] || '';
    return `
      <article
        class="album-card reveal-stagger reveal${delayClass ? ' ' + delayClass : ''}"
        data-event-id="${ev.id}"
        tabindex="0"
        role="button"
        aria-label="View ${ev.name} — ${ev.photoCount} photos, ${ev.videoCount} videos"
      >
        <div class="album-card-img-wrap">
          <img
            src="${ev.coverImage}"
            alt="${ev.coverAlt}"
            class="album-card-img"
            loading="lazy"
            decoding="async"
          />
          <div class="album-card-overlay" aria-hidden="true">
            <span class="album-view-label">View Album →</span>
          </div>
          <div class="album-card-category" aria-hidden="true">${capitalise(ev.category)}</div>
        </div>
        <div class="album-card-body">
          <div class="album-card-meta">
            <time class="album-card-date" datetime="${ev.year}">${ev.date}</time>
          </div>
          <h3 class="album-card-title">${ev.name}</h3>
          <p class="album-card-desc">${ev.description}</p>
          <div class="album-card-counts" aria-label="Media count">
            <span class="album-count-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              ${ev.photoCount} Photos
            </span>
            ${ev.videoCount > 0 ? `
            <span class="album-count-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              ${ev.videoCount} Videos
            </span>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function buildEmptyState() {
    return `
      <div class="gallery-empty" role="status" aria-live="polite">
        <div class="gallery-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="8" y="14" width="48" height="36" rx="4"/>
            <circle cx="22" cy="28" r="5"/>
            <path d="M8 38l14-12 10 10 8-8 14 14"/>
          </svg>
        </div>
        <h3 class="gallery-empty-title">New memories are on the way</h3>
        <p class="gallery-empty-desc">Gallery moments will appear here as school events are added. Check back soon for photos and videos from our upcoming events.</p>
        <button class="btn btn-outline-dark gallery-empty-reset" id="gallery-empty-reset">View All Events</button>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════
     EVENT DETAIL VIEW
  ═══════════════════════════════════════════════════════════ */

  function showEventView(event) {
    state.currentView  = 'event';
    state.currentEvent = event;
    dom.galleryView.hidden = true;
    dom.eventView.hidden   = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update document title for SEO
    document.title = `${event.name} | Ashraf Islamia Model Public Secondary School`;

    // Populate header
    if (dom.eventTitle)    dom.eventTitle.textContent    = event.name;
    if (dom.eventDate)     dom.eventDate.textContent     = event.date;
    if (dom.eventDesc)     dom.eventDesc.textContent     = event.description;
    if (dom.eventPhotoCnt) dom.eventPhotoCnt.textContent = `${event.photoCount} Photo${event.photoCount !== 1 ? 's' : ''}`;
    if (dom.eventVideoCnt) dom.eventVideoCnt.textContent = `${event.videoCount} Video${event.videoCount !== 1 ? 's' : ''}`;

    // Cover image
    if (dom.eventCoverImg) {
      dom.eventCoverImg.src = event.coverImage.replace('w=800', 'w=1200');
      dom.eventCoverImg.alt = event.coverAlt;
    }

    // Build photo grid (skeleton → real)
    renderPhotoGrid(event);

    // Build video grid
    renderVideoGrid(event);

    // Show/hide video section
    if (dom.videoSection) {
      dom.videoSection.hidden = event.videoCount === 0;
    }

    requestAnimationFrame(() => triggerReveal(dom.eventView));
  }

  function renderPhotoGrid(event) {
    if (!dom.photoGrid) return;

    // Skeleton
    dom.photoGrid.innerHTML = Array.from({ length: Math.min(event.photos.length, 6) }, () => `
      <div class="photo-skeleton" aria-hidden="true">
        <div class="skeleton-img"></div>
      </div>
    `).join('');

    setTimeout(() => {
      dom.photoGrid.innerHTML = event.photos.map((photo, i) => buildPhotoThumb(photo, i, event)).join('');

      // Prepare lightbox photos array
      state.lightboxPhotos = event.photos;

      $$('.photo-thumb', dom.photoGrid).forEach(thumb => {
        thumb.addEventListener('click', () => openLightbox(parseInt(thumb.dataset.index, 10)));
        thumb.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); thumb.click(); }
        });
      });

      requestAnimationFrame(() => triggerReveal(dom.photoGrid));
    }, 300);
  }

  // Photo stagger delay classes mapping (0, 50, 100, 160, 200, 300 ms)
  const PHOTO_DELAY_CLASSES = ['', 'delay-50', 'delay-100', 'delay-160', 'delay-200', 'delay-300'];

  function buildPhotoThumb(photo, index, event) {
    const delayClass = PHOTO_DELAY_CLASSES[index % 6] || '';
    return `
      <div
        class="photo-thumb reveal-stagger reveal${delayClass ? ' ' + delayClass : ''}"
        data-index="${index}"
        tabindex="0"
        role="button"
        aria-label="View photo ${index + 1} of ${event.photos.length}: ${photo.alt}"
      >
        <img
          src="${photo.src}"
          alt="${photo.alt}"
          loading="lazy"
          decoding="async"
          class="photo-thumb-img"
        />
        <div class="photo-thumb-overlay" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" width="22" height="22">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
        </div>
      </div>
    `;
  }

  function renderVideoGrid(event) {
    if (!dom.videoGrid || !event.videos.length) return;
    dom.videoGrid.innerHTML = event.videos.map((vid, i) => buildVideoCard(vid, i)).join('');

    $$('.video-card', dom.videoGrid).forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        openVideoModal(event.videos[idx]);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }

  // Video stagger delay classes mapping
  const VIDEO_DELAY_CLASSES = ['', 'delay-100', 'delay-200'];

  function buildVideoCard(vid, index) {
    const delayClass = VIDEO_DELAY_CLASSES[index % 3] || '';
    return `
      <div
        class="video-card reveal-stagger reveal${delayClass ? ' ' + delayClass : ''}"
        data-index="${index}"
        tabindex="0"
        role="button"
        aria-label="Play video: ${vid.title}"
      >
        <div class="video-card-thumb-wrap">
          <img
            src="${vid.thumbnail}"
            alt="${vid.thumbnailAlt}"
            loading="lazy"
            decoding="async"
            width="640"
            height="360"
            class="video-card-thumb"
          />
          <div class="video-card-play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          ${vid.duration ? `<span class="video-card-duration" aria-label="Duration ${vid.duration}">${vid.duration}</span>` : ''}
          <div class="video-card-overlay" aria-hidden="true"></div>
        </div>
        <div class="video-card-body">
          <h4 class="video-card-title">${vid.title}</h4>
        </div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════════
     LIGHTBOX
  ═══════════════════════════════════════════════════════════ */

  function openLightbox(index) {
    state.lightboxOpen  = true;
    state.lightboxIndex = index;
    dom.lightbox.hidden = false;
    dom.lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderLightboxImage();
    dom.lbClose.focus();
  }

  function closeLightbox() {
    state.lightboxOpen  = false;
    dom.lightbox.hidden = true;
    dom.lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the photo that opened the lightbox
    const thumb = $(`[data-index="${state.lightboxIndex}"]`, dom.photoGrid);
    thumb?.focus();
  }

  function renderLightboxImage() {
    const photos = state.lightboxPhotos;
    const idx    = state.lightboxIndex;
    const photo  = photos[idx];
    if (!photo) return;

    // Full-res version
    const fullSrc = photo.src.replace('w=600', 'w=1400').replace('q=70', 'q=85');

    dom.lbImage.src = fullSrc;
    dom.lbImage.alt = photo.alt;
    dom.lbCounter.textContent = `${idx + 1} / ${photos.length}`;

    // Prev/Next button states
    dom.lbPrev.disabled = idx === 0;
    dom.lbNext.disabled = idx === photos.length - 1;
  }

  function lightboxPrev() {
    if (state.lightboxIndex > 0) {
      state.lightboxIndex--;
      renderLightboxImage();
    }
  }

  function lightboxNext() {
    if (state.lightboxIndex < state.lightboxPhotos.length - 1) {
      state.lightboxIndex++;
      renderLightboxImage();
    }
  }

  /* ═══════════════════════════════════════════════════════════
     VIDEO MODAL
  ═══════════════════════════════════════════════════════════ */

  function openVideoModal(video) {
    state.videoOpen = true;
    dom.videoModal.hidden = false;
    dom.videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (dom.vmTitle) dom.vmTitle.textContent = video.title;
    // Embed a placeholder video notice (no real video upload yet)
    if (dom.vmEmbed) {
      dom.vmEmbed.innerHTML = `
        <div class="vm-placeholder">
          <img src="${video.thumbnail}" alt="${video.thumbnailAlt}" class="vm-placeholder-img"/>
          <div class="vm-placeholder-overlay">
            <div class="vm-placeholder-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" width="48" height="48">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10 8 16 12 10 16 10 8" fill="white" stroke="none"/>
              </svg>
            </div>
            <p class="vm-placeholder-label">Video content will be available once the Admin Panel is connected.</p>
            <p class="vm-placeholder-sublabel">This is a demo placeholder for: <strong>${video.title}</strong></p>
          </div>
        </div>
      `;
    }
    dom.vmClose?.focus();
  }

  function closeVideoModal() {
    state.videoOpen = false;
    dom.videoModal.hidden = true;
    dom.videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ═══════════════════════════════════════════════════════════
     FILTERING
  ═══════════════════════════════════════════════════════════ */

  function initFilters() {
    // Build filter buttons from category data
    const filterWrap = $('#filter-wrap');
    if (!filterWrap || !window.GALLERY_CATEGORIES) return;

    filterWrap.innerHTML = window.GALLERY_CATEGORIES.map(cat => `
      <button
        class="gallery-filter-btn${cat.id === 'all' ? ' active' : ''}"
        data-category="${cat.id}"
        aria-pressed="${cat.id === 'all' ? 'true' : 'false'}"
      >${cat.label}</button>
    `).join('');

    // Update cached buttons
    dom.filterBtns = $$('.gallery-filter-btn');

    dom.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.dataset.category;
        dom.filterBtns.forEach(b => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderAlbums();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     KEYBOARD & TOUCH
  ═══════════════════════════════════════════════════════════ */

  function initKeyboard() {
    document.addEventListener('keydown', e => {
      if (state.lightboxOpen) {
        if (e.key === 'ArrowLeft')  lightboxPrev();
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'Escape')     closeLightbox();
      }
      if (state.videoOpen && e.key === 'Escape') closeVideoModal();
    });
  }

  function initTouch() {
    if (!dom.lightbox) return;
    dom.lightbox.addEventListener('touchstart', e => {
      state.touchStartX = e.touches[0].clientX;
      state.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    dom.lightbox.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - state.touchStartX;
      const dy = e.changedTouches[0].clientY - state.touchStartY;
      // Only react if horizontal swipe dominates vertical movement
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        dx < 0 ? lightboxNext() : lightboxPrev();
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     SCROLL REVEAL
  ═══════════════════════════════════════════════════════════ */

  function triggerReveal(ctx = document) {
    const els = $$('.reveal, .reveal-left, .reveal-right', ctx);
    if (!revealObserver) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }
    els.forEach(el => revealObserver.observe(el));
  }

  /* ═══════════════════════════════════════════════════════════
     EVENT LISTENERS
  ═══════════════════════════════════════════════════════════ */

  function initEventListeners() {
    // Back button
    dom.backBtn?.addEventListener('click', () => {
      setHash('');
      document.title = 'Gallery | Ashraf Islamia Model Public Secondary School';
      showGalleryView();
    });

    // Lightbox controls
    dom.lbClose?.addEventListener('click', closeLightbox);
    dom.lbPrev?.addEventListener('click',  lightboxPrev);
    dom.lbNext?.addEventListener('click',  lightboxNext);

    // Lightbox: click backdrop to close
    dom.lightbox?.addEventListener('click', e => {
      if (e.target === dom.lightbox || e.target.classList.contains('lb-backdrop')) {
        closeLightbox();
      }
    });

    // Video modal
    dom.vmClose?.addEventListener('click', closeVideoModal);
    dom.videoModal?.addEventListener('click', e => {
      if (e.target === dom.videoModal || e.target.classList.contains('vm-backdrop')) {
        closeVideoModal();
      }
    });

    // Hash change (browser back/forward)
    window.addEventListener('popstate', route);

    // Empty state reset button (delegated)
    document.addEventListener('click', e => {
      if (e.target && (e.target.id === 'gallery-empty-reset')) {
        state.activeCategory = 'all';
        dom.filterBtns = $$('.gallery-filter-btn');
        dom.filterBtns.forEach(b => {
          b.classList.toggle('active', b.dataset.category === 'all');
          b.setAttribute('aria-pressed', b.dataset.category === 'all' ? 'true' : 'false');
        });
        renderAlbums();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     UTILITIES
  ═══════════════════════════════════════════════════════════ */

  function capitalise(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════ */

  function init() {
    cacheDom();
    initFilters();
    initEventListeners();
    initKeyboard();
    initTouch();
    // Route based on current hash
    route();
    // Trigger reveal on initial load
    setTimeout(() => triggerReveal(), 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
