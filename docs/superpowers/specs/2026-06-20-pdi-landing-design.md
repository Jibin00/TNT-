# PDI + Transportation Landing Page — Design Spec

**Date:** 2026-06-20
**Status:** Approved
**Direction:** C (trust-forward dark) with electric cyan accent

## Goal

A single landing page that (a) markets a pre-delivery inspection + car-transportation service and (b) lets existing customers review their PDI video and submit an approve/reject decision — without any backend in v1.

## Non-Goals (v1)

- Real backend / database (forms stub to localStorage; user wires real service later)
- Multi-language / i18n
- Admin dashboard for managing decisions
- Payment processing
- Email / SMS notifications
- User accounts / login

## User Stories

1. **Anonymous visitor** — sees the hero, scans the 3-step process, scrolls through testimonials and FAQ, clicks "Book inspection" (opens a placeholder booking form or mailto).
2. **Customer with a booking ID** — clicks "Already booked? Review", enters booking ID, watches video, submits approve/reject decision.
3. **Customer who already submitted** — clicks "View my last decision" and sees their most recent submission echoed back from localStorage.

## Architecture

Three files in the project root, no build step, no npm dependencies, no framework:

- `index.html` — single-page markup
- `style.css` — all styles (one stylesheet, no preprocessor)
- `script.js` — interactivity (booking-ID lookup, video load, form validation, localStorage persistence)

One documentation directory: `docs/superpowers/specs/` (this file).

Runs by opening `index.html` in any browser or dropping on any static host (Netlify, GitHub Pages, S3, local file).

Browser support: latest Chrome / Firefox / Safari / Edge. Mobile breakpoint at 375px and up.

## Page Sections (top to bottom)

### 1. Header (sticky, dark)
- Left: logo placeholder `▣ INSPECT&GO`
- Center: nav links — Services · Process · Reviews · FAQ
- Right: "Book now" button (accent color)
- Mobile (<768px): hamburger collapses nav into a slide-down panel

### 2. Hero (dark, full-bleed bg photo)
- Background: dark car photo via Unsplash source URL (with CSS gradient fallback)
- Headline: **"We don't deliver cars we haven't inspected."**
- Subhead: "300-point pre-delivery inspection + door-to-door transport. Booked in 60 seconds."
- Two buttons:
  - "Book inspection" (accent, primary) → smooth-scrolls to `#book` (the Final CTA banner, §9) which carries a phone + email contact card in v1
  - "Already booked? Review your PDI" (ghost, secondary) → smooth-scrolls to `#review` section

### 3. Trust strip (light bg)
- 4 stat tiles in a row (2x2 on mobile):
  - **300+** Quality checks per car
  - **24-hr** Report turnaround
  - **50+** Cities served
  - **8 yrs** In business

### 4. 3-step process (light bg)
- Section title: "From booking to delivery in 3 steps"
- 3 numbered cards:
  - **01 Book** — Schedule a slot by phone or email (see §9)
  - **02 Inspect** — Technician runs 300+ checks on-site, films the walkaround
  - **03 Approve & Deliver** — You review the video, approve, and we transport the car
- "See contact options" link below the cards → smooth-scrolls to `#book`

### 5. Inspection coverage (dark bg)
- Section title: "What's covered in 300+ checks"
- 6 cards in a responsive grid:
  - Engine & Transmission
  - Exterior & Body
  - Electrical Systems
  - Brakes & Suspension
  - Interior & Comfort
  - Documents & History
- Each card: inline-SVG icon, title, 3–4 bullet items

### 6. ★ Review your PDI (full-bleed dark band)
**This is the load-bearing feature.** Three sub-blocks, stacked:

**(a) Booking-ID input**
- Section title: "Review your PDI video"
- Subhead: "Enter your booking ID to watch the inspection video and confirm the car's condition."
- Text input, placeholder "e.g. PDI-2026-0042"
- "Watch video" button (accent)
- Inline error if empty

**(b) Video player**
- HTML5 `<video controls preload="metadata">` with `src = https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
- Hidden until a booking ID is submitted

**(c) Approval form**
- Name (text, required)
- Phone (tel, required)
- Decision (radio, required) — Approve · Request callback · Reject
- Notes (textarea, optional, max 1000 chars)
- "Submit decision" button (accent)
- Footer link: "View my last decision" → reads most recent entry from localStorage

### 7. Testimonials (dark bg)
- Section title: "What customers say"
- 4 cards in a row (1 col on mobile):
  - Initials avatar (no real photos)
  - Name + role ("Car Buyer, Delhi")
  - Quote
  - Date
- Each card has a "Sample review" badge

### 8. FAQ (dark bg)
- Section title: "Frequently asked questions"
- 6 accordion items (one open at a time):
  1. What is a pre-delivery inspection?
  2. How long does the inspection take?
  3. Do I need to be present during the inspection?
  4. What if the car fails the inspection?
  5. How does the transportation service work?
  6. Can I get a refund if I'm not satisfied?
- Click to expand/collapse

### 9. Final CTA / Booking contact (light bg, `id="book"`)
- Headline: "Ready to inspect your next car?"
- Body: "Online booking form coming soon. To schedule now, call or email:"
- Contact card: `📞 +91-XXXXX-XXXXX` (tel: link) and `✉ book@inspectandgo.example` (mailto: link)
- "Call now" button (accent, `href="tel:+91XXXXXXXXXX"`)

### 10. Footer (dark bg)
- 3 columns: Company · Services · Legal
- Bottom row: `© 2026 INSPECT&GO. Sample content — placeholder copy.`

## Customer-Review Workflow (state machine)

```
[IDLE]
  ↓ user types ID + clicks "Watch video"
[VALIDATING_ID]
  ↓ if empty → inline error, stay at IDLE
[LOADING_VIDEO]
  ↓ set <video src>, call .load()
[VIDEO_READY]
  ↓ user watches video
[VIDEO_WATCHED]
  ↓ user fills form + clicks "Submit"
[VALIDATING_FORM]
  ↓ if missing required → inline errors, stay
[SUBMITTING]
  ↓ build decision object, push to localStorage
[PERSISTED]
  ↓ show success card with generated reference
[IDLE]  ← user can submit another
```

Side state — `localStorage.pdi_decisions` is a JSON array of:

```js
{
  bookingId: string,
  name: string,
  phone: string,
  decision: "approve" | "callback" | "reject",
  notes: string,
  timestamp: ISO 8601 string,
  reference: string  // "DEC-XXXXXX" hex
}
```

## Form Validation Rules

- **Booking ID**: trimmed, non-empty, max length 64
- **Name**: trimmed, non-empty, max length 100
- **Phone**: trimmed, non-empty; accepts digits, spaces, `+`, `-`, parens; min 7 chars
- **Decision**: exactly one of `approve` / `callback` / `reject`
- **Notes**: optional, max 1000 chars
- Errors shown inline below the field with red border + helper text

## Styling Tokens

| Token             | Value     | Use                          |
|-------------------|-----------|------------------------------|
| `--bg-dark`       | `#0B0F1A` | Page background, dark sections |
| `--bg-surface`    | `#141B2D` | Cards on dark bg              |
| `--bg-light`      | `#F5F7FA` | Light section bg              |
| `--accent`        | `#00D4FF` | CTAs, links, focus rings      |
| `--accent-hover`  | `#33DDFF` | Hover state                   |
| `--text-on-dark`  | `#F5F7FA` | Body text on dark             |
| `--text-on-light` | `#0B0F1A` | Body text on light            |
| `--text-muted`    | `#94A3B8` | Secondary text on dark        |
| `--border`        | `#1F2937` | Subtle dividers               |
| `--error`         | `#FF4D6D` | Validation errors             |

- Font: **Inter** (weights 400 / 500 / 600 / 700) loaded once via Google Fonts `<link>`
- Spacing scale (px): 4, 8, 12, 16, 24, 32, 48, 64, 96
- Breakpoints: mobile <768px, tablet 768–1024px, desktop >1024px
- Icons: inline SVG only — no icon font, no library

## Assets

### Photos (Unsplash source URLs)
- Hero bg: `https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80` (or fallback CSS gradient `#0B0F1A → #141B2D` diagonal)

### Sample video
- `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` — public-domain, streams fine, ~158MB

### Inline SVG icons
- Logo placeholder mark
- 6 inspection-category icons (engine, body, electrical, brakes, interior, documents)
- 3 process-step numbered badges (or numbered circles)
- FAQ accordion chevron
- Hamburger menu (mobile)
- "Sample review" badge

## Sample Content (clearly placeholder)

### Headlines
- Hero: "We don't deliver cars we haven't inspected."
- Process: "From booking to delivery in 3 steps"
- Review: "Review your PDI video"
- FAQ: "Frequently asked questions"
- Final CTA: "Ready to inspect your next car?"

### Testimonials (all marked "Sample review")
1. **Pushkar Chaddha** — Car Buyer, Delhi — "Got the PDI report in under 24 hours. Caught a hidden accident record the dealer missed." — 2026-05-12
2. **Smriti Sachdeva** — Car Buyer, Bangalore — "The video walkthrough made the decision easy. Saved me from a bad purchase." — 2026-04-18
3. **Harsh Mishra** — Car Buyer, Mumbai — "Inspection was thorough. The technician caught brake pad wear I'd never have noticed." — 2026-03-22
4. **Swapan Sekhon** — Car Buyer, Pune — "Used them twice now. The transport service is a nice bonus." — 2026-02-09

### FAQ (placeholder)
1. **What is a pre-delivery inspection?** — A 300+ point check we run on a car before it changes hands. We document everything with photos and a walkaround video so you know exactly what you're getting.
2. **How long does the inspection take?** — Typically 45–60 minutes on-site. You get the digital report within 24 hours.
3. **Do I need to be present during the inspection?** — No. The technician films the walkaround and you review the video remotely.
4. **What if the car fails the inspection?** — You get the full report with findings. Most buyers use it to negotiate the price or walk away.
5. **How does the transportation service work?** — Once you approve the car, we schedule pickup and door-to-door delivery. The car arrives in the same condition it left.
6. **Can I get a refund if I'm not satisfied?** — If the report misses a major defect we documented, we refund the inspection fee. See Refund policy for details.

## Verification Plan

Run before declaring done:

1. **Open** `index.html` in browser — confirm no console errors, no failed network requests
2. **Scroll** through all 10 sections — verify padding, contrast, no overflow, no broken images
3. **Hero CTAs:**
   - "Book inspection" scrolls to #book anchor
   - "Already booked? Review" smooth-scrolls to #review section
4. **Booking-ID flow:**
   - Empty ID + click → inline error, no video load
   - Enter `TEST-123` → click Watch video → video element appears with controls; pressing play streams the sample
5. **Approval form:**
   - Submit empty form → all required fields show inline errors
   - Fill name + phone + decision → submit → success card appears with a generated reference number (`DEC-XXXXXX`)
   - Open DevTools → Application → Local Storage → confirm `pdi_decisions` has the new entry as the last item
6. **"View my last decision" link:**
   - Click after a submission → echoed summary appears
7. **Mobile (375px wide):**
   - Header collapses to hamburger
   - Hero text wraps gracefully, no overflow
   - Cards stack vertically
   - Form fields are full-width and easy to tap
8. **Keyboard navigation:**
   - Tab through the form → focus order is logical
   - Focus rings visible on every interactive element
   - Enter submits the form

## Out of Scope (v1)

- Real backend / database integration (EmailJS, Formspree, custom API)
- Real authentication for customers
- Admin panel to view all decisions
- Video upload by the business (sample video only in v1)
- Payment processing
- i18n / multi-language
- Analytics tracking
- PWA / offline support