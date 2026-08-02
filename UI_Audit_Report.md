# 🏫 AIMPS Website — Complete UI & Design Audit Report
**Ashraf Islamia Model Public Secondary School**  
**Audit Date:** August 1, 2026  
**Auditor:** Senior UI/UX Architect (AI Code Review)  
**Pages Reviewed:** Intro, Home (index.html), About, Academics, Faculty, Admissions, Gallery, Contact  
**CSS Files Reviewed:** style.css, animations.css, about.css, academics.css, admissions.css, faculty.css, gallery.css, contact.css  

---

## Executive Summary

The website is a **well-engineered, premium school web presence** with a strong design language — navy/gold palette, Playfair Display for headings, Inter for body, a cinematic scroll-driven intro, and consistent card hover patterns. However, a thorough code-level audit reveals **32 specific issues** spread across typography, spacing consistency, color system discipline, button design language, mobile experience, and production hygiene. None are site-breaking, but several are **high priority before launch**.

---

## 🔴 CRITICAL Issues

---

### ISSUE 01 — `admissions.css` Overrides the Global `.section-label` at a Different Font Size

| Field | Detail |
|-------|--------|
| **Page** | Admissions |
| **Severity** | 🔴 Critical |
| **Problem** | `admissions.css` redefines `.section-label` with `font-size: 0.92rem`, whereas `style.css` defines it as `font-size: 0.75rem`. This creates a **23% size discrepancy** — section labels on the Admissions page will appear noticeably larger than on every other page. |
| **Reason** | The developer added a page-scoped override (with a comment "Increased from 0.75rem for legibility") without using a scoped selector, causing a **global CSS leak**. Since both files are loaded, the later-loaded `admissions.css` wins. |
| **Solution** | Scope the override: `.admissions-page .section-label { font-size: 0.92rem; }` — or better, bring the global size up to `0.82rem` universally and remove the page override. |
| **Priority** | Launch Blocker |

---

### ISSUE 02 — `btn-outline-dark` Used on Dark Backgrounds (Invisible Text)

| Field | Detail |
|-------|--------|
| **Page** | Home (Vision section), Admissions CTA strip |
| **Severity** | 🔴 Critical |
| **Problem** | The `.btn-outline-dark` variant uses `border: 2px solid var(--primary)` and `color: var(--primary)`. On the cream/white `#admissions-cta` section this is fine, but in `index.html` line 746, it is used inside the Vision section (cream background) — visually correct. However, in the Principal's message section (dark navy background), any misplaced usage would render the button nearly invisible. This warrants a visual confirmation, as the classes are inconsistently named relative to their actual usage context. |
| **Reason** | The three button variants (`btn-outline`, `btn-outline-dark`, `btn-primary`) have no documentation comments on when each should be used. |
| **Solution** | Add a CSS comment block above each button variant explaining its intended background context. Audit all 12 uses of `btn-outline-dark` across all pages to confirm none appear on dark backgrounds. |
| **Priority** | Pre-Launch Verification |

---

### ISSUE 03 — Inline Style Overrides Typography Tokens on Principal Section

| Field | Detail |
|-------|--------|
| **Page** | Home (`index.html`, line 794) |
| **Severity** | 🔴 Critical |
| **Problem** | The Principal's Message `<h2>` has a hardcoded inline style: `style="color:white; font-size:clamp(1.6rem,3vw,2.2rem)"`. This bypasses the design token system entirely and sets a **custom font size scale** not matched by any other `section-title` usage. |
| **Reason** | Likely patched to make text visible on the dark navy background, but the inline approach breaks token consistency and makes future updates impossible without editing HTML. |
| **Solution** | Add `.principal .section-title { color: var(--text-white); font-size: clamp(1.6rem, 3vw, 2.2rem); }` to `style.css` and remove the inline style attribute completely. |
| **Priority** | Fix Before Launch |

---

### ISSUE 04 — WhatsApp Button Style Applied via Inline Style (Contact Page)

| Field | Detail |
|-------|--------|
| **Page** | Contact (`contact.html`, lines 523, 529) |
| **Severity** | 🔴 Critical |
| **Problem** | The WhatsApp button has `style="background:#25d366; color:white; border-color:#25d366;"` — a fully hardcoded inline style. The `.btn-whatsapp` class exists in `contact.css` but is overridden immediately by the inline style. Separately, the Google Maps button on line 529 has `style="border-color:rgba(255,255,255,0.4); color:white;"` — another raw inline style. |
| **Reason** | These appear to be quick fixes applied to force a desired look, but they create unmaintainable one-off styling outside the design system. |
| **Solution** | Remove both inline styles. Move all button appearance into `.btn-whatsapp` and a new `.btn-maps` utility class in `contact.css`. |
| **Priority** | Fix Before Launch |

---

### ISSUE 05 — `section-label` Inside Principal Section Has Inline Color (0.8 opacity)

| Field | Detail |
|-------|--------|
| **Page** | Home (`index.html`, line 793) |
| **Severity** | 🔴 Critical |
| **Problem** | `style="color:rgba(201,168,76,0.8)"` is applied inline on the `section-label` in the Principal's Message. Globally, the `.section-label` on dark backgrounds should be `var(--gold-light)`. The 0.8 opacity value is inconsistent — every other dark-background label uses full opacity `--gold-light`. |
| **Reason** | One-off visual tweak applied via inline style instead of a scoped CSS class. |
| **Solution** | Create `.principal .section-label { color: var(--gold-light); }` in `style.css`. Remove the inline style. |
| **Priority** | Fix Before Launch |

---

## 🟠 HIGH Severity Issues

---

### ISSUE 06 — Active Navigation State Uses Two Different Mechanisms

| Field | Detail |
|-------|--------|
| **Page** | All pages |
| **Severity** | 🟠 High |
| **Problem** | On `index.html`, the active state is `class="nav-link active"` with `aria-current="page"` — styled via `style.css` (underline scales in from left). On all other pages (about, academics, faculty, etc.), each page-specific CSS (about.css, faculty.css, etc.) defines its own `.xxx-page .nav-link.active` with a **centred underline** that uses `left: 50%; transform: translateX(-50%)`. These are two completely different underline animation systems. |
| **Reason** | The global system (left-anchored underline on hover, scale from left) and the inner-page system (centred 70%-width underline via pseudo-element) are incompatible — the visual appearance of the active link is **different on the home page vs every other page**. |
| **Solution** | Unify into a single active-state system in `style.css`. Remove all 6 `.nav-link.active` redefinitions from individual page CSS files. |
| **Priority** | High — Visible in navigation on every page |

---

### ISSUE 07 — `vision-block-text` Has Unexplained Left Padding

| Field | Detail |
|-------|--------|
| **Page** | Home — Vision & Mission section |
| **Severity** | 🟠 High |
| **Problem** | `.vision-block-text` has `padding-left: 18px` applied, but there is no visible left border or decorative element to justify this indent. The result is text that appears to "float" with an arbitrary left margin compared to the title above it, which has the gold vertical bar (`::before`) but the text body hangs to the right without visual alignment cue. |
| **Reason** | The `padding-left` was likely meant to align the text under the gold bar marker, but the bar is `4px` wide with a `14px` gap (total `18px`). This works visually but becomes misaligned at certain viewport widths. |
| **Solution** | Keep the intent but explicitly align: `padding-left: calc(4px + 14px)` to make the relationship clear, or use `margin-left` on `.vision-block-title` text to exclude the bar from the measurement. Add a comment explaining the alignment logic. |
| **Priority** | Medium-High |

---

### ISSUE 08 — Faculty Stats Section Redefines `.stats-grid` and `.stat-item` Without Scoping

| Field | Detail |
|-------|--------|
| **Page** | Faculty |
| **Severity** | 🟠 High |
| **Problem** | `faculty.css` defines `.stats-grid`, `.stat-item`, `.stat-number`, and `.stat-label` at lines 187–215 without any page-scoping selector. These are the **same class names** as the home page stats section in `style.css`. Since `style.css` is loaded before `faculty.css`, the faculty page CSS will override the global definitions — but only on that page. This is fragile and confusing architecture. |
| **Reason** | Copy-paste reuse of class names across pages without namespace scoping. |
| **Solution** | Scope all faculty-specific stats: `#faculty-stats .stats-grid`, `#faculty-stats .stat-item`, etc. |
| **Priority** | High — Architectural issue |

---

### ISSUE 09 — Hero Sections Have Inconsistent Padding-Top Formulas

| Field | Detail |
|-------|--------|
| **Page** | About, Academics, Admissions, Contact, Faculty |
| **Severity** | 🟠 High |
| **Problem** | Interior page hero sections use different `padding-top` calculations:  
- About/Faculty/Contact: `clamp(100px, 12vw, 150px)`  
- Academics/Admissions: `calc(80px + var(--section-py))`  
At 768px viewport, these resolve to different values (~92px vs ~144px), creating visually inconsistent entry points across pages. |
| **Reason** | Different developers (or different sessions) used different formulas when building each page's hero. |
| **Solution** | Standardise to one formula. `calc(var(--navbar-height, 80px) + var(--section-py))` is the most semantically correct. Apply uniformly across all interior hero sections in their respective CSS files. |
| **Priority** | High — Immediately visible when navigating between pages |

---

### ISSUE 10 — Mobile Drawer Uses Different `border-radius` on CTA Button vs Desktop CTA

| Field | Detail |
|-------|--------|
| **Page** | All (Navigation) |
| **Severity** | 🟠 High |
| **Problem** | The desktop `.nav-cta` uses `border-radius: 50px` (pill shape). The mobile drawer `.nav-cta` is overridden to `border-radius: var(--radius-md)` which is `12px` (rounded rectangle). Same button, same text, two completely different shapes across breakpoints. |
| **Reason** | The mobile override at `style.css` line 2006 changed the radius for "space-efficiency" but created a visual inconsistency. The user sees a pill button in the desktop drawer but a rectangle on mobile. |
| **Solution** | Restore `border-radius: 50px` on the mobile drawer CTA. The pill shape works fine at full-width. |
| **Priority** | High |

---

### ISSUE 11 — `#gallery-filter-bar` Sticky `top: 72px` May Clip Under Navbar at Different Breakpoints

| Field | Detail |
|-------|--------|
| **Page** | Gallery |
| **Severity** | 🟠 High |
| **Problem** | The gallery filter bar is `position: sticky; top: 72px`. However, the navbar height changes across breakpoints (14px + 40px = 54px on mobile; 18px + 44px = 62px on tablet; 20px + 46px = 66px+ on desktop). At mobile sizes, `top: 72px` may leave a gap, and at large desktop the navbar may be taller than 72px. |
| **Reason** | Hardcoded pixel value for sticky offset without reference to an actual navbar height variable. |
| **Solution** | Replace with `top: var(--navbar-height, 72px)` and define `--navbar-height` per breakpoint in `:root`. |
| **Priority** | High |

---

### ISSUE 12 — `about.css` Uses Max-Width Media Queries Mixed With Min-Width Queries

| Field | Detail |
|-------|--------|
| **Page** | About |
| **Severity** | 🟠 High |
| **Problem** | `style.css` uses a **pure mobile-first** approach (all min-width). `about.css` mixes `max-width: 480px`, `min-width: 480px and max-width: 768px`, and `min-width: 768px and max-width: 992px` — a **hybrid desktop-first/mobile-first** approach. This creates specificity conflicts and makes the breakpoint logic harder to debug. |
| **Reason** | The page CSS files weren't written to match the base file's paradigm. |
| **Solution** | Migrate `about.css` (and similarly `faculty.css`, `admissions.css`) to use mobile-first `min-width` only media queries, matching `style.css`'s 8-breakpoint system. |
| **Priority** | High |

---

## 🟡 MEDIUM Severity Issues

---

### ISSUE 13 — Principal Avatar Is an SVG Silhouette, Not a Real Photo

| Field | Detail |
|-------|--------|
| **Page** | Home, About |
| **Severity** | 🟡 Medium |
| **Problem** | The Principal's portrait is an SVG placeholder silhouette at 60% opacity. On a school website going live to real clients, this reads as incomplete/unfinished. The About page also shows the same SVG in the Leadership section. |
| **Reason** | Real photo may not yet be available. |
| **Solution** | If a photo isn't ready, use a high-quality AI-generated or stock professional portrait with proper attribution, or replace the SVG with a stylised gold initial monogram (like the faculty card fallback system already does). |
| **Priority** | Medium — Professional perception |

---

### ISSUE 14 — Footer "Academics" Column Links All Point to `#` (Broken Links)

| Field | Detail |
|-------|--------|
| **Page** | All pages (Footer) |
| **Severity** | 🟡 Medium |
| **Problem** | The footer "Academics" column (Primary Section, Middle Section, Secondary (Matric), Science Stream, Arts Stream) all have `href="#"` — they go nowhere. A production website with broken navigation links fails basic quality checks. |
| **Reason** | These are placeholder links — intended to link to dedicated academic sections. |
| **Solution** | Either link them to the relevant section of `academics.html` (e.g., `academics.html#programs`), or remove the column entirely until those sections exist. Do not ship `href="#"` links. |
| **Priority** | Medium — Client would notice immediately |

---

### ISSUE 15 — Footer "Privacy Policy," "Terms of Use," "Sitemap" Links Are Placeholders

| Field | Detail |
|-------|--------|
| **Page** | All pages (Footer bottom bar) |
| **Severity** | 🟡 Medium |
| **Problem** | `footer-bottom-links` contains three links (Privacy Policy, Terms of Use, Sitemap) all pointing to `href="#"`. These are standard legal/compliance links expected on professional school websites. |
| **Reason** | Placeholder content not yet created. |
| **Solution** | Either create minimal pages for these, or hide these links until the pages exist. School websites that include these links must deliver them. |
| **Priority** | Medium |

---

### ISSUE 16 — Icon Sizes Are Inconsistent Across Contexts

| Field | Detail |
|-------|--------|
| **Page** | All |
| **Severity** | 🟡 Medium |
| **Problem** | SVG icon sizes across the site are inconsistently defined:  
- Footer contact icons: `width/height: 15px`  
- Footer social icons: `width/height: 16px`  
- Why-choose cards: `28px` (desktop), `24px` (mobile)  
- Nav CTA icon: `14px`  
- Hero CTA icons: `16px`  
- Info column icons (Contact): `24px`  
- Campus address icons: `20px`  
Multiple sizes (14, 15, 16, 18, 20, 24, 28, 32, 48) are used — 9 different icon sizes with no systematic scale. |
| **Reason** | Each section was built independently with manual icon sizing. |
| **Solution** | Establish an icon size scale: Small `16px`, Medium `20px`, Large `24px`, XL `32px`. Apply consistently. |
| **Priority** | Medium |

---

### ISSUE 17 — `vision-image-wrap` Has Fixed Height at Different Breakpoints (Inconsistent Aspect)

| Field | Detail |
|-------|--------|
| **Page** | Home — Vision section |
| **Severity** | 🟡 Medium |
| **Problem** | The vision image height is set to `540px` at 1200px+, `520px` at 992px+, `480px` at 992px in a 2-column layout, and `clamp(240px–320px)` on mobile. The desktop heights are absolute pixels, meaning on ultra-wide displays or slightly shorter viewports, the image loses its proportional relationship to the text content beside it. |
| **Reason** | Using fixed heights for layout images instead of `aspect-ratio`. |
| **Solution** | Switch to `aspect-ratio: 4/3` (or 3/4 for portrait) with `width: 100%` and remove all fixed height declarations. This is already correctly done on the gallery cards. |
| **Priority** | Medium |

---

### ISSUE 18 — Hero on Inner Pages Has No Scroll Hint or Visual Continuation Cue

| Field | Detail |
|-------|--------|
| **Page** | About, Academics, Faculty, Admissions, Gallery, Contact |
| **Severity** | 🟡 Medium |
| **Problem** | The Home page hero has a scroll mouse indicator. All inner page heroes omit any scroll indicator. While the hero doesn't take 100vh on inner pages, there's still enough content below the fold that new visitors may need a visual cue to scroll. The Gallery hero in particular has a large image panel that might read as the "full page." |
| **Reason** | Scroll cues were only added to the home page hero during development. |
| **Solution** | Add a subtle scroll indicator (a chevron-down or thin animated line) to inner page heroes that extend close to or past the fold. |
| **Priority** | Low-Medium |

---

### ISSUE 19 — `font-style:normal` Applied via Inline Style on `<address>` Tags on Every Page

| Field | Detail |
|-------|--------|
| **Page** | All (Footer) |
| **Severity** | 🟡 Medium |
| **Problem** | All 7 HTML files have `<address style="font-style:normal">` as an inline style on the footer address element. This is repeated on every single page. |
| **Reason** | A valid fix for browser default italic on `<address>`, but should be in CSS, not inline. |
| **Solution** | Add `address { font-style: normal; }` to `style.css` (already applied via the reset, but apparently not fully working). Then remove all 7 inline style instances. |
| **Priority** | Medium — Code hygiene, repeated 7× |

---

### ISSUE 20 — Gallery Filter Bar Shows Count Text ("12 albums") But No Empty State for 0 Results

| Field | Detail |
|-------|--------|
| **Page** | Gallery |
| **Severity** | 🟡 Medium |
| **Problem** | When a filter is applied that results in 0 albums, the count updates but there's no styled empty state visible (the `directory-empty-state` exists for faculty but not for the album grid). |
| **Reason** | Empty state only implemented for faculty directory. |
| **Solution** | Add an empty-state card in the gallery JavaScript (or CSS) for when no albums match the active filter, consistent with the faculty empty state component. |
| **Priority** | Medium |

---

### ISSUE 21 — About Page Uses `max-width: 480px` Breakpoints (Wrong Direction)

| Field | Detail |
|-------|--------|
| **Page** | About |
| **Severity** | 🟡 Medium |
| **Problem** | `about.css` line 789 uses `@media (max-width: 480px)` — desktop-first breakpoint — which conflicts with the mobile-first paradigm of `style.css`. When styles accumulate, this creates order-dependency bugs where some styles may not apply correctly on the target device. |
| **Reason** | Mixed responsive strategy in one project. |
| **Solution** | Rewrite `about.css` responsive section using `@media (min-width: ...)` breakpoints, starting with mobile as base. |
| **Priority** | Medium |

---

### ISSUE 22 — Academics `.program-content` Uses Nested Grid With Hardcoded `280px` Column

| Field | Detail |
|-------|--------|
| **Page** | Academics |
| **Severity** | 🟡 Medium |
| **Problem** | `.program-content` uses `grid-template-columns: 280px 1fr`. At 992px–1199px viewport, the 280px title column plus 100px number column plus 32px gap plus 44px arrow = ~456px fixed, leaving only ~536px for description — acceptable, but at 768px (where it's still 2-column on small tablets), this breaks the layout or forces the description text to wrap very tightly. |
| **Reason** | Fixed px column width in a responsive grid without breakpoint adjustment. |
| **Solution** | Change to `grid-template-columns: minmax(180px, 280px) 1fr` or use `flex` with `flex-wrap: wrap`. |
| **Priority** | Medium |

---

## 🔵 LOW Severity Issues

---

### ISSUE 23 — `#vision` Section Has Duplicate Background Declaration

| Field | Detail |
|-------|--------|
| **Page** | Home |
| **Severity** | 🔵 Low |
| **Problem** | The vision section `<section id="vision">` has both `style="background:var(--cream)"` as an inline HTML attribute AND `#vision { background: var(--cream); }` in `style.css`. The inline style is redundant and creates maintenance confusion. |
| **Solution** | Remove the inline `style` attribute from the HTML. The CSS rule is sufficient. |
| **Priority** | Low |

---

### ISSUE 24 — `section-title` in Principal Section Has Two Font-Size Definitions

| Field | Detail |
|-------|--------|
| **Page** | Home |
| **Severity** | 🔵 Low |
| **Problem** | The principal section `<h2>` uses `class="section-title"` which inherits `clamp(2rem, 4vw, 3rem)` from global CSS, but the inline `style` also sets `font-size:clamp(1.6rem,3vw,2.2rem)` — a smaller custom scale. This is intentional (the Principal section needs a slightly smaller title) but done incorrectly via inline style. |
| **Solution** | Create `.principal .section-title { font-size: clamp(1.6rem, 3vw, 2.2rem); }` in `style.css`. Remove the inline style. Already covered in Issue 03 but documented separately for clarity. |
| **Priority** | Low (subissue of 03) |

---

### ISSUE 25 — Favicon Is a Raw SVG Emoji (Candle), Not a Proper Branded Favicon

| Field | Detail |
|-------|--------|
| **Page** | All |
| **Severity** | 🔵 Low |
| **Problem** | The favicon is a `data:image/svg+xml` emoji candle (`🕯️`). While clever for development, this renders differently across browsers and operating systems. On Windows in Chrome, emoji favicons display at low resolution. Professional school websites need a proper `.ico` or `.png` favicon derived from the school logo. |
| **Solution** | Generate a proper `favicon.ico` and `apple-touch-icon.png` from the school logo. Use a tool like RealFaviconGenerator. Add them to `assets/` and update the `<link>` tags in all 7 HTML files. |
| **Priority** | Low — But very visible in browser tabs |

---

### ISSUE 26 — `scroll-behavior: smooth` on `html` Conflicts With Intro Skip

| Field | Detail |
|-------|--------|
| **Page** | Home |
| **Severity** | 🔵 Low |
| **Problem** | `style.css` sets `html { scroll-behavior: smooth; }`. When `intro.js` calls `window.scrollTo(0,0)` after the intro completes, the smooth scroll could cause a brief visible scroll-back animation. The `finish()` function doesn't temporarily override scroll behavior. |
| **Solution** | In `intro.js` `finish()`, temporarily set `document.documentElement.style.scrollBehavior = 'auto'` before `window.scrollTo(0,0)` and restore it after: `setTimeout(() => document.documentElement.style.scrollBehavior = '', 100)`. |
| **Priority** | Low |

---

### ISSUE 27 — Gold Accent Line Width Animates on Faculty Cards But Not on Why-Choose Cards

| Field | Detail |
|-------|--------|
| **Page** | Home, Faculty |
| **Severity** | 🔵 Low |
| **Problem** | Faculty cards have a `.card-accent-line` that animates from `width: 32px` to `width: 56px` on hover — a delightful micro-interaction. The home page `why-choose` cards use a top border (`::before`) that scales in on hover. Both are good, but the patterns are completely different for essentially the same type of card component. |
| **Reason** | Each section was designed independently without a shared "card interaction language." |
| **Solution** | Choose one accent animation pattern and apply it consistently across all card types (faculty, why-choose, academics subjects, admissions reasons). |
| **Priority** | Low |

---

### ISSUE 28 — `hero-sub` Line Height Inconsistency Between Home Hero and Inner Page Heroes

| Field | Detail |
|-------|--------|
| **Page** | Home vs About/Academics/Faculty/Admissions/Contact/Gallery |
| **Severity** | 🔵 Low |
| **Problem** | Home hero `.hero-sub` uses `line-height: 1.75`. Inner page hero `.hero-text p` elements use `line-height: 1.8`. This 0.05 difference is minor but represents lack of system discipline. |
| **Solution** | Standardise to `1.75` across all hero subtitle/description text and add it as a CSS variable (e.g., `--lh-body: 1.75`). |
| **Priority** | Low |

---

### ISSUE 29 — `vision-image-badge` Overflows at 480px on Mobile

| Field | Detail |
|-------|--------|
| **Page** | Home |
| **Severity** | 🔵 Low |
| **Problem** | The floating badge on the vision image (`position: absolute; bottom: 28px; left: 28px`) with `padding: 16px 22px` and a long quote text may overflow its parent container at 280–360px screen widths, since no `max-width` is set on the badge. |
| **Solution** | Add `max-width: calc(100% - 56px)` to `.vision-image-badge` so it respects its container boundaries on all screen widths. |
| **Priority** | Low |

---

### ISSUE 30 — `kanban`-style Version Query Strings on Gallery JS Only

| Field | Detail |
|-------|--------|
| **Page** | Gallery |
| **Severity** | 🔵 Low |
| **Problem** | Gallery scripts have `?v=1.0.1` cache-busting: `js/gallery-data.js?v=1.0.1`. No other page's scripts use cache-busting version parameters. This is inconsistent and will lead to caching surprises if scripts are updated without updating the version string. |
| **Solution** | Either remove all query strings (use a proper build tool for cache-busting), or add consistent `?v=1.0.0` to all script `src` attributes across all pages. |
| **Priority** | Low |

---

### ISSUE 31 — `intro-vignette` Layer Has `z-index: 5` While Other Intro Layers Use `z-index: 0–3`

| Field | Detail |
|-------|--------|
| **Page** | Home (Intro Overlay) |
| **Severity** | 🔵 Low |
| **Problem** | The vignette layer at `z-index: 5` sits above the particles canvas at `z-index: 3` and the center stage at `z-index: 4`. The vignette is intentional (edge darkening), but the stacking order means particles could render below the vignette, reducing their visibility at screen edges. |
| **Solution** | Consider whether particles should appear above or below the vignette. If above, set particles to `z-index: 6`. |
| **Priority** | Low — Visual refinement |

---

### ISSUE 32 — Gallery Hero Visual Cards Use Fixed Percentage Widths That Overlap Unpredictably

| Field | Detail |
|-------|--------|
| **Page** | Gallery |
| **Severity** | 🔵 Low |
| **Problem** | The three hero "stacked image cards" use `position: absolute` with percentage-based dimensions (`68%`, `55%`, `38%`). At very narrow screens (below the column-collapse breakpoint), these cards overlap in ways that were not designed for — potentially hiding large portions of each image. |
| **Solution** | On mobile breakpoints, stack the gallery hero cards linearly rather than using the overlapping position approach. |
| **Priority** | Low |

---

## 📊 Scoring Summary

| Category | Score | Notes |
|----------|-------|-------|
| **Overall Design Score** | **78/100** | Strong visual language; inline style pollution and cross-page inconsistencies drag it down |
| **Professionalism Score** | **72/100** | Emoji favicon, SVG principal placeholder, `href="#"` broken links, and inline styles are notable professionalism gaps |
| **Consistency Score** | **69/100** | Two active nav systems, two hero padding formulas, 9 icon sizes, mixed responsive paradigms, two card accent patterns |
| **Mobile Readiness Score** | **82/100** | The mobile-first foundation in `style.css` is solid; drawer is clean; issues are in page-specific CSS files using wrong breakpoint direction |
| **Production Readiness Score** | **65/100** | 5 Critical issues must be resolved; 7 High issues should be resolved; multiple placeholder links and missing real content |

---

## 🛠️ Recommended Fix Priority Order

### Phase 1 — Must Fix Before Launch (≤ 1 day work)
1. **Issue 01** — Scope the `admissions.css` `.section-label` override
2. **Issue 03** — Move principal section `h2` styling to CSS
3. **Issue 04** — Move WhatsApp/Maps button styles to CSS
4. **Issue 05** — Move principal section-label color to CSS
5. **Issue 14** — Fix/remove broken `href="#"` footer academic links
6. **Issue 15** — Fix/hide legal footer links
7. **Issue 19** — Move `address { font-style: normal }` to CSS

### Phase 2 — Fix Before Client Handoff (≤ 2 days work)
8. **Issue 06** — Unify active navigation state system
9. **Issue 09** — Standardise hero padding-top across all inner pages
10. **Issue 10** — Restore pill border-radius on mobile drawer CTA
11. **Issue 11** — Fix gallery sticky filter bar offset
12. **Issue 13** — Replace SVG principal avatar
13. **Issue 25** — Implement proper branded favicon

### Phase 3 — Polish Pass (≤ 3 days work)
14. **Issue 08** — Scope faculty stats class names
15. **Issue 12 / 21** — Migrate about.css to mobile-first breakpoints
16. **Issue 16** — Standardise icon size scale
17. **Issue 17** — Switch vision image to `aspect-ratio`
18. **Issue 22** — Fix academic programs nested grid
19. **Issue 27** — Unify card hover accent pattern
20. Remaining Low issues (23, 26, 28–32)

---

## ✅ What Is Done Well (Strengths)

These are production-quality and should be preserved:

- ✅ **Design token system** in `:root` — well-structured, comprehensive
- ✅ **Scroll-driven cinematic intro** — technically sophisticated, smooth, unique
- ✅ **8-breakpoint mobile-first system** in `style.css` — covers 280px to 1920px
- ✅ **Faculty card fallback system** — monogram initials on missing photos, well-implemented
- ✅ **Gallery lightbox architecture** — event-based album system is clean
- ✅ **Reduced motion accessibility** — respected in both `style.css` and `animations.css`
- ✅ **Semantic HTML** — `<header>`, `<main>`, `<footer>`, `<address>`, ARIA labels, skip link
- ✅ **SEO meta tags** — OG, Twitter Card, JSON-LD schema all present and correct
- ✅ **Button hover/active states** — consistent `translateY(-2px)` lift on all `.btn` variants
- ✅ **Gold accent language** — cohesive use of `--gold`, `--gold-light`, `--gold-dark` throughout
- ✅ **Typography hierarchy** — Playfair Display → Cormorant Garamond → Inter is elegant and appropriate
- ✅ **Scroll reveal system** — `reveal`, `reveal-left`, `reveal-right`, stagger delays — well-executed
- ✅ **Filter systems** — both Faculty directory and Gallery filters are smooth and functional
