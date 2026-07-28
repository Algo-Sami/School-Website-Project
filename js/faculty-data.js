/* ============================================================
   FACULTY-DATA.JS — Ashraf Islamia Model Public Secondary School
   CMS-ready data layer and logic for the Faculty page.
   ============================================================ */

(function () {
  'use strict';

  const facultyData = {
    statistics: [
      {
        id: 'faculty-stat-educators',
        target: 50,
        suffix: '+',
        label: 'Dedicated Educators',
        temporary: true
      },
      {
        id: 'faculty-stat-areas',
        target: 10,
        suffix: '+',
        label: 'Academic Areas',
        temporary: true
      },
      {
        id: 'faculty-stat-experience',
        target: 15,
        suffix: '+',
        label: 'Years of Combined Experience',
        temporary: true
      },
      {
        id: 'faculty-stat-students',
        target: 1000,
        suffix: '+',
        formatComma: true,
        label: 'Students Supported',
        temporary: true
      }
    ],

    categories: [
      { id: 'ALL', label: 'All' },
      { id: 'PRIMARY', label: 'Primary' },
      { id: 'MIDDLE SCHOOL', label: 'Middle School' },
      { id: 'SECONDARY', label: 'Secondary' },
      { id: 'ADMINISTRATION', label: 'Administration' }
    ],

    members: [
      {
        id: 'faculty-001',
        name: 'Dr. Tariq Mahmood',
        role: 'Principal / Admin Lead',
        department: 'Administration',
        subject: 'Educational Leadership',
        experience: '20+ Years Experience',
        bio: 'Dedicated to fostering a premium learning environment combining traditional values with modern scientific education.',
        image: null, // Fallback placeholder
        category: 'ADMINISTRATION',
        featured: true
      },
      {
        id: 'faculty-002',
        name: 'Farhana Malik',
        role: 'Vice Principal',
        department: 'Administration',
        subject: 'Academic Administration',
        experience: '15+ Years Experience',
        bio: 'Fosters student discipline, core academic values, and curricular integrity across all school sections.',
        image: null,
        category: 'ADMINISTRATION',
        featured: false
      },
      {
        id: 'faculty-003',
        name: 'Ayesha Rahman',
        role: 'Senior Educator',
        department: 'Secondary Section',
        subject: 'English Literature',
        experience: '12+ Years Experience',
        bio: 'Inspires deep analytical reading and structural writing proficiency in preparation for board exams.',
        image: null,
        category: 'SECONDARY',
        featured: true
      },
      {
        id: 'faculty-004',
        name: 'Hassan Ahmed',
        role: 'Mathematics Educator',
        department: 'Secondary Section',
        subject: 'Advanced Mathematics',
        experience: '10+ Years Experience',
        bio: 'Promotes logical reasoning and step-by-step problem solving methods for algebraic and geometric matrices.',
        image: null,
        category: 'SECONDARY',
        featured: false
      },
      {
        id: 'faculty-005',
        name: 'Sara Khan',
        role: 'Middle School Head',
        department: 'Middle School',
        subject: 'English Language',
        experience: '8+ Years Experience',
        bio: 'Focuses on communication clarity, grammar synthesis, and confidence building in public presentation.',
        image: null,
        category: 'MIDDLE SCHOOL',
        featured: false
      },
      {
        id: 'faculty-006',
        name: 'Muhammad Hamza',
        role: 'Science Educator',
        department: 'Secondary Section',
        subject: 'Physics & Chemistry',
        experience: '9+ Years Experience',
        bio: 'Coordinates practical laboratory experiments and basic scientific research principles.',
        image: null,
        category: 'SECONDARY',
        featured: false
      },
      {
        id: 'faculty-007',
        name: 'Maryam Ali',
        role: 'Senior Primary Educator',
        department: 'Primary Section',
        subject: 'General Science & Arts',
        experience: '7+ Years Experience',
        bio: 'Creates engaging classroom activities designed to cultivate natural curiosity and collaborative habits.',
        image: null,
        category: 'PRIMARY',
        featured: false
      },
      {
        id: 'faculty-008',
        name: 'Usman Tariq',
        role: 'Computer Science Instructor',
        department: 'Secondary Section',
        subject: 'Information Technology',
        experience: '6+ Years Experience',
        bio: 'Guides pupils through computing concepts, logic design, and basic programming fundamentals.',
        image: null,
        category: 'SECONDARY',
        featured: false
      },
      {
        id: 'faculty-009',
        name: 'Zainab Fatima',
        role: 'Islamic Studies Educator',
        department: 'Middle School',
        subject: 'Islamiat & Ethics',
        experience: '11+ Years Experience',
        bio: 'Focuses on moral character, ethical principles, and civic responsibility.',
        image: null,
        category: 'MIDDLE SCHOOL',
        featured: false
      },
      {
        id: 'faculty-010',
        name: 'Bilal Yousuf',
        role: 'Primary Section Lead',
        department: 'Primary Section',
        subject: 'Social Studies & Urdu',
        experience: '8+ Years Experience',
        bio: 'Nurtures foundational reading skills, cultural appreciation, and basic social studies.',
        image: null,
        category: 'PRIMARY',
        featured: false
      }
    ]
  };

  /* -- Initial Image Setup -- */
  function initEditorialImages() {
    const heroImgContainer = document.getElementById('faculty-hero-img');
    if (heroImgContainer) {
      const img = document.createElement('img');
      img.src = 'assets/images/faculty_hero.png';
      img.alt = 'Professional school educators in a library';
      img.loading = 'eager';
      img.onerror = () => img.remove();
      heroImgContainer.appendChild(img);
    }

    const introImgContainer = document.getElementById('faculty-intro-img');
    if (introImgContainer) {
      const img = document.createElement('img');
      img.src = 'assets/images/faculty_intro.png';
      img.alt = 'Teacher helping student with notebook';
      img.loading = 'lazy';
      img.onerror = () => img.remove();
      introImgContainer.appendChild(img);
    }

    const featuredImgContainer = document.getElementById('featured-educator-img');
    if (featuredImgContainer) {
      const img = document.createElement('img');
      img.src = 'assets/images/featured_educator.png';
      img.alt = 'Senior school teacher at desk in a library';
      img.loading = 'lazy';
      img.onerror = () => img.remove();
      featuredImgContainer.appendChild(img);
    }
  }

  /* -- Render Statistics -- */
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function setLeadingText(el, value) {
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

  function animateCounter(el, stat) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const formatted = stat.formatComma ? stat.target.toLocaleString() : stat.target.toString();
    
    if (prefersReduced) {
      setLeadingText(el, formatted);
      return;
    }
    
    const duration = 1800;
    const start = performance.now();
    
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const current = Math.round(easeOutCubic(progress) * stat.target);
      const currentFormatted = stat.formatComma ? current.toLocaleString() : current.toString();
      
      setLeadingText(el, currentFormatted);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setLeadingText(el, formatted);
      }
    }
    requestAnimationFrame(step);
  }

  function initStatsAnimation() {
    const section = document.getElementById('faculty-stats');
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        facultyData.statistics.forEach((stat) => {
          const valEl = document.getElementById(stat.id);
          if (valEl) {
            animateCounter(valEl, stat);
          }
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    observer.observe(section);
  }

  /* -- Directory Rendering & Filtering -- */
  let activeCategory = 'ALL';

  function getInitials(name) {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  function renderDirectory() {
    const grid = document.getElementById('faculty-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const filtered = facultyData.members.filter(member => {
      return activeCategory === 'ALL' || member.category === activeCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="directory-empty-state reveal">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p class="empty-text">No faculty members are currently listed in this category.</p>
        </div>
      `;
      // Trigger reveal animation for the empty state
      setTimeout(() => {
        const emptyStateEl = grid.querySelector('.directory-empty-state');
        if (emptyStateEl) emptyStateEl.classList.add('visible');
      }, 50);
      return;
    }

    filtered.forEach((member, idx) => {
      const card = document.createElement('div');
      card.className = 'faculty-card reveal reveal-stagger';
      card.setAttribute('role', 'listitem');
      
      // Image portrait block: uses portrait if available, else builds initial-monogram placeholder
      let portraitHTML = '';
      if (member.image) {
        portraitHTML = `
          <div class="card-portrait">
            <img src="${member.image}" alt="${member.name} Portrait" loading="lazy" />
          </div>
        `;
      } else {
        const initials = getInitials(member.name);
        portraitHTML = `
          <div class="card-portrait is-placeholder">
            <div class="portrait-initials">${initials}</div>
          </div>
        `;
      }

      card.innerHTML = `
        ${portraitHTML}
        <div class="card-details">
          <h3 class="member-name">${member.name}</h3>
          <p class="member-role">${member.role}</p>
          <div class="card-accent-line"></div>
          <p class="member-subject">${member.subject}</p>
          <p class="member-exp">${member.experience}</p>
          <p class="member-bio">${member.bio}</p>
        </div>
      `;

      grid.appendChild(card);

      // Stagger animation reveal
      setTimeout(() => {
        card.classList.add('visible');
      }, idx * 60 + 50);
    });
  }

  function renderCategoryFilters() {
    const filterContainer = document.getElementById('category-filter-container');
    if (!filterContainer) return;

    filterContainer.innerHTML = '';

    facultyData.categories.forEach(cat => {
      const button = document.createElement('button');
      button.className = `filter-chip ${activeCategory === cat.id ? 'is-active' : ''}`;
      button.type = 'button';
      button.textContent = cat.label;
      button.setAttribute('aria-pressed', activeCategory === cat.id ? 'true' : 'false');
      button.setAttribute('data-category', cat.id);

      button.addEventListener('click', () => {
        if (activeCategory === cat.id) return;
        
        // Update active class
        filterContainer.querySelectorAll('.filter-chip').forEach(btn => {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');

        activeCategory = cat.id;
        renderDirectory();
      });

      filterContainer.appendChild(button);
    });
  }

  function init() {
    initEditorialImages();
    initStatsAnimation();
    renderCategoryFilters();
    renderDirectory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
