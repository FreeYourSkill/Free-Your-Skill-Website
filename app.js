/* ============================================
   FREE YOUR SKILL — SPA
   Vanilla JS Hash-Router + UI-Logik
   ============================================ */

(() => {
  'use strict';

  const VIEWS = ['home', 'agency', 'about', 'tournament', 'impressum', 'datenschutz'];

  const TITLES = {
    home: 'Free Your Skill',
    agency: 'Free Your Skill Agency',
    about: 'Über uns — Free Your Skill',
    tournament: 'Tournament — Free Your Skill',
    impressum: 'Impressum — Free Your Skill',
    datenschutz: 'Datenschutz — Free Your Skill'
  };

  // Header nav links highlight per route
  const NAV_MATCH = {
    about: ['#/about'],
    agency: ['#/agency/leistungen', '#/agency/faq', '#/agency/kontakt'],
    tournament: ['#/tournament']
  };

  const header = document.getElementById('header');
  const mobileNav = document.getElementById('mobileNav');
  const burger = document.querySelector('.header__burger');
  const footerTemplate = document.getElementById('footerTemplate');
  let revealObserver = null;

  /* ---- ROUTE PARSING ---- */
  // "#/agency/kontakt" -> { view: "agency", anchor: "kontakt" }
  function parseHash() {
    let raw = window.location.hash.replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    let view = parts[0] || 'home';
    const anchor = parts[1] || null;
    if (!VIEWS.includes(view)) view = 'home';
    return { view, anchor };
  }

  /* ---- FOOTER INJECTION (once per view) ---- */
  function injectFooters() {
    if (!footerTemplate) return;
    document.querySelectorAll('[data-footer]').forEach(slot => {
      if (slot.dataset.filled) return;
      slot.appendChild(footerTemplate.content.cloneNode(true));
      slot.dataset.filled = '1';
    });
  }

  /* ---- REVEAL (re-runnable per view) ---- */
  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.02 });
  }

  function observeRevealsIn(viewEl) {
    if (!revealObserver) return;
    viewEl.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => revealObserver.observe(el));
  }

  /* ---- VIEW SWITCHING ---- */
  function showView(view, anchor) {
    const target = document.querySelector(`[data-view="${view}"]`);
    if (!target) return;

    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('view--active', v === target);
    });

    document.body.setAttribute('data-route', view);
    document.title = TITLES[view] || 'Free Your Skill';

    // nav active state
    document.querySelectorAll('.header__link').forEach(link => {
      const href = link.getAttribute('href');
      const matches = (NAV_MATCH[view] || []).includes(href);
      link.classList.toggle('header__link--active', matches);
    });

    // restart entry animation
    target.classList.remove('view--enter');
    void target.offsetWidth; // reflow
    target.classList.add('view--enter');

    // reveal animations for this view
    observeRevealsIn(target);

    // scroll handling
    if (anchor) {
      // wait a tick so layout is ready
      requestAnimationFrame(() => {
        const el = target.querySelector('#' + CSS.escape(anchor));
        if (el) {
          const offset = (view === 'home') ? 0 : header.offsetHeight + 20;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      });
    } else {
      window.scrollTo(0, 0);
    }
  }

  /* ---- ROUTER ---- */
  function route() {
    const { view, anchor } = parseHash();
    closeMobileNav();
    showView(view, anchor);
    onScroll(); // sync header scrolled state
  }

  /* ---- HEADER SCROLL EFFECT ---- */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 80) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }

  /* ---- MOBILE NAV ---- */
  function openMobileNav() {
    mobileNav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (document.body.getAttribute('data-route') !== 'home') {
      document.body.style.overflow = '';
    }
  }

  /* ---- FAQ ACCORDION (delegated) ---- */
  function initFAQ() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.faq-item__question');
      if (!btn) return;
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      const list = item.closest('.faq-list');
      if (list) list.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  }

  /* ---- PARALLAX ---- */
  function initParallax() {
    window.addEventListener('scroll', () => {
      document.querySelectorAll('.view--active .parallax-divider__img').forEach(img => {
        const rect = img.parentElement.getBoundingClientRect();
        const windowH = window.innerHeight;
        if (rect.top < windowH && rect.bottom > 0) {
          const progress = (windowH - rect.top) / (windowH + rect.height);
          img.style.transform = `translateY(${(progress - 0.5) * -80}px)`;
        }
      });
    }, { passive: true });
  }

  /* ---- CONTACT FORM -> mailto ---- */
  function initContactForm() {
    const form = document.getElementById('kontaktForm');
    if (!form) return;

    const fields = {
      name: form.querySelector('#name'),
      email: form.querySelector('#email'),
      betreff: form.querySelector('#betreff'),
      nachricht: form.querySelector('#nachricht')
    };

    function setError(field, msg) {
      const span = form.querySelector(`[data-error-for="${field}"]`);
      if (span) span.textContent = msg || '';
      if (fields[field]) fields[field].classList.toggle('input--error', !!msg);
    }

    function validEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;

      if (!fields.name.value.trim()) { setError('name', 'Bitte Namen angeben.'); ok = false; }
      else setError('name', '');

      if (!fields.email.value.trim()) { setError('email', 'Bitte E-Mail angeben.'); ok = false; }
      else if (!validEmail(fields.email.value.trim())) { setError('email', 'Ungültige E-Mail.'); ok = false; }
      else setError('email', '');

      if (!fields.nachricht.value.trim()) { setError('nachricht', 'Bitte Nachricht eingeben.'); ok = false; }
      else setError('nachricht', '');

      if (!ok) {
        const firstErr = form.querySelector('.input--error');
        if (firstErr) firstErr.focus();
        return;
      }

      const betreff = fields.betreff.value || 'Allgemeine Anfrage';
      const subject = `[FYS Anfrage] ${betreff} — ${fields.name.value.trim()}`;
      const body =
        `Name: ${fields.name.value.trim()}\n` +
        `E-Mail: ${fields.email.value.trim()}\n` +
        `Betreff: ${betreff}\n\n` +
        `${fields.nachricht.value.trim()}\n`;

      const mailto = `mailto:info@freeyourskill.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;

      const hint = form.querySelector('.form-hint');
      if (hint) {
        hint.textContent = 'E-Mail-Programm geöffnet. Falls nichts passiert, schreib direkt an info@freeyourskill.com.';
        hint.classList.add('form-hint--ok');
      }
    });

    // clear error on input
    Object.keys(fields).forEach(k => {
      if (fields[k]) fields[k].addEventListener('input', () => setError(k, ''));
    });
  }

  /* ---- INTERNAL LINK CLICKS (data-link) ---- */
  function initLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#/')) return;
      // same route+anchor? still want scroll, so handle via hashchange.
      if (href === window.location.hash) {
        e.preventDefault();
        route(); // re-run (e.g. scroll to anchor again)
      }
      // otherwise let hashchange fire naturally
    });
  }

  /* ---- INIT ---- */
  function init() {
    setupReveal();
    injectFooters();
    initFAQ();
    initParallax();
    initContactForm();
    initLinks();

    if (burger) burger.addEventListener('click', () => {
      mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', route);

    // normalize empty hash to home
    if (!window.location.hash) window.location.replace('#/');
    route();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
