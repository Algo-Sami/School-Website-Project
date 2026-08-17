/**
 * gallery-data.js — Centralized Gallery Configuration & Categories
 * Ashraf Islamia Model Public Secondary School
 *
 * ARCHITECTURE NOTE:
 * Gallery events are dynamically managed and fetched from the backend database (/api/events).
 * Category definitions are maintained here.
 */

/* ───────────────────────────────────────────────────────────────
   CATEGORY DEFINITIONS
   ─────────────────────────────────────────────────────────────── */

const GALLERY_CATEGORIES = [
  { id: 'all',          label: 'All Events' },
  { id: 'events',       label: 'Events'     },
  { id: 'sports',       label: 'Sports'     },
  { id: 'celebrations', label: 'Celebrations' },
  { id: 'academic',     label: 'Academic'   },
];

/* ───────────────────────────────────────────────────────────────
   EXPORT (accessible globally)
   ─────────────────────────────────────────────────────────────── */

window.GALLERY_EVENTS     = window.GALLERY_EVENTS || [];
window.GALLERY_CATEGORIES = GALLERY_CATEGORIES;
