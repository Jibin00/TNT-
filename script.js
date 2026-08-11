/* =============================================================================
   SouthSidePDI — site behaviour
   No dependencies, no build step. Everything degrades to a working page if JS
   is unavailable or the visitor prefers reduced motion.
   ========================================================================== */
(() => {
  'use strict';

  const STORAGE_KEY = 'sspdi_decisions';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const show = (el) => { if (el) el.hidden = false; };
  const hide = (el) => { if (el) el.hidden = true; };
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ validation */

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
    if (raw === 'approve' || raw === 'callback' || raw === 'reject') return { ok: true, value: raw };
    return { ok: false, error: 'Please choose a decision.' };
  }

  function generateReference() {
    const bytes = new Uint8Array(3);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    return `SSPDI-${hex}`;
  }

  function loadDecisions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function saveDecision(decision) {
    try {
      const list = loadDecisions();
      list.push(decision);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch { return []; }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
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
        <dt>Decision</dt><dd>${labels[d.decision] ?? escapeHtml(d.decision)}</dd>
        <dt>Notes</dt><dd>${d.notes ? escapeHtml(d.notes) : '—'}</dd>
        <dt>Submitted</dt><dd>${escapeHtml(when)}</dd>
      </dl>`;
  }

  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg ?? '';
    el.hidden = !msg;
    const field = el.closest('.field') ?? el.parentElement;
    if (field) field.classList.toggle('has-error', !!msg);
  }

  /* --------------------------------------------------------- booking flow */

  function initBookingFlow() {
    const form = $('#booking-form');
    if (!form) return;
    const input = $('#booking-id');
    const errEl = $('#booking-error');
    const videoWrap = $('#video-wrap');
    const video = $('#pdi-video');
    const approvalForm = $('#approval-form');

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
      video.load();
      video.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
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
      if (!decision.ok) { form.querySelector('input[name="decision"]').focus(); return; }

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
      $('#success-card').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    });

    ['name', 'phone'].forEach(field => {
      form.querySelector(`#ap-${field}`)?.addEventListener('input', () => setError(errs[field], null));
    });
    $$('input[name="decision"]', form).forEach(r => {
      r.addEventListener('change', () => setError(errs.decision, null));
    });

    $('#view-last')?.addEventListener('click', (e) => {
      e.preventDefault();
      const list = loadDecisions();
      const last = list[list.length - 1];
      const container = $('#last-decision');
      container.innerHTML = last ? formatDecision(last) : '<p>No previous decisions found.</p>';
      show(container);
      container.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ------------------------------------------------------------ chrome/UI */

  function initHeader() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMobileMenu() {
    const btn = $('.hamburger');
    const nav = $('.primary-nav');
    if (!btn || !nav) return;

    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    $$('a', nav).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function initFaqAccordion() {
    const items = $$('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-item__q');
      btn?.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach(other => {
          other.classList.remove('is-open');
          other.querySelector('.faq-item__q')?.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  function initReveals() {
    const targets = $$('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(el => io.observe(el));
  }

  function initHeroSplit() {
    const title = $('[data-split]');
    if (!title || reducedMotion) return;

    const frag = document.createDocumentFragment();
    let index = 0;

    Array.from(title.childNodes).forEach(node => {
      const extraClass = node.nodeType === 1 ? node.className : '';
      (node.textContent || '').split(/(\s+)/).forEach(token => {
        if (!token.trim()) {
          if (token) frag.appendChild(document.createTextNode(' '));
          return;
        }
        const wrap = document.createElement('span');
        wrap.className = 'word-wrap';
        const word = document.createElement('span');
        word.className = extraClass ? `word ${extraClass}` : 'word';
        word.style.setProperty('--w', String(index++));
        word.textContent = token;
        wrap.appendChild(word);
        frag.appendChild(wrap);
      });
    });

    title.textContent = '';
    title.appendChild(frag);
  }

  function initFloatingWhatsApp() {
    const el = $('#wa-float');
    if (!el) return;
    const onScroll = () => el.classList.toggle('is-in', window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initYear() {
    const el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ==========================================================================
     360° pinned inspection scene

     The car is drawn as a wireframe "scan" on a <canvas> — no image assets and
     no 3D library, so it stays sharp on any screen and cheap on mobile.

     If you later have a real photographic 360 spin, drop the frames into
     assets/car360/ as 001.webp … NNN.webp and set FRAMES.count to the number of
     files. The scrubber will use them instead and fall back to the wireframe if
     any frame fails to load.
     ====================================================================== */

  const FRAMES = { dir: 'assets/car360/', count: 0, ext: 'webp', pad: 3 };

  const TAU = Math.PI * 2;

  // Lower body: [x, yTop, halfWidth] stations from tail (-1) to nose (+1)
  const BODY_STATIONS = [
    [-1.02, 0.42, 0.27], [-0.94, 0.46, 0.36], [-0.72, 0.475, 0.405],
    [-0.36, 0.475, 0.42], [0.06, 0.465, 0.42], [0.44, 0.44, 0.405],
    [0.78, 0.40, 0.38], [0.96, 0.365, 0.32], [1.03, 0.32, 0.22],
  ];
  const BODY_FLOOR = 0.115;

  // Greenhouse (cabin) sitting on the body
  const CABIN_STATIONS = [
    [-0.64, 0.49, 0.245], [-0.52, 0.60, 0.305], [-0.32, 0.655, 0.335],
    [0.00, 0.655, 0.335], [0.18, 0.615, 0.305], [0.36, 0.49, 0.245],
  ];
  const CABIN_FLOOR = 0.435;

  const WHEELS = [
    { x: 0.60, z: 0.40 }, { x: 0.60, z: -0.40 },
    { x: -0.62, z: 0.40 }, { x: -0.62, z: -0.40 },
  ];
  const WHEEL_R = 0.21;
  const WHEEL_W = 0.09;

  const HOTSPOTS = [
    { x: -0.10, y: 0.66, z: 0.10, label: 'PAINT' },
    { x: 0.02, y: 0.125, z: 0.36, label: 'STRUCTURE' },
    { x: 0.72, y: 0.43, z: 0.00, label: 'ENGINE' },
    { x: 0.60, y: 0.22, z: 0.45, label: 'BRAKES' },
    { x: -0.20, y: 0.58, z: -0.26, label: 'INTERIOR' },
    { x: -1.00, y: 0.42, z: 0.00, label: 'PAPERS' },
  ];

  const CAM = { dist: 4.6, pitch: 0.21, cy: 0.36 };
  const RING_SEGMENTS = 16;
  const LIME = '202,224,77';

  function superRing(x, yBot, yTop, halfW, n) {
    const pts = [];
    const cy = (yBot + yTop) / 2;
    const hy = (yTop - yBot) / 2;
    const p = 0.62; // < 1 pushes the section towards a rounded rectangle
    for (let k = 0; k < n; k++) {
      const t = (k / n) * TAU;
      const c = Math.cos(t), s = Math.sin(t);
      pts.push({
        x,
        y: cy + hy * Math.sign(s) * Math.pow(Math.abs(s), p),
        z: halfW * Math.sign(c) * Math.pow(Math.abs(c), p),
      });
    }
    return pts;
  }

  function buildLoft(stations, floor, n) {
    return stations.map(([x, yTop, halfW]) => superRing(x, floor, yTop, halfW, n));
  }

  function buildWheel(cx, cz, r, width, seg) {
    const outer = [], inner = [];
    const sign = cz >= 0 ? 1 : -1;
    for (let k = 0; k < seg; k++) {
      const t = (k / seg) * TAU;
      const x = cx + r * Math.cos(t);
      const y = r + r * Math.sin(t);
      outer.push({ x, y, z: cz + sign * width / 2 });
      inner.push({ x, y, z: cz - sign * width / 2 });
    }
    return { outer, inner, hub: { x: cx, y: r, z: cz + sign * width / 2 } };
  }

  const MESH = {
    body: buildLoft(BODY_STATIONS, BODY_FLOOR, RING_SEGMENTS),
    cabin: buildLoft(CABIN_STATIONS, CABIN_FLOOR, RING_SEGMENTS),
    wheels: WHEELS.map(w => buildWheel(w.x, w.z, WHEEL_R, WHEEL_W, 18)),
  };

  function makeProjector(angle, w, h, scale) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
    const cx = w / 2, cy = h * 0.46;
    return (p, flipY) => {
      const py = flipY ? -p.y : p.y;
      const X = p.x * ca + p.z * sa;
      const Z0 = -p.x * sa + p.z * ca;
      const Y0 = py - CAM.cy;
      const Yv = Y0 * cp - Z0 * sp;
      const Zv = Y0 * sp + Z0 * cp;
      const k = scale / (CAM.dist - Zv);
      return { x: cx + X * k, y: cy - Yv * k, d: Zv };
    };
  }

  function depthAlpha(d, min, max) {
    // d runs roughly -1.2 (far) .. 1.2 (near)
    const t = clamp((d + 1.15) / 2.3, 0, 1);
    return min + (max - min) * t;
  }

  function strokePath(ctx, pts, closed, alphaScale, colour) {
    let avg = 0;
    for (const p of pts) avg += p.d;
    avg /= pts.length;
    const a = depthAlpha(avg, 0.1, 0.95) * alphaScale;
    if (a <= 0.012) return;
    ctx.strokeStyle = `rgba(${colour},${a.toFixed(3)})`;
    ctx.lineWidth = 0.7 + depthAlpha(avg, 0, 0.8);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    if (closed) ctx.closePath();
    ctx.stroke();
  }

  function drawLoft(ctx, rings, project, alphaScale, flipY, colour) {
    const projected = rings.map(ring => ring.map(p => project(p, flipY)));

    // cross-sections
    for (const ring of projected) strokePath(ctx, ring, true, alphaScale * 0.55, colour);

    // longitudinal lines
    for (let k = 0; k < RING_SEGMENTS; k++) {
      const line = projected.map(ring => ring[k]);
      strokePath(ctx, line, false, alphaScale, colour);
    }
  }

  function drawWheels(ctx, project, alphaScale, flipY, colour) {
    for (const wheel of MESH.wheels) {
      const outer = wheel.outer.map(p => project(p, flipY));
      const inner = wheel.inner.map(p => project(p, flipY));
      strokePath(ctx, outer, true, alphaScale, colour);
      strokePath(ctx, inner, true, alphaScale * 0.6, colour);
      for (let k = 0; k < outer.length; k += 3) {
        strokePath(ctx, [outer[k], inner[k]], false, alphaScale * 0.5, colour);
      }
      const hub = project(wheel.hub, flipY);
      for (let k = 0; k < outer.length; k += 3) {
        strokePath(ctx, [hub, outer[k]], false, alphaScale * 0.45, colour);
      }
    }
  }

  function drawGroundRing(ctx, project, radius, y, alpha, colour, dashed) {
    const pts = [];
    for (let k = 0; k <= 60; k++) {
      const t = (k / 60) * TAU;
      pts.push(project({ x: Math.cos(t) * radius, y, z: Math.sin(t) * radius }, false));
    }
    ctx.save();
    if (dashed) ctx.setLineDash([5, 9]);
    ctx.strokeStyle = `rgba(${colour},${alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  function drawHotspot(ctx, project, spot, pulse) {
    const p = project(spot, false);
    if (p.d < -0.15) return; // hidden behind the car
    const vis = clamp((p.d + 0.15) / 0.8, 0, 1);

    ctx.save();
    ctx.strokeStyle = `rgba(${LIME},${0.85 * vis})`;
    ctx.fillStyle = `rgba(${LIME},${0.9 * vis})`;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.2, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = (1 - pulse) * vis;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.2 + pulse * 20, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 26, p.y - 22);
    ctx.lineTo(p.x + 74, p.y - 22);
    ctx.globalAlpha = vis;
    ctx.stroke();

    ctx.font = '600 10px "Saira", system-ui, sans-serif';
    ctx.fillStyle = `rgba(${LIME},${vis})`;
    ctx.textBaseline = 'bottom';
    ctx.fillText(spot.label, p.x + 30, p.y - 26);
    ctx.restore();
  }

  function initScene() {
    const section = $('[data-scene]');
    if (!section) return;

    const wrap = $('[data-scene-wrap]', section);
    const stage = $('.scene__stage', section);
    const canvas = $('[data-scene-canvas]', section);
    const list = $('[data-scene-list]', section);
    const viewport = $('.scene__viewport', section);
    const items = $$('.scene-item', section);
    const angleEl = $('[data-scene-angle]', section);
    const stepEl = $('[data-scene-step]', section);
    const bar = $('[data-scene-bar]', section);
    if (!wrap || !canvas || !list || !items.length) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) { section.classList.add('scene--static'); return; }

    const count = items.length;
    let W = 0, H = 0, scale = 1;
    let progress = 0, activeIndex = -1, ticking = false, visible = true;
    let staticMode = reducedMotion;

    // Optional photographic frame sequence
    const sequence = { images: [], ready: false };
    if (FRAMES.count > 0) {
      let loaded = 0, failed = false;
      for (let i = 1; i <= FRAMES.count; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.src = `${FRAMES.dir}${String(i).padStart(FRAMES.pad, '0')}.${FRAMES.ext}`;
        img.onload = () => { if (++loaded === FRAMES.count && !failed) { sequence.ready = true; draw(); } };
        img.onerror = () => { failed = true; sequence.ready = false; };
        sequence.images.push(img);
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width; H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.min(W * 1.78, H * 2.55) * 0.95;
      staticMode = reducedMotion || window.innerHeight < 520;
      section.classList.toggle('scene--static', staticMode);
      update(true);
    }

    function drawSequence(angle) {
      const idx = Math.round((angle / TAU) * FRAMES.count) % FRAMES.count;
      const img = sequence.images[(idx + FRAMES.count) % FRAMES.count];
      if (!img || !img.naturalWidth) return false;
      const r = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const w = img.naturalWidth * r, h = img.naturalHeight * r;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      return true;
    }

    function draw() {
      if (!W || !H) return;
      const angle = staticMode ? 0.7 : progress * TAU;
      ctx.clearRect(0, 0, W, H);

      if (sequence.ready && drawSequence(angle)) return;

      const project = makeProjector(angle, W, H, scale);

      // ground plate + scan plane
      drawGroundRing(ctx, project, 1.18, 0, 0.16, '255,255,255', false);
      drawGroundRing(ctx, project, 0.92, 0, 0.08, '255,255,255', true);

      if (!staticMode) {
        const sweep = (Math.sin(performance.now() / 1400) * 0.5 + 0.5) * 0.78;
        drawGroundRing(ctx, project, 0.74, sweep, 0.22, LIME, false);
      }

      // reflection
      ctx.save();
      drawLoft(ctx, MESH.body, project, 0.1, true, LIME);
      drawLoft(ctx, MESH.cabin, project, 0.1, true, LIME);
      drawWheels(ctx, project, 0.08, true, LIME);
      ctx.restore();

      // car
      drawLoft(ctx, MESH.body, project, 1, false, LIME);
      drawLoft(ctx, MESH.cabin, project, 0.92, false, '255,255,255');
      drawWheels(ctx, project, 0.85, false, LIME);

      const spot = HOTSPOTS[clamp(activeIndex, 0, HOTSPOTS.length - 1)];
      if (spot) {
        const pulse = staticMode ? 0.4 : (performance.now() % 2000) / 2000;
        drawHotspot(ctx, project, spot, pulse);
      }
    }

    function setActive(index) {
      if (index === activeIndex) return;
      activeIndex = index;
      items.forEach((el, i) => el.classList.toggle('is-active', i === index));
      if (stepEl) {
        stepEl.textContent = `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
      }
    }

    const centreOf = (el) => el.offsetTop + el.offsetHeight / 2;

    // Slides the list so the item matching the current rotation sits in the
    // middle of the masked window, and returns that item's index so the
    // highlight can never drift out of sync with the position.
    function positionList() {
      if (staticMode) { list.style.transform = ''; return 0; }

      const t = progress * (count - 1);
      const i = clamp(Math.floor(t), 0, count - 1);
      const next = Math.min(i + 1, count - 1);
      const f = clamp(t - i, 0, 1);
      // dwell on each item, then move briskly to the next
      const e = f < 0.3 ? 0 : f > 0.85 ? 1 : (f - 0.3) / 0.55;
      const eased = e * e * (3 - 2 * e);

      const target = lerp(centreOf(items[i]), centreOf(items[next]), eased);
      list.style.transform = `translate3d(0, ${(viewport.clientHeight / 2 - target).toFixed(1)}px, 0)`;

      let best = 0, bestDist = Infinity;
      items.forEach((el, idx) => {
        const d = Math.abs(centreOf(el) - target);
        if (d < bestDist) { bestDist = d; best = idx; }
      });
      return best;
    }

    function update(force) {
      if (staticMode) {
        setActive(0);
        list.style.transform = '';
        draw();
        return;
      }
      const rect = wrap.getBoundingClientRect();
      const travel = wrap.offsetHeight - stage.offsetHeight;
      const next = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
      if (!force && Math.abs(next - progress) < 0.0004) return;
      progress = next;

      setActive(positionList());

      if (angleEl) {
        const deg = Math.min(Math.round(progress * 360), 359);
        angleEl.textContent = `${String(deg).padStart(3, '0')}°`;
      }
      if (bar) bar.style.width = `${(progress * 100).toFixed(1)}%`;
      draw();
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { ticking = false; update(false); });
    }

    // Keep the scan sweep and hotspot pulse alive only while the scene is on
    // screen, and at a third of the frame rate — it is ambient motion, not
    // something worth heating a phone over.
    let rafId = null, tick = 0;
    function loop() {
      if (!visible || staticMode) { rafId = null; return; }
      if (tick++ % 3 === 0) draw();
      rafId = requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !rafId && !staticMode) loop();
      }, { rootMargin: '10% 0px' }).observe(section);
    } else {
      loop();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);

    resize();
    // Fonts can shift item heights; re-measure once they settle.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => update(true));
  }

  /* ------------------------------------------------------------------ boot */

  function boot() {
    initHeader();
    initMobileMenu();
    initHeroSplit();
    initReveals();
    initFaqAccordion();
    initBookingFlow();
    initApprovalForm();
    initFloatingWhatsApp();
    initYear();
    initScene();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
