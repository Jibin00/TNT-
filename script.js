(() => {
  'use strict';

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
        <dt>Decision</dt><dd>${labels[d.decision] ?? d.decision}</dd>
        <dt>Notes</dt><dd>${d.notes ? escapeHtml(d.notes) : '—'}</dd>
        <dt>Submitted</dt><dd>${escapeHtml(when)}</dd>
      </dl>`;
  }

  function $(sel, root = document) { return root.querySelector(sel); }
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function setError(el, msg) {
    if (!el) return;
    el.textContent = msg ?? '';
    el.hidden = !msg;
    let field;
    if (el.dataset.errorFor === 'decision') {
      field = el.closest('.field');
    } else {
      field = el.closest('.field') ?? el.parentElement;
    }
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