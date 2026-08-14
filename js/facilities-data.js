/* ============================================================
   FACILITIES-DATA.JS — Ashraf Islamia Model Public Secondary School
   CMS-ready data layer and logic for the Facilities page.
   ============================================================ */

(function () {
  'use strict';

  /**
   * Centralized configuration data object for Facilities Page.
   * CMS-ready structure: values & image URLs can later be updated or populated via API/Admin Panel.
   */
  const facilitiesData = {
    hero: {
      title: "Our Facilities",
      description: "Our campus provides students with a safe, supportive, and engaging learning environment equipped with facilities that encourage academic excellence, personal growth, and overall development.",
      image: {
        id: "facilities-hero-img",
        url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1000",
        alt: "Ashraf Islamia Model Public Secondary School campus and learning environment",
        objectPosition: "center center",
        temporary: true
      }
    },

    featured: [
      {
        id: "feat-computer-lab",
        title: "Computer Laboratory",
        description: "Introduce students to modern computer education while developing essential digital skills through practical learning experiences.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        image: {
          url: "assets/images/computer_lab.jpg",
          alt: "Students working on computers in the Ashraf Islamia school computer laboratory",
          objectPosition: "center center",
          objectFit: "cover"
        },
        displayOrder: 1,
        visible: true
      },
      {
        id: "feat-science-lab",
        title: "Science Laboratory",
        description: "Encourage curiosity and hands-on scientific learning through practical experiments in a safe laboratory environment.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5M12 2v14M8 12h8"/></svg>`,
        image: {
          url: "assets/images/science_lab.jpg",
          alt: "Scientific equipment, skeletons, and educational models in the school laboratory",
          objectPosition: "center center",
          objectFit: "cover"
        },
        displayOrder: 2,
        visible: true
      },
      {
        id: "feat-library",
        title: "Library",
        description: "Provide students with access to books and learning resources that promote reading habits, research, and independent learning.",
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/></svg>`,
        image: {
          url: "assets/images/library.jpg",
          alt: "Bookshelves and reading area inside the Ashraf Islamia school library",
          objectPosition: "center center",
          objectFit: "cover"
        },
        displayOrder: 3,
        visible: true
      }
    ],

    grid: [
      {
        title: "Cafeteria / Canteen",
        description: "A hygienic canteen area offering fresh and healthy meals, drinks, and snacks for students and staff members during break hours.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600",
        displayOrder: 1,
        visible: true
      },
      {
        title: "Clean Drinking Water",
        description: "Equipped with advanced reverse osmosis filtration systems to supply clean, safe, and cold drinking water campus-wide.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
        image: "https://images.unsplash.com/photo-1548839140-29a88648f138?w=600",
        displayOrder: 2,
        visible: true
      },

      {
        title: "CCTV Surveillance",
        description: "High-definition CCTV security camera network monitoring school boundaries, hallways, and common areas 24/7.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
        image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600",
        displayOrder: 4,
        visible: true
      },
      {
        title: "Security Guards",
        description: "Professional, alert security staff stationed at all gates to manage visitor access and guarantee safety.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600",
        displayOrder: 5,
        visible: true
      },

      {
        title: "Parking Area",
        description: "Safe, spacious, and dedicated on-campus parking slots configured for bicycles, motorcycles, and vehicles of parents and staff.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
        image: "https://images.unsplash.com/photo-1506521788723-868611d59127?w=600",
        displayOrder: 7,
        visible: true
      },
      {
        title: "Clean & Well-Maintained Classrooms",
        description: "Spacious, well-ventilated, and clean classrooms designed with comfortable seating setups to promote focus and active learning.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 10v6M2 10v6M4 10h16M12 4v6M12 16v4"/></svg>`,
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600",
        displayOrder: 8,
        visible: true
      },
      {
        title: "Reception / Help Desk",
        description: "Our dedicated main lobby helpdesk ready to greet visitors, answer telephone enquiries, and guide school guests.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=600",
        displayOrder: 9,
        visible: true
      },
      {
        title: "Principal's Office",
        description: "The administrative leadership hub where academic planning, strategy coordination, and parent-principal meetings occur.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600",
        displayOrder: 10,
        visible: true
      },

      {
        title: "Waiting Area for Parents",
        description: "A comfortable, quiet waiting room provided for parents and guardians visiting the campus for meetings or information.",
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 15H8v6h4z"/></svg>`,
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600",
        displayOrder: 12,
        visible: true
      }
    ],

    studentLife: {
      headline: "Beyond the Classroom",
      description: "At Ashraf Islamia Model Public School, education extends beyond textbooks. Students are encouraged to participate in activities that nurture confidence, teamwork, discipline, creativity, and leadership.",
      image: {
        id: "student-life-img",
        url: "https://images.unsplash.com/photo-1516534775068-ba3e84589d90?w=800",
        alt: "Students engaging in team building and co-curricular projects outside the classroom",
        objectPosition: "center center"
      },
      cards: [
        {
          title: "Co-Curricular Activities",
          description: "Enhance creative expression, speech and debating skills, calligraphy, quiz programs, and moral educational competitions.",
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
        },
        {
          title: "Annual Sports Events",
          description: "Promoting physical fitness, teamwork, healthy competition, and sportsmanship through scheduled athletic and games meets.",
          icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M6 12A6 6 0 0 1 18 12"/></svg>`
        }
      ]
    },

    safety: [
      {
        title: "CCTV Surveillance",
        description: "A continuous monitor network across corridors, gates, and school hallways ensures complete digital observation of student safety.",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`
      },
      {
        title: "Professional Security Staff",
        description: "Trained guards manage visitor records and carry checkups at primary school access points to guarantee peace of mind.",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
      },
      {
        title: "Secure Campus Boundary",
        description: "Integrated entry control, high walls, and guarded gates make the campus a secure learning sanctuary.",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`
      }
    ]
  };

  /**
   * Safe image injector function.
   * Renders image dynamic layers with full loading fallback, preventing layout shifts.
   */
  function injectImage(containerId, imageData, isEager = false, objectFit = 'cover') {
    if (!imageData || !imageData.url) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (objectFit === 'contain-blur') {
      // 1. Background blurred image to cover the card
      const bgImg = document.createElement('img');
      bgImg.src = imageData.url;
      bgImg.alt = '';
      bgImg.loading = isEager ? 'eager' : 'lazy';
      bgImg.decoding = 'async';
      bgImg.style.objectFit = 'cover';
      bgImg.style.filter = 'blur(10px) brightness(0.55)';
      bgImg.style.position = 'absolute';
      bgImg.style.inset = '0';
      bgImg.style.width = '100%';
      bgImg.style.height = '100%';
      bgImg.style.zIndex = '1';
      container.appendChild(bgImg);

      // 2. Foreground contained image to display the full photo without cropping
      const fgImg = document.createElement('img');
      fgImg.src = imageData.url;
      fgImg.alt = imageData.alt || 'School Facility';
      fgImg.loading = isEager ? 'eager' : 'lazy';
      fgImg.decoding = 'async';
      fgImg.style.objectFit = 'contain';
      fgImg.style.position = 'absolute';
      fgImg.style.inset = '0';
      fgImg.style.width = '100%';
      fgImg.style.height = '100%';
      fgImg.style.zIndex = '2';
      fgImg.onerror = () => {
        bgImg.remove();
        fgImg.remove();
      };
      container.appendChild(fgImg);
    } else {
      const img = document.createElement('img');
      img.src = imageData.url;
      img.alt = imageData.alt || 'School Facility';
      img.loading = isEager ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.style.objectFit = objectFit;
      if (imageData.objectPosition) {
        img.style.objectPosition = imageData.objectPosition;
      }
      img.onerror = () => img.remove(); // Removes on error so standard placeholder style displays

      container.appendChild(img);
    }
  }

  /**
   * Render Featured Facilities (Alternating layout, cards with text & image)
   */
  function renderFeaturedFacilities() {
    const container = document.getElementById('featured-facilities-list');
    if (!container) return;

    // Filter and sort by displayOrder
    const visibleFeatured = facilitiesData.featured
      .filter(f => f.visible)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    container.innerHTML = '';

    visibleFeatured.forEach((item, index) => {
      const isEven = index % 2 === 0;
      const layoutClass = isEven ? 'feat-row' : 'feat-row feat-row-reverse';
      const imgId = `feat-img-${index}`;

      const featSection = document.createElement('div');
      featSection.className = `feat-item reveal ${isEven ? 'reveal-left' : 'reveal-right'}`;
      const aspectRatio = item.aspectRatio || 1.5;
      const imgFit = (item.image && item.image.objectFit) ? item.image.objectFit : 'cover';
      featSection.innerHTML = `
        <div class="${layoutClass}">
          <div class="feat-image-wrap">
            <div class="image-placeholder" id="${imgId}" style="--aspect-ratio: ${aspectRatio}; ${imgFit === 'contain' ? 'background: #faf8f3; border: none; margin-inline: 80px;' : ''}" aria-label="${item.title} image placeholder" role="img">
              <div class="placeholder-overlay">
                <span class="placeholder-icon-large">${item.icon}</span>
                <span class="placeholder-label">[ ${item.title} ]</span>
              </div>
            </div>
          </div>
          <div class="feat-content-wrap">
            <div class="feat-icon-wrap" aria-hidden="true">${item.icon}</div>
            <h3 class="feat-card-title">${item.title}</h3>
            <p class="feat-card-desc">${item.description}</p>
          </div>
        </div>
      `;

      container.appendChild(featSection);
      // Inject image on client
      injectImage(imgId, item.image, false, imgFit);
    });
  }

  /**
   * Render Campus Grid Facilities
   */
  function renderGridFacilities() {
    const container = document.getElementById('facilities-grid-container');
    if (!container) return;

    // Sort grid items by displayOrder
    const sortedGrid = facilitiesData.grid
      .filter(g => g.visible)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    container.innerHTML = '';

    sortedGrid.forEach((item, index) => {
      const imgId = `grid-img-${index}`;

      const card = document.createElement('div');
      card.className = 'grid-card reveal reveal-stagger';
      card.innerHTML = `
        <div class="grid-card-image-wrap">
          <div class="image-placeholder" id="${imgId}" style="--aspect-ratio: 1.6;" aria-label="${item.title} image placeholder" role="img">
            <div class="placeholder-overlay">
              <span class="placeholder-icon-large">${item.icon}</span>
              <span class="placeholder-label">[ ${item.title} ]</span>
            </div>
          </div>
        </div>
        <div class="grid-card-content">
          <div class="grid-card-header">
            <div class="grid-card-icon" aria-hidden="true">${item.icon}</div>
            <h3 class="grid-card-title">${item.title}</h3>
          </div>
          <p class="grid-card-desc">${item.description}</p>
        </div>
      `;

      container.appendChild(card);
      injectImage(imgId, { url: item.image, alt: item.title, objectPosition: 'center center' });
    });
  }

  /**
   * Render Student Life Section
   */
  function renderStudentLife() {
    const slData = facilitiesData.studentLife;
    const titleEl = document.getElementById('student-life-title');
    const descEl = document.getElementById('student-life-desc');
    const cardContainer = document.getElementById('student-life-cards');

    if (titleEl) titleEl.textContent = slData.headline;
    if (descEl) descEl.textContent = slData.description;

    // Inject image
    injectImage('student-life-img-container', slData.image);

    if (cardContainer) {
      cardContainer.innerHTML = '';
      slData.cards.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = `life-card reveal reveal-stagger`;
        cardEl.innerHTML = `
          <div class="life-card-icon" aria-hidden="true">${card.icon}</div>
          <div class="life-card-text">
            <h3 class="life-card-title">${card.title}</h3>
            <p class="life-card-desc">${card.description}</p>
          </div>
        `;
        cardContainer.appendChild(cardEl);
      });
    }
  }

  /**
   * Render Safety Blocks
   */
  function renderSafety() {
    const container = document.getElementById('safety-blocks-container');
    if (!container) return;

    container.innerHTML = '';

    facilitiesData.safety.forEach((item, index) => {
      const block = document.createElement('div');
      block.className = 'safety-block reveal reveal-stagger';
      block.innerHTML = `
        <div class="safety-icon-wrap" aria-hidden="true">${item.icon}</div>
        <h3 class="safety-title">${item.title}</h3>
        <p class="safety-desc">${item.description}</p>
      `;
      container.appendChild(block);
    });
  }

  /**
   * Initialize layout and render functions
   */
  function init() {
    // Populate Hero
    const heroTitle = document.getElementById('facilities-hero-title');
    const heroDesc = document.getElementById('facilities-hero-desc');
    if (heroTitle) heroTitle.textContent = facilitiesData.hero.title;
    if (heroDesc) heroDesc.textContent = facilitiesData.hero.description;
    injectImage(facilitiesData.hero.image.id, facilitiesData.hero.image, true);

    // Populate child sections
    renderFeaturedFacilities();
    renderGridFacilities();
    renderStudentLife();
    renderSafety();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
