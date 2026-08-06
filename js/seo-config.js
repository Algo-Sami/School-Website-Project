/* ============================================================
   SEO-CONFIG.JS — Centralized SEO Configuration
   Ashraf Islamia Model Public School
   ============================================================
   ADMIN PANEL READY: All metadata is structured for easy
   dynamic injection by a future CMS or Admin Panel.

   DOMAIN CONFIGURATION:
   ──────────────────────────────────────────────────────────
   When the production domain goes live, update BASE_URL below.
   This is the ONLY value that needs to change for all
   canonical and OG URL tags to update site-wide.
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────
     SINGLE SOURCE OF TRUTH — Change this ONE value when
     the production domain is connected.
  ────────────────────────────────────────────────────── */
  var BASE_URL = 'https://www.aimpschool.com';

  /* ── School Identity ──────────────────────────────── */
  var SCHOOL = {
    name:         'Ashraf Islamia Model Public School',
    nameFull:     'Ashraf Islamia Model Public Secondary School',
    abbreviation: 'AIMPS',
    location:     'Mirza, Attock, Punjab, Pakistan',
    phone:        '+923324445969',
    email:        'ashrafislamia67@gmail.com',
    facebook:     'https://www.facebook.com/share/1FzfXFNtSC/',
    youtube:      'https://youtube.com/@ashrafislamia1575',
    logo:         BASE_URL + '/assets/images/school_logo.jpg',
    defaultImage: BASE_URL + '/assets/images/hero_building.png'
  };

  /* ── Per-Page SEO Metadata ────────────────────────── */
  var PAGES = {
    '/': {
      path:            '/',
      title:           SCHOOL.name + ' | Excellence in Education',
      description:     'Discover ' + SCHOOL.nameFull + ' (AIMPS) in Mirza, Attock. Offering premier education, moral character development, and academic success for students across Punjab.',
      ogImage:         BASE_URL + '/assets/images/hero_building.png',
      ogImageAlt:      'Ashraf Islamia Model Public School campus building in Mirza, Attock',
      breadcrumb:      null
    },
    '/about': {
      path:            '/about',
      title:           'About Us | ' + SCHOOL.name,
      description:     'Learn about the history, mission, values, and leadership of Ashraf Islamia Model Public School — a trusted institution of learning in Mirza, Attock since 1994.',
      ogImage:         BASE_URL + '/assets/images/hero_building.png',
      ogImageAlt:      'Students and faculty of Ashraf Islamia Model Public School',
      breadcrumb:      [{ name: 'Home', path: '/' }, { name: 'About Us', path: '/about' }]
    },
    '/facilities': {
      path:            '/facilities',
      title:           'School Facilities | ' + SCHOOL.name,
      description:     'Explore the modern campus and facilities of Ashraf Islamia Model Public School. Science labs, computer labs, library, safe campus environment, and student spaces in Mirza, Attock.',
      ogImage:         BASE_URL + '/assets/images/hero_building.png',
      ogImageAlt:      'Modern facilities and campus of Ashraf Islamia Model Public School',
      breadcrumb:      [{ name: 'Home', path: '/' }, { name: 'Facilities', path: '/facilities' }]
    },
    '/faculty': {
      path:            '/faculty',
      title:           'Our Faculty | ' + SCHOOL.name,
      description:     'Meet the dedicated educators and academic staff of Ashraf Islamia Model Public School — trained mentors committed to nurturing the next generation of leaders in Attock.',
      ogImage:         BASE_URL + '/assets/images/faculty_hero.png',
      ogImageAlt:      'Educators and faculty of Ashraf Islamia Model Public School',
      breadcrumb:      [{ name: 'Home', path: '/' }, { name: 'Faculty', path: '/faculty' }]
    },
    '/gallery': {
      path:            '/gallery',
      title:           'School Gallery | ' + SCHOOL.name,
      description:     'Browse photos and videos from Ashraf Islamia Model Public School — capturing moments from academic events, sports days, annual functions, and school life in Attock.',
      ogImage:         BASE_URL + '/assets/images/hero_campus.png',
      ogImageAlt:      'School events and activities at Ashraf Islamia Model Public School',
      breadcrumb:      [{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }]
    },
    '/admissions': {
      path:            '/admissions',
      title:           'Admissions | ' + SCHOOL.name,
      description:     'Apply to Ashraf Islamia Model Public School in Mirza, Attock. Learn about our admission process, eligibility criteria, required documents, and how to enroll your child.',
      ogImage:         BASE_URL + '/assets/images/admissions_hero.png',
      ogImageAlt:      'Students beginning their journey at Ashraf Islamia Model Public School',
      breadcrumb:      [{ name: 'Home', path: '/' }, { name: 'Admissions', path: '/admissions' }]
    },
    '/contact': {
      path:            '/contact',
      title:           'Contact Us | ' + SCHOOL.name,
      description:     'Get in touch with Ashraf Islamia Model Public School in Mirza, Attock. Find our address, phone number, school hours, and directions to campus.',
      ogImage:         BASE_URL + '/assets/images/hero_building.png',
      ogImageAlt:      'Ashraf Islamia Model Public School campus location in Mirza, Attock',
      breadcrumb:      [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]
    }
  };

  /* ── Runtime Canonical & OG URL Updater ──────────── */
  function applyPageConfig() {
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    var page = PAGES[path];
    if (!page) return;

    var fullUrl = BASE_URL + page.path;

    /* Update <link rel="canonical"> */
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', fullUrl === BASE_URL ? fullUrl + '/' : fullUrl);

    /* Update <meta property="og:url"> */
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', fullUrl === BASE_URL ? fullUrl + '/' : fullUrl);
  }

  /* ── Expose config for Admin Panel / future CMS ── */
  window.SITE_SEO = {
    BASE_URL:  BASE_URL,
    SCHOOL:    SCHOOL,
    PAGES:     PAGES,
    getPageUrl: function (path) { return BASE_URL + (path || '/'); }
  };

  /* ── Init ──────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyPageConfig);
  } else {
    applyPageConfig();
  }

})();
