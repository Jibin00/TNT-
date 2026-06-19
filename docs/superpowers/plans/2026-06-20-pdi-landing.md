# PDI + Transport Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page landing site for a PDI + car-transportation business, with a customer-facing workflow for reviewing a PDI video and submitting an approve/reject decision (stubbed to localStorage).

**Architecture:** Three static files — `index.html` (markup), `style.css` (styles, CSS variables for the design tokens), `script.js` (interactivity). No build step, no framework, no npm dependencies. Browser-only.

**Tech Stack:** Plain HTML5 + CSS3 + vanilla ES2020 JS. Inter font via Google Fonts CDN. Hero photo via Unsplash. Sample PDI video via `commondatastorage.googleapis.com`. All icons as inline SVG.

**Spec:** `docs/superpowers/specs/2026-06-20-pdi-landing-design.md`

**Verification strategy:** No unit test framework (over-engineering for a static page). Each task ends with a manual browser verification step that has clear pass/fail criteria. Final task runs the full verification plan from the spec.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | Single-page markup, 10 semantic sections, all content |
| `style.css` | CSS reset, design-token variables, layout + component styles, responsive breakpoints |
| `script.js` | Pure helpers (validation, reference generation) + DOM glue (booking flow, form submit, FAQ accordion, mobile menu) |
| `docs/superpowers/specs/2026-06-20-pdi-landing-design.md` | Source of truth (already written) |
| `docs/superpowers/plans/2026-06-20-pdi-landing.md` | This file |

Section IDs in `index.html`:
- `#top` — header anchor
- `#process` — section 4
- `#coverage` — section 5
- `#review` — section 6 (the workflow)
- `#reviews` — section 7
- `#faq` — section 8
- `#book` — section 9 (final CTA / contact card)

---

## Task 1: Project skeleton + design tokens

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `script.js`

- [ ] **Step 1: Create `index.html` with the 10 section landmarks and the asset links**

Open `index.html` and write the following. The body has all 10 `<section>` elements in order with stable ids; everything inside is empty for now — later tasks fill them in.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>INSPECT&GO — Pre-delivery inspection + car transport</title>
  <meta name="description" content="300-point pre-delivery inspection and door-to-door car transport. Booked in 60 seconds." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <a class="skip-link" href="#review">Skip to review your PDI</a>

  <header class="site-header" id="top">
    <!-- Filled in Task 2 -->
  </header>

  <main>
    <section class="hero" id="hero"><!-- Task 2 --></section>
    <section class="trust-strip"><!-- Task 3 --></section>
    <section class="process" id="process"><!-- Task 4 --></section>
    <section class="coverage" id="coverage"><!-- Task 5 --></section>
    <section class="review" id="review"><!-- Task 6+ --></section>
    <section class="reviews" id="reviews"><!-- Task 11 --></section>
    <section class="faq" id="faq"><!-- Task 12 --></section>
    <section class="cta" id="book"><!-- Task 13 --></section>
  </main>

  <footer class="site-footer"><!-- Task 13 --></footer>

  <script src="script.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css` with reset + design tokens**

```css
:root {
  --bg-dark: #0B0F1A;
  --bg-surface: #141B2D;
  --bg-light: #F5F7FA;
  --accent: #00D4FF;
  --accent-hover: #33DDFF;
  --text-on-dark: #F5F7FA;
  --text-on-light: #0B0F1A;
  --text-muted: #94A3B8;
  --border: #1F2937;
  --error: #FF4D6D;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  --radius: 8px;
  --max-width: 1200px;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: var(--bg-dark);
  color: var(--text-on-dark);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
img, video { max-width: 100%; display: block; }
button { font-family: inherit; cursor: pointer; }
a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-hover); }
.skip-link {
  position: absolute; left: -9999px;
  background: var(--accent); color: var(--bg-dark);
  padding: var(--space-2) var(--space-4);
}
.skip-link:focus { left: var(--space-2); top: var(--space-2); z-index: 1000; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--space-6); }
.btn {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius);
  border: 2px solid var(--accent);
  background: var(--accent);
  color: var(--bg-dark);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s, border-color 0.15s;
}
.btn:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: var(--bg-dark); }
.btn-ghost {
  background: transparent;
  color: var(--text-on-dark);
  border-color: var(--text-muted);
}
.btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: var(--accent); color: var(--text-on-dark); }
```

- [ ] **Step 3: Create empty `script.js`**

```js
// Placeholder — features are added task by task.
```

- [ ] **Step 4: Verify in browser**

Open `index.html` in a browser. Confirm:
- Page background is dark navy (`#0B0F1A`)
- Text is white, body font is Inter (or system fallback if no network)
- Page scrolls smoothly between sections
- No console errors
- `Tab` from address bar lands on "Skip to review your PDI" link, becomes visible when focused

- [ ] **Step 5: Commit**

```bash
cd "C:\coding stuff\New folder (3)"
git add index.html style.css script.js
git commit -m "Add project skeleton with design tokens

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 2: Header + Hero

**Files:**
- Modify: `index.html` (replace header and hero placeholders)

- [ ] **Step 1: Add header markup**

Replace the empty `<header class="site-header" id="top">` with:

```html
<header class="site-header" id="top">
  <div class="container site-header__inner">
    <a href="#top" class="brand" aria-label="INSPECT&GO home">
      <span class="brand__mark" aria-hidden="true">▣</span>
      <span class="brand__name">INSPECT&amp;GO</span>
    </a>
    <button class="hamburger" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>
    <nav id="primary-nav" class="primary-nav" aria-label="Primary">
      <a href="#process">Process</a>
      <a href="#coverage">Coverage</a>
      <a href="#reviews">Reviews</a>
      <a href="#faq">FAQ</a>
    </nav>
    <a href="#book" class="btn site-header__cta">Book now</a>
  </div>
</header>
```

- [ ] **Step 2: Add hero markup**

Replace the empty `<section class="hero" id="hero">` with:

```html
<section class="hero" id="hero">
  <div class="hero__bg" aria-hidden="true"></div>
  <div class="container hero__inner">
    <h1 class="hero__title">We don't deliver cars we haven't inspected.</h1>
    <p class="hero__sub">300-point pre-delivery inspection + door-to-door transport. Booked in 60 seconds.</p>
    <div class="hero__ctas">
      <a href="#book" class="btn">Book inspection</a>
      <a href="#review" class="btn btn-ghost">Already booked? Review your PDI</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add header + hero styles**

Append to `style.css`:

```css
.site-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(11, 15, 26, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.site-header__inner {
  display: flex; align-items: center; justify-content: space-between;
  gap: var(--space-6); padding: var(--space-4) var(--space-6);
}
.brand { display: flex; align-items: center; gap: var(--space-2); color: var(--text-on-dark); font-weight: 700; }
.brand__mark { color: var(--accent); font-size: 1.25rem; }
.primary-nav { display: flex; gap: var(--space-6); }
.primary-nav a { color: var(--text-on-dark); }
.primary-nav a:hover { color: var(--accent); }
.site-header__cta { white-space: nowrap; }
.hamburger { display: none; background: none; border: 0; padding: var(--space-2); }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--text-on-dark); margin: 4px 0; }

.hero { position: relative; padding: var(--space-24) 0; overflow: hidden; }
.hero__bg {
  position: absolute; inset: 0; z-index: 0;
  background:
    linear-gradient(135deg, rgba(11,15,26,0.92), rgba(11,15,26,0.6)),
    url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80') center/cover no-repeat;
}
.hero__inner { position: relative; z-index: 1; max-width: 760px; }
.hero__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  line-height: 1.1; margin: 0 0 var(--space-6);
  letter-spacing: -0.02em;
}
.hero__sub { font-size: 1.125rem; color: var(--text-muted); margin: 0 0 var(--space-8); }
.hero__ctas { display: flex; gap: var(--space-4); flex-wrap: wrap; }
```

- [ ] **Step 4: Verify in browser**

- Header sticks to top on scroll
- Brand mark + name visible on left, nav centered, "Book now" CTA on right
- Hero shows big headline + subhead + two buttons
- Hero background shows the car photo (or dark gradient if image blocked)
- "Book inspection" scrolls to `#book`; "Review your PDI" scrolls to `#review`
- Resize to 375px: hamburger appears, nav hides

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Add sticky header and dark hero section

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 3: Trust strip

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Replace placeholder with 4-stat markup**

```html
<section class="trust-strip">
  <div class="container">
    <ul class="trust-strip__grid">
      <li><span class="trust-num">300+</span><span class="trust-label">Quality checks per car</span></li>
      <li><span class="trust-num">24-hr</span><span class="trust-label">Report turnaround</span></li>
      <li><span class="trust-num">50+</span><span class="trust-label">Cities served</span></li>
      <li><span class="trust-num">8 yrs</span><span class="trust-label">In business</span></li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

```css
.trust-strip { background: var(--bg-light); color: var(--text-on-light); padding: var(--space-12) 0; }
.trust-strip__grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6);
  text-align: center;
}
.trust-num { display: block; font-size: 2.5rem; font-weight: 700; color: var(--bg-dark); letter-spacing: -0.02em; }
.trust-label { color: #475569; font-size: 0.95rem; }

@media (max-width: 768px) {
  .trust-strip__grid { grid-template-columns: repeat(2, 1fr); }
}
```

- [ ] **Step 3: Verify**

- Light band appears directly under the hero
- 4 stats in a row on desktop, 2x2 grid on mobile
- Numbers are large and bold; labels are smaller grey

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Add trust stats strip

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: 3-step process

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Add 3-step markup**

```html
<section class="process" id="process">
  <div class="container">
    <h2 class="section-title">From booking to delivery in 3 steps</h2>
    <ol class="process__grid">
      <li class="process-card">
        <span class="process-card__num">01</span>
        <h3>Book</h3>
        <p>Schedule a slot by phone or email (see contact options below).</p>
      </li>
      <li class="process-card">
        <span class="process-card__num">02</span>
        <h3>Inspect</h3>
        <p>Technician runs 300+ checks on-site and films the walkaround.</p>
      </li>
      <li class="process-card">
        <span class="process-card__num">03</span>
        <h3>Approve &amp; Deliver</h3>
        <p>You review the video, approve, and we transport the car to your door.</p>
      </li>
    </ol>
    <p class="process__cta"><a href="#book" class="btn">See contact options</a></p>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

```css
.process { background: var(--bg-light); color: var(--text-on-light); padding: var(--space-16) 0; }
.section-title {
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  text-align: center; margin: 0 0 var(--space-12);
  letter-spacing: -0.02em;
}
.process .section-title,
.process__cta a { color: var(--text-on-light); }
.process .section-title { color: var(--bg-dark); }
.process__grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6);
}
.process-card {
  background: white; padding: var(--space-8); border-radius: var(--radius);
  border: 1px solid #E2E8F0;
}
.process-card__num {
  display: inline-block; font-weight: 700; color: var(--accent);
  background: var(--bg-dark); padding: var(--space-1) var(--space-3);
  border-radius: var(--radius); margin-bottom: var(--space-4);
}
.process-card h3 { margin: 0 0 var(--space-2); font-size: 1.25rem; }
.process-card p { margin: 0; color: #475569; }
.process__cta { text-align: center; margin-top: var(--space-12); }
.process__cta a.btn { background: var(--accent); color: var(--bg-dark); }

@media (max-width: 768px) {
  .process__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify**

- Section appears under trust strip on light bg
- 3 numbered cards in a row (stacked on mobile)
- "See contact options" button scrolls to `#book`

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Add 3-step process section

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 5: Inspection coverage (6 categories)

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Add coverage markup with inline SVG icons**

```html
<section class="coverage" id="coverage">
  <div class="container">
    <h2 class="section-title">What's covered in 300+ checks</h2>
    <ul class="coverage__grid">
      <li class="coverage-card">
        <svg class="coverage-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="3" y="9" width="18" height="9" rx="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><path d="M3 13h18"/>
        </svg>
        <h3>Engine &amp; Transmission</h3>
        <ul class="coverage-card__list">
          <li>Compression test</li><li>Oil &amp; coolant levels</li><li>Transmission smoothness</li><li>Belt &amp; hose condition</li>
        </ul>
      </li>
      <li class="coverage-card">
        <svg class="coverage-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 17l1-7h16l1 7"/><path d="M5 17v2M19 17v2"/><path d="M3 17h18"/>
        </svg>
        <h3>Exterior &amp; Body</h3>
        <ul class="coverage-card__list">
          <li>Paint depth across panels</li><li>Panel gaps &amp; alignment</li><li>Rust &amp; corrosion</li><li>Glass &amp; windshield</li>
        </ul>
      </li>
      <li class="coverage-card">
        <svg class="coverage-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
        </svg>
        <h3>Electrical Systems</h3>
        <ul class="coverage-card__list">
          <li>Battery health</li><li>Alternator output</li><li>Lights &amp; indicators</li><li>Infotainment &amp; sensors</li>
        </ul>
      </li>
      <li class="coverage-card">
        <svg class="coverage-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
        </svg>
        <h3>Brakes &amp; Suspension</h3>
        <ul class="coverage-card__list">
          <li>Pad &amp; disc wear</li><li>Caliper operation</li><li>Shock absorbers</li><li>Steering play</li>
        </ul>
      </li>
      <li class="coverage-card">
        <svg class="coverage-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 18V8a2 2 0 012-2h12a2 2 0 012 2v10"/><path d="M4 18h16"/><path d="M8 12h8"/>
        </svg>
        <h3>Interior &amp; Comfort</h3>
        <ul class="coverage-card__list">
          <li>Seat condition</li><li>HVAC operation</li><li>Power windows &amp; locks</li><li>Odor &amp; cleanliness</li>
        </ul>
      </li>
      <li class="coverage-card">
        <svg class="coverage-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>
        </svg>
        <h3>Documents &amp; History</h3>
        <ul class="coverage-card__list">
          <li>RC verification</li><li>Service history</li><li>Accident records</li><li>Insurance &amp; PUC validity</li>
        </ul>
      </li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

```css
.coverage { background: var(--bg-dark); padding: var(--space-16) 0; }
.coverage__grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6);
}
.coverage-card {
  background: var(--bg-surface); padding: var(--space-6);
  border-radius: var(--radius); border: 1px solid var(--border);
}
.coverage-card__icon { width: 32px; height: 32px; color: var(--accent); margin-bottom: var(--space-4); }
.coverage-card h3 { margin: 0 0 var(--space-3); font-size: 1.125rem; }
.coverage-card__list { padding-left: var(--space-6); margin: 0; color: var(--text-muted); font-size: 0.95rem; }
.coverage-card__list li { margin-bottom: var(--space-1); }

@media (max-width: 1024px) {
  .coverage__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .coverage__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify**

- Dark band reappears (process is light, this returns to dark)
- 6 cards in 3-col grid on desktop, 2-col on tablet, 1-col on mobile
- Each card has an icon + title + bullet list
- Icons render as thin stroked SVGs in cyan

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Add inspection coverage section with 6 categories

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 6: Review section — markup + styles

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Replace the review placeholder with full markup**

```html
<section class="review" id="review">
  <div class="container">
    <h2 class="section-title">Review your PDI video</h2>
    <p class="review__sub">Enter your booking ID to watch the inspection video and confirm the car's condition.</p>

    <form class="booking-form" id="booking-form" novalidate>
      <label for="booking-id" class="booking-form__label">Booking ID</label>
      <div class="booking-form__row">
        <input type="text" id="booking-id" name="bookingId" maxlength="64"
               placeholder="e.g. PDI-2026-0042" autocomplete="off" required />
        <button type="submit" class="btn">Watch video</button>
      </div>
      <p class="form-error" id="booking-error" hidden>Please enter a booking ID.</p>
    </form>

    <div class="video-wrap" id="video-wrap" hidden>
      <video id="pdi-video" controls preload="metadata"
             src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4">
        Your browser doesn't support embedded video.
      </video>
    </div>

    <form class="approval-form" id="approval-form" hidden novalidate>
      <h3 class="approval-form__title">Confirm the inspection</h3>

      <div class="field">
        <label for="ap-name">Your name</label>
        <input type="text" id="ap-name" name="name" maxlength="100" required autocomplete="name" />
        <p class="form-error" data-error-for="name" hidden></p>
      </div>

      <div class="field">
        <label for="ap-phone">Phone</label>
        <input type="tel" id="ap-phone" name="phone" required autocomplete="tel" />
        <p class="form-error" data-error-for="phone" hidden></p>
      </div>

      <fieldset class="field field--radio">
        <legend>Decision</legend>
        <label><input type="radio" name="decision" value="approve" required /> Approve</label>
        <label><input type="radio" name="decision" value="callback" /> Request callback</label>
        <label><input type="radio" name="decision" value="reject" /> Reject</label>
        <p class="form-error" data-error-for="decision" hidden></p>
      </fieldset>

      <div class="field">
        <label for="ap-notes">Notes (optional)</label>
        <textarea id="ap-notes" name="notes" maxlength="1000" rows="3"></textarea>
      </div>

      <button type="submit" class="btn">Submit decision</button>
      <p class="approval-form__viewback">
        <a href="#" id="view-last">View my last decision</a>
      </p>
    </form>

    <div class="success-card" id="success-card" hidden>
      <h3>Decision recorded</h3>
      <p>Reference: <code id="ref-code"></code></p>
      <p class="success-card__sub">We've stored your decision locally for this demo. In production this would email your inspector.</p>
    </div>

    <div class="last-decision" id="last-decision" hidden></div>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

```css
.review { background: var(--bg-dark); padding: var(--space-16) 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
.review__sub { text-align: center; color: var(--text-muted); margin: -16px 0 var(--space-8); }
.booking-form, .approval-form { max-width: 640px; margin: 0 auto var(--space-8); }
.booking-form__label { display: block; font-weight: 600; margin-bottom: var(--space-2); }
.booking-form__row { display: flex; gap: var(--space-3); }
.booking-form__row input {
  flex: 1; padding: var(--space-3) var(--space-4);
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-on-dark); font-size: 1rem;
}
.booking-form__row input:focus { border-color: var(--accent); }
.video-wrap {
  max-width: 960px; margin: 0 auto var(--space-8);
  background: black; border-radius: var(--radius); overflow: hidden;
}
.video-wrap video { width: 100%; aspect-ratio: 16/9; }
.approval-form__title { text-align: center; }
.field { margin-bottom: var(--space-6); }
.field label, .field legend { display: block; font-weight: 500; margin-bottom: var(--space-2); }
.field input[type="text"], .field input[type="tel"], .field textarea {
  width: 100%; padding: var(--space-3) var(--space-4);
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-on-dark); font-size: 1rem;
  font-family: inherit;
}
.field input:focus, .field textarea:focus { border-color: var(--accent); }
.field--radio { border: 0; padding: 0; margin-inline-start: 0; }
.field--radio label { display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); font-weight: 400; }
.form-error { color: var(--error); font-size: 0.875rem; margin: var(--space-2) 0 0; }
.has-error input, .has-error textarea { border-color: var(--error); }
.approval-form__viewback { text-align: center; margin-top: var(--space-4); font-size: 0.95rem; }
.success-card {
  max-width: 640px; margin: 0 auto; padding: var(--space-8);
  background: rgba(0, 212, 255, 0.08); border: 1px solid var(--accent);
  border-radius: var(--radius); text-align: center;
}
.success-card h3 { color: var(--accent); margin: 0 0 var(--space-3); }
.success-card code { background: var(--bg-dark); padding: 2px 8px; border-radius: 4px; font-size: 1.1rem; }
.success-card__sub { color: var(--text-muted); font-size: 0.9rem; margin-top: var(--space-4); }
.last-decision {
  max-width: 640px; margin: var(--space-6) auto 0; padding: var(--space-6);
  background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius);
}
.last-decision dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: var(--space-2) var(--space-4); }
.last-decision dt { color: var(--text-muted); }
```

- [ ] **Step 3: Verify**

- Review section displays full-bleed dark band
- Booking form visible with input + button
- Video element NOT visible
- Approval form NOT visible
- Success card NOT visible
- All ids present (inspect DOM)

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Add review section markup and styles

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 7: JS — booking-ID → video reveal

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Replace `script.js` with booking-flow code**

```js
(() => {
  'use strict';

  // ---------- Pure helpers ----------

  const STORAGE_KEY = 'pdi_decisions';

  function validateBookingId(raw) {
    const id = (raw ?? '').trim();
    if (!id) return { ok: false, error: 'Please enter a booking ID.' };
    if (id.length > 64) return { ok: false, error: 'Booking ID is too long.' };
    return { ok: true, value: id };
  }

  function validateName(raw) {
    const v = (raw ?? '').trim();
    if (!v) return { ok: false, error: 'Please enter your name.' };
    if (v.length > 100) return { ok: false, error: 'Name is too long.' };
    return { ok: true, value: v };
  }

  function validatePhone(raw) {
    const v = (raw ?? '').trim();
    if (!v) return { ok: false, error: 'Please enter your phone number.' };
    if (v.replace(/\D/g, '').length < 7) return { ok: false, error: 'Phone number looks too short.' };
    return { ok: true, value: v };
  }

  function validateDecision(raw) {
    if (raw === 'approve' || raw === 'callback' || raw === 'reject') {
      return { ok: true, value: raw };
    }
    return { ok: false, error: 'Please choose a decision.' };
  }

  function generateReference() {
    const bytes = new Uint8Array(3);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `DEC-${hex}`;
  }

  function loadDecisions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveDecision(decision) {
    const list = loadDecisions();
    list.push(decision);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  }

  function formatDecision(d) {
    const labels = { approve: 'Approved', callback: 'Requested callback', reject: 'Rejected' };
    const when = new Date(d.timestamp).toLocaleString();
    return `
      <h4>Your last decision</h4>
      <dl>
        <dt>Reference</dt><dd><code>${escapeHtml(d.reference)}</code></dd>
        <dt>Booking ID</dt><dd>${escapeHtml(d.bookingId)}</dd>
        <dt>Name</dt><dd>${escapeHtml(d.name)}</dd>
        <dt>Phone</dt><dd>${escapeHtml(d.phone)}</dd>
        <dt>Decision</dt><dd>${labels[d.decision] ?? d.decision}</dd>
        <dt>Notes</dt><dd>${d.notes ? escapeHtml(d.notes) : '—'}</dd>
        <dt>Submitted</dt><dd>${escapeHtml(when)}</dd>
      </dl>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ---------- DOM glue ----------

  function $(sel, root = document) { return root.querySelector(sel); }
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg ?? '';
    el.hidden = !msg;
    const field = el.previousElementSibling?.tagName === 'INPUT' || el.previousElementSibling?.tagName === 'TEXTAREA'
      ? el.parentElement
      : el.closest('.field');
    if (field) field.classList.toggle('has-error', !!msg);
  }

  function initBookingFlow() {
    const form = $('#booking-form');
    const input = $('#booking-id');
    const errEl = $('#booking-error');
    const videoWrap = $('#video-wrap');
    const video = $('#pdi-video');
    const approvalForm = $('#approval-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = validateBookingId(input.value);
      if (!result.ok) {
        setError(errEl, result.error);
        input.focus();
        return;
      }
      setError(errEl, null);
      show(videoWrap);
      show(approvalForm);
      // Reload video to ensure it plays from start with current src.
      video.load();
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    input.addEventListener('input', () => setError(errEl, null));
  }

  function initApprovalForm() {
    const form = $('#approval-form');
    if (!form) return;

    const errs = {
      name: form.querySelector('[data-error-for="name"]'),
      phone: form.querySelector('[data-error-for="phone"]'),
      decision: form.querySelector('[data-error-for="decision"]'),
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = validateName(data.get('name'));
      const phone = validatePhone(data.get('phone'));
      const decision = validateDecision(data.get('decision'));

      setError(errs.name, name.ok ? null : name.error);
      setError(errs.phone, phone.ok ? null : phone.error);
      setError(errs.decision, decision.ok ? null : decision.error);

      if (!name.ok) { $('#ap-name').focus(); return; }
      if (!phone.ok) { $('#ap-phone').focus(); return; }
      if (!decision.ok) {
        form.querySelector('input[name="decision"]').focus();
        return;
      }

      const record = {
        bookingId: $('#booking-id').value.trim(),
        name: name.value,
        phone: phone.value,
        decision: decision.value,
        notes: (data.get('notes') ?? '').toString().trim(),
        timestamp: new Date().toISOString(),
        reference: generateReference(),
      };

      saveDecision(record);

      $('#ref-code').textContent = record.reference;
      show($('#success-card'));
      hide($('#last-decision'));
      $('#success-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    ['name', 'phone'].forEach(field => {
      const input = form.querySelector(`#ap-${field}`);
      input?.addEventListener('input', () => setError(errs[field], null));
    });
    form.querySelectorAll('input[name="decision"]').forEach(r => {
      r.addEventListener('change', () => setError(errs.decision, null));
    });

    $('#view-last')?.addEventListener('click', (e) => {
      e.preventDefault();
      const list = loadDecisions();
      const last = list[list.length - 1];
      const container = $('#last-decision');
      if (!last) {
        container.innerHTML = '<p>No previous decisions found.</p>';
      } else {
        container.innerHTML = formatDecision(last);
      }
      show(container);
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-item__q');
      btn?.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach(other => {
          other.classList.remove('is-open');
          const b = other.querySelector('.faq-item__q');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initMobileMenu() {
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.primary-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        btn.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initBookingFlow();
    initApprovalForm();
    initFaqAccordion();
    initMobileMenu();
  });
})();
```

- [ ] **Step 2: Verify**

- Reload page, scroll to review section
- Click "Watch video" with empty input → inline error "Please enter a booking ID."
- Type `TEST-123` → click Watch video → video element appears, scrolls into view, video plays
- Approval form also appears below video

- [ ] **Step 3: Commit**

```bash
git add script.js
git commit -m "Wire booking-ID flow and JS helpers

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 8: Testimonials

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Replace testimonials placeholder with markup**

```html
<section class="reviews" id="reviews">
  <div class="container">
    <h2 class="section-title">What customers say</h2>
    <ul class="reviews__grid">
      <li class="review-card">
        <span class="sample-badge">Sample review</span>
        <div class="review-card__avatar" aria-hidden="true">PC</div>
        <p class="review-card__name">Pushkar Chaddha</p>
        <p class="review-card__role">Car buyer, Delhi</p>
        <p class="review-card__quote">"Got the PDI report in under 24 hours. Caught a hidden accident record the dealer missed."</p>
        <p class="review-card__date">2026-05-12</p>
      </li>
      <li class="review-card">
        <span class="sample-badge">Sample review</span>
        <div class="review-card__avatar" aria-hidden="true">SS</div>
        <p class="review-card__name">Smriti Sachdeva</p>
        <p class="review-card__role">Car buyer, Bangalore</p>
        <p class="review-card__quote">"The video walkthrough made the decision easy. Saved me from a bad purchase."</p>
        <p class="review-card__date">2026-04-18</p>
      </li>
      <li class="review-card">
        <span class="sample-badge">Sample review</span>
        <div class="review-card__avatar" aria-hidden="true">HM</div>
        <p class="review-card__name">Harsh Mishra</p>
        <p class="review-card__role">Car buyer, Mumbai</p>
        <p class="review-card__quote">"Inspection was thorough. The technician caught brake pad wear I'd never have noticed."</p>
        <p class="review-card__date">2026-03-22</p>
      </li>
      <li class="review-card">
        <span class="sample-badge">Sample review</span>
        <div class="review-card__avatar" aria-hidden="true">SP</div>
        <p class="review-card__name">Swapan Sekhon</p>
        <p class="review-card__role">Car buyer, Pune</p>
        <p class="review-card__quote">"Used them twice now. The transport service is a nice bonus."</p>
        <p class="review-card__date">2026-02-09</p>
      </li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

```css
.reviews { background: var(--bg-dark); padding: var(--space-16) 0; }
.reviews__grid {
  list-style: none; padding: 0; margin: 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6);
}
.review-card {
  background: var(--bg-surface); padding: var(--space-6);
  border-radius: var(--radius); border: 1px solid var(--border);
  position: relative; padding-top: var(--space-12);
}
.sample-badge {
  position: absolute; top: var(--space-3); right: var(--space-3);
  background: rgba(255, 77, 109, 0.12); color: var(--error);
  padding: 2px var(--space-2); border-radius: 4px;
  font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
}
.review-card__avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--accent); color: var(--bg-dark);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; margin-bottom: var(--space-3);
}
.review-card__name { margin: 0; font-weight: 600; }
.review-card__role { margin: 0 0 var(--space-3); color: var(--text-muted); font-size: 0.875rem; }
.review-card__quote { margin: 0 0 var(--space-3); font-style: italic; }
.review-card__date { margin: 0; color: var(--text-muted); font-size: 0.8rem; }

@media (max-width: 1024px) {
  .reviews__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .reviews__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify**

- Section appears in dark band
- 4 cards with cyan avatar circles, name, role, quote, date
- Each card has a small red "Sample review" badge in the top-right
- 4-col → 2-col → 1-col responsive

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Add testimonials section with sample-review badges

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 9: FAQ accordion

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Replace FAQ placeholder with markup**

```html
<section class="faq" id="faq">
  <div class="container">
    <h2 class="section-title">Frequently asked questions</h2>
    <ul class="faq__list">
      <li class="faq-item">
        <button class="faq-item__q" aria-expanded="false">
          <span>What is a pre-delivery inspection?</span>
          <span class="faq-item__chev" aria-hidden="true">▾</span>
        </button>
        <div class="faq-item__a">
          <p>A 300+ point check we run on a car before it changes hands. We document everything with photos and a walkaround video so you know exactly what you're getting.</p>
        </div>
      </li>
      <li class="faq-item">
        <button class="faq-item__q" aria-expanded="false">
          <span>How long does the inspection take?</span>
          <span class="faq-item__chev" aria-hidden="true">▾</span>
        </button>
        <div class="faq-item__a">
          <p>Typically 45–60 minutes on-site. You get the digital report within 24 hours.</p>
        </div>
      </li>
      <li class="faq-item">
        <button class="faq-item__q" aria-expanded="false">
          <span>Do I need to be present during the inspection?</span>
          <span class="faq-item__chev" aria-hidden="true">▾</span>
        </button>
        <div class="faq-item__a">
          <p>No. The technician films the walkaround and you review the video remotely.</p>
        </div>
      </li>
      <li class="faq-item">
        <button class="faq-item__q" aria-expanded="false">
          <span>What if the car fails the inspection?</span>
          <span class="faq-item__chev" aria-hidden="true">▾</span>
        </button>
        <div class="faq-item__a">
          <p>You get the full report with findings. Most buyers use it to negotiate the price or walk away.</p>
        </div>
      </li>
      <li class="faq-item">
        <button class="faq-item__q" aria-expanded="false">
          <span>How does the transportation service work?</span>
          <span class="faq-item__chev" aria-hidden="true">▾</span>
        </button>
        <div class="faq-item__a">
          <p>Once you approve the car, we schedule pickup and door-to-door delivery. The car arrives in the same condition it left.</p>
        </div>
      </li>
      <li class="faq-item">
        <button class="faq-item__q" aria-expanded="false">
          <span>Can I get a refund if I'm not satisfied?</span>
          <span class="faq-item__chev" aria-hidden="true">▾</span>
        </button>
        <div class="faq-item__a">
          <p>If the report misses a major defect we documented, we refund the inspection fee. See Refund policy for details.</p>
        </div>
      </li>
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Add styles**

```css
.faq { background: var(--bg-dark); padding: var(--space-16) 0; }
.faq__list { list-style: none; padding: 0; margin: 0; max-width: 800px; margin-inline: auto; }
.faq-item { border-bottom: 1px solid var(--border); }
.faq-item__q {
  width: 100%; background: none; border: 0; padding: var(--space-6) 0;
  display: flex; justify-content: space-between; align-items: center; gap: var(--space-4);
  color: var(--text-on-dark); font-size: 1.05rem; font-weight: 600; text-align: left;
}
.faq-item__q:hover { color: var(--accent); }
.faq-item__chev { transition: transform 0.2s; font-size: 0.9rem; color: var(--accent); }
.faq-item.is-open .faq-item__chev { transform: rotate(180deg); }
.faq-item__a { max-height: 0; overflow: hidden; transition: max-height 0.2s ease-out; }
.faq-item__a p { margin: 0; padding: 0 0 var(--space-6); color: var(--text-muted); }
.faq-item.is-open .faq-item__a { max-height: 400px; }
```

- [ ] **Step 3: Verify**

- 6 FAQ items stacked, each with a question and chevron
- Click an item → it expands, chevron rotates, others collapse (one-at-a-time)
- Click same item again → it collapses

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "Add FAQ accordion with one-open-at-a-time behavior

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 10: Final CTA + Footer

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Replace final CTA placeholder with markup**

```html
<section class="cta" id="book">
  <div class="container cta__inner">
    <div>
      <h2 class="cta__title">Ready to inspect your next car?</h2>
      <p class="cta__sub">Online booking form coming soon. To schedule now, call or email:</p>
    </div>
    <div class="cta__card">
      <p><strong>📞</strong> <a href="tel:+910000000000">+91-XXXXX-XXXXX</a></p>
      <p><strong>✉</strong> <a href="mailto:book@inspectandgo.example">book@inspectandgo.example</a></p>
      <a href="tel:+910000000000" class="btn cta__call">Call now</a>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Replace footer placeholder with markup**

```html
<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__col">
      <h4>Company</h4>
      <ul><li><a href="#">About</a></li><li><a href="#">Contact</a></li><li><a href="#">Careers</a></li></ul>
    </div>
    <div class="site-footer__col">
      <h4>Services</h4>
      <ul><li><a href="#coverage">PDI</a></li><li><a href="#">Transportation</a></li><li><a href="#">Reports</a></li></ul>
    </div>
    <div class="site-footer__col">
      <h4>Legal</h4>
      <ul><li><a href="#">Terms</a></li><li><a href="#">Privacy</a></li><li><a href="#">Refund policy</a></li></ul>
    </div>
  </div>
  <p class="site-footer__copy">© 2026 INSPECT&amp;GO. Sample content — placeholder copy.</p>
</footer>
```

- [ ] **Step 3: Add styles**

```css
.cta { background: var(--bg-light); color: var(--text-on-light); padding: var(--space-16) 0; }
.cta__inner { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); align-items: center; }
.cta__title { font-size: clamp(1.75rem, 3.5vw, 2.25rem); margin: 0 0 var(--space-4); letter-spacing: -0.02em; color: var(--bg-dark); }
.cta__sub { margin: 0; color: #475569; }
.cta__card {
  background: white; padding: var(--space-8); border-radius: var(--radius);
  border: 1px solid #E2E8F0; box-shadow: 0 4px 24px rgba(15, 22, 38, 0.08);
}
.cta__card p { margin: 0 0 var(--space-2); }
.cta__card a { color: var(--bg-dark); text-decoration: underline; }
.cta__call { margin-top: var(--space-4); }

.site-footer { background: var(--bg-dark); padding: var(--space-12) 0 var(--space-6); border-top: 1px solid var(--border); }
.site-footer__inner { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-8); margin-bottom: var(--space-8); }
.site-footer__col h4 { margin: 0 0 var(--space-3); color: var(--text-on-dark); font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; }
.site-footer__col ul { list-style: none; padding: 0; margin: 0; }
.site-footer__col li { margin-bottom: var(--space-2); }
.site-footer__col a { color: var(--text-muted); }
.site-footer__col a:hover { color: var(--accent); }
.site-footer__copy { text-align: center; color: var(--text-muted); margin: 0; padding-top: var(--space-6); border-top: 1px solid var(--border); }

@media (max-width: 768px) {
  .cta__inner { grid-template-columns: 1fr; }
  .site-footer__inner { grid-template-columns: 1fr; gap: var(--space-6); }
}
```

- [ ] **Step 4: Verify**

- Final CTA section is light, splits into 2 columns on desktop (stacked on mobile)
- "Call now" button is tel: link
- Footer has 3 columns (Company / Services / Legal) + centered copyright
- Click tel: link triggers phone handler (or "no app" prompt on desktop)

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "Add final CTA banner and footer

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 11: Mobile responsive polish + hamburger menu

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add hamburger + mobile-nav styles**

Append to `style.css`:

```css
@media (max-width: 768px) {
  .site-header__cta { display: none; }
  .hamburger { display: block; }
  .primary-nav {
    position: absolute; top: 100%; left: 0; right: 0;
    flex-direction: column; gap: 0;
    background: var(--bg-dark); border-bottom: 1px solid var(--border);
    padding: var(--space-2) var(--space-6);
    display: none;
  }
  .primary-nav.is-open { display: flex; }
  .primary-nav a { padding: var(--space-3) 0; border-bottom: 1px solid var(--border); }
  .primary-nav a:last-child { border-bottom: 0; }
  .booking-form__row { flex-direction: column; }
  .review__sub { margin: -16px var(--space-4) var(--space-8); }
}
```

- [ ] **Step 2: Verify at 375px**

- Resize browser to 375px wide
- Header: hamburger visible, nav hidden, "Book now" CTA hidden (collapsed)
- Click hamburger → nav drops down with 4 stacked links
- Click a nav link → nav closes, page scrolls
- Hero buttons stack vertically
- All section grids collapse to 1 column
- Form inputs are full-width
- Booking form's input + button stack vertically

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "Add mobile responsive styles and hamburger menu

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 12: Final integration + full verification

**Files:**
- Modify: `script.js` (only if issues found)
- Modify: `style.css` (only if issues found)

- [ ] **Step 1: Open the page in a browser and walk the full verification plan from the spec**

Run through these checks, fix anything that fails before committing:

1. **Page loads** — no console errors, no failed network requests
2. **Hero photo loads** — or dark gradient fallback looks intentional
3. **All 10 sections scroll into view** with proper padding/contrast
4. **Hero CTAs:**
   - "Book inspection" → scrolls smoothly to `#book`
   - "Already booked? Review your PDI" → scrolls smoothly to `#review`
5. **Trust strip** shows 4 stats in a row (2x2 on mobile)
6. **Process** shows 3 numbered cards
7. **Coverage** shows 6 cards in 3-col grid
8. **Review section — booking-ID flow:**
   - Empty input + Watch video → inline error "Please enter a booking ID."
   - Enter `TEST-123` + Watch video → video appears, plays
   - Approval form appears below video
9. **Review section — approval form:**
   - Submit empty → all required fields show inline errors
   - Fill name "Jane Doe", phone "+91 98765 43210", decision "Approve" → submit
   - Success card appears with reference like `DEC-7F2A91`
   - DevTools → Application → Local Storage → confirm `pdi_decisions` has 1 entry with correct fields
10. **View last decision:**
    - Submit a second decision with name "Test User", phone "1234567890", decision "Callback"
    - Click "View my last decision" → echoed summary shows the second entry
11. **Testimonials:** 4 cards with cyan avatars and red "Sample review" badges
12. **FAQ:** Click each item → only one open at a time; click open item → closes
13. **Final CTA + Footer** render correctly, tel: and mailto: links present
14. **Mobile (375px):**
    - Hamburger works, nav drops down
    - All grids stack to 1 column
    - Form inputs full-width
15. **Keyboard:**
    - Tab through review form → focus order is Booking ID → name → phone → decision radios → notes → submit
    - Focus rings visible on all interactive elements
    - Enter on a radio group selects that radio
    - Enter in any input submits the form it's in

- [ ] **Step 2: Fix any issues found in step 1**

Common likely issues:
- Sample video URL blocked → swap to a working public-domain MP4 (e.g., `https://www.w3schools.com/html/mov_bbb.mp4`)
- Hero image blocked → CSS gradient already handles this; verify it looks intentional
- Mobile nav z-index conflicts → bump header z-index or nav z-index in `style.css`
- Form submit fires twice → check that `submit` handler doesn't double-bind

After any fix, re-run step 1.

- [ ] **Step 3: Final commit**

If fixes were needed:

```bash
git add -A
git commit -m "Fix issues found in final verification

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

If no fixes needed, this task is a no-op for commits — page is verified.

---

## Self-Review Checklist (run before declaring done)

- [ ] **Spec coverage** — every section in the spec (hero, trust, process, coverage, review, testimonials, FAQ, CTA, footer) has at least one task implementing it
- [ ] **Customer-review workflow state machine** — implemented in Tasks 6 + 7
- [ ] **Form validation rules** — implemented in Task 7 (`validateBookingId`, `validateName`, `validatePhone`, `validateDecision`)
- [ ] **localStorage schema** — matches spec exactly: `{bookingId, name, phone, decision, notes, timestamp, reference}`
- [ ] **CSS tokens** — all 10 tokens from spec used
- [ ] **All icons inline SVG** — confirmed (no icon font)
- [ ] **Mobile responsive** — Task 11 adds the hamburger + breakpoint rules
- [ ] **No placeholders / TBDs in the plan itself** — re-scan the plan for "TODO", "TBD", "implement later"
- [ ] **All file paths in tasks match the file structure at the top of the plan**

---

## Final Acceptance Criteria

The implementation is **done** when:

1. Opening `index.html` in a browser shows a complete, polished landing page with all 10 sections
2. The booking-ID flow works end-to-end (any non-empty ID → video plays)
3. The approval form validates and persists to localStorage
4. The page is usable at 375px width (hamburger menu, stacked layouts, full-width inputs)
5. The full verification plan in Task 12 step 1 passes with no fixes needed
6. All tasks are committed to git