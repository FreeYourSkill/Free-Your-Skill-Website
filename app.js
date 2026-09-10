/* ============================================
   FREE YOUR SKILL — SPA
   Vanilla JS Hash-Router + UI-Logik
   ============================================ */

(() => {
  'use strict';

  const VIEWS = ['home', 'agency', 'about', 'tournament', 'impressum', 'datenschutz'];

  // Saubere URLs pro View (Multipage-Build). Auch fuer die Hash-Umleitung genutzt.
  const ROUTE_URLS = {
    home: '/',
    agency: '/agency/',
    about: '/about/',
    tournament: '/tournament/',
    impressum: '/impressum/',
    datenschutz: '/datenschutz/'
  };

  // Multipage-Modus: build.js erzeugt pro Route eine eigene Seite und setzt <body data-page="...">.
  // Ohne data-page laeuft die Quelldatei index.html unveraendert als Hash-SPA weiter.
  const PAGE = document.body ? document.body.getAttribute('data-page') : null;
  const isMultiPage = !!PAGE && VIEWS.indexOf(PAGE) !== -1;

  const TITLES = {
    de: {
      home: 'Free Your Skill — Verbinden, Planen, Supporten aus Hamburg',
      agency: 'Agency — Verbinden, Planen, Supporten | Free Your Skill Hamburg',
      about: 'Über uns — Free Your Skill Agency Hamburg',
      tournament: 'Tournament (Coming soon) — Free Your Skill',
      impressum: 'Impressum — Free Your Skill',
      datenschutz: 'Datenschutz — Free Your Skill'
    },
    en: {
      home: 'Free Your Skill — Connect, Plan, Support from Hamburg',
      agency: 'Agency — Connect, Plan, Support | Free Your Skill Hamburg',
      about: 'About — Free Your Skill Agency Hamburg',
      tournament: 'Tournament (Coming soon) — Free Your Skill',
      impressum: 'Imprint — Free Your Skill',
      datenschutz: 'Privacy — Free Your Skill'
    }
  };

  const DESCRIPTIONS = {
    de: {
      home: 'Free Your Skill aus Hamburg: Ich verbinde Kreative und Auftraggeber und begleite Projekte, bis sie stehen. Aus der Szene, für die Szene. Fair und transparent.',
      agency: 'Eventplanung, Vermittlung und Projekt-Support aus einer Hand. Die Agentur aus der Szene in Hamburg, deutschlandweit tätig. Fair, transparent, ohne Vertragsbindung.',
      about: 'Free Your Skill — gegründet von Philipp Müller. Artist, Sales- und Eventmanager mit über 15 Jahren in der Kreativszene. Aus Hamburg, deutschlandweit tätig.',
      tournament: 'Das Free Your Skill Tournament ist in Vorbereitung. Alle Stile, jedes Level. Bald geht es los.',
      impressum: 'Impressum der Free Your Skill Agency, Philipp Müller, Hamburg.',
      datenschutz: 'Datenschutzerklärung der Free Your Skill Agency.'
    },
    en: {
      home: 'Free Your Skill from Hamburg: I connect creatives and clients and see projects through until they’re done. From the scene, for the scene. Fair and transparent.',
      agency: 'Event planning, booking and project support from a single source. The agency from within the scene in Hamburg, active nationwide. Fair, transparent, no lock-in.',
      about: 'Free Your Skill — founded by Philipp Müller. Artist, sales and event manager with over 15 years in the creative scene. From Hamburg, active nationwide.',
      tournament: 'The Free Your Skill Tournament is in preparation. All styles, every level. Coming soon.',
      impressum: 'Imprint of Free Your Skill Agency, Philipp Müller, Hamburg.',
      datenschutz: 'Privacy policy of Free Your Skill Agency.'
    }
  };

  // OG-Description pro Sprache. Das statische Tag bleibt DE (Social-Scraper lesen ohne JS);
  // im Browser aktualisiert applyLang() es bei Sprachwechsel.
  const OG_DESCRIPTIONS = {
    de: 'Ich verbinde Kreative und Auftraggeber und begleite Projekte, bis sie stehen. Aus der Szene, für die Szene.',
    en: 'I connect creatives and clients and see projects through until they’re done. From the scene, for the scene.'
  };

  const metaDesc = document.querySelector('meta[name="description"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  let currentLang = 'de';

  // Default highlighted nav link per view (used when no specific anchor is active)
  const NAV_DEFAULT = {
    about: '#/about',
    agency: '#/agency/leistungen',
    tournament: '#/tournament'
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

  // Aktive View: im Multipage-Modus aus <body data-page>, sonst aus dem Hash.
  function currentView() {
    return isMultiPage ? PAGE : parseHash().view;
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
    document.title = (TITLES[currentLang] && TITLES[currentLang][view]) || 'Free Your Skill';
    if (metaDesc && DESCRIPTIONS[currentLang] && DESCRIPTIONS[currentLang][view]) {
      metaDesc.setAttribute('content', DESCRIPTIONS[currentLang][view]);
    }

    // nav active state: exact hash match, else the view's default link (only when no anchor)
    const curHash = '#/' + view + (anchor ? '/' + anchor : '');
    document.querySelectorAll('.header__link').forEach(link => {
      const href = link.getAttribute('href');
      const active = href === curHash || (!anchor && href === NAV_DEFAULT[view]);
      link.classList.toggle('header__link--active', active);
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

  /* ---- CONTACT FORM -> Netlify Forms (fetch, kein mailto) ---- */
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

    // ---- Conditional fields by Betreff (Unternehmen / Künstler / Privat) ----
    const BETREFF_LABELS = {
      unternehmen: 'Unternehmen / Marke',
      kuenstler: 'Artist',
      dienstleister: 'Dienstleister / Fachkraft',
      privat: 'Privatperson',
      allgemein: 'Allgemeine Anfrage'
    };
    // Which extra inputs belong to which Betreff (Doku; Uebermittlung laeuft per FormData)
    const COND_FIELDS = {
      unternehmen: [['suche', 'Was suchst du'], ['eventart', 'Art des Projekts/Anlass']],
      privat: [['suche', 'Was suchst du'], ['eventart', 'Art des Projekts/Anlass']],
      kuenstler: [['disziplin', 'Disziplin/Skill'], ['links', 'Links']],
      dienstleister: [['fachgebiet', 'Fachgebiet'], ['portfolio', 'Links/Portfolio']]
    };
    const conds = form.querySelectorAll('.form-conditional');

    function syncConditional() {
      const val = fields.betreff.value;
      conds.forEach(c => {
        const list = (c.dataset.cond || '').trim().split(/\s+/);
        c.classList.toggle('is-active', list.indexOf(val) !== -1);
      });
    }
    fields.betreff.addEventListener('change', syncConditional);
    syncConditional();

    // Deep-Link: ?anliegen=... waehlt das passende Anliegen vor und blendet
    // die Zusatzfelder ein. Das Scrollen zu #kontakt uebernimmt initMultiPage().
    try {
      const ANLIEGEN = { unternehmen: 'unternehmen', artist: 'kuenstler', dienstleister: 'dienstleister' };
      const wanted = ANLIEGEN[new URLSearchParams(window.location.search).get('anliegen')];
      if (wanted) {
        fields.betreff.value = wanted;
        syncConditional();
      }
    } catch (e) {}

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

      // ---- Netlify Forms: alle Felder url-encoded per fetch an "/" senden (kein mailto mehr) ----
      const submitBtn = form.querySelector('button[type="submit"]');
      const statusEl = form.querySelector('.form-hint');
      if (statusEl) {
        statusEl.classList.remove('form-hint--ok', 'form-hint--error');
        statusEl.textContent = currentLang === 'en' ? 'Sending…' : 'Wird gesendet…';
      }
      if (submitBtn) submitBtn.disabled = true;

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          syncConditional();
          if (statusEl) {
            statusEl.textContent = currentLang === 'en'
              ? 'Thank you! Your message has been sent — I’ll get back to you as soon as possible.'
              : 'Danke! Deine Nachricht ist angekommen — ich melde mich so schnell wie möglich bei dir.';
            statusEl.classList.add('form-hint--ok');
          }
        })
        .catch(() => {
          if (statusEl) {
            statusEl.textContent = currentLang === 'en'
              ? 'Something went wrong. Please email me directly at info@freeyourskill.com.'
              : 'Etwas ist schiefgelaufen. Schreib mir gern direkt an info@freeyourskill.com.';
            statusEl.classList.add('form-hint--error');
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    // clear error on input
    Object.keys(fields).forEach(k => {
      if (fields[k]) fields[k].addEventListener('input', () => setError(k, ''));
    });
  }

  /* ============================================
     I18N — DE (default) / EN
     Text-node level translation; unmapped strings stay German (safe fallback).
     ============================================ */
  const DICT = {
    // Nav
    'Leistungen': 'Services', 'Turnier': 'Tournament', 'Kontakt': 'Contact',
    // Intro / splash
    'VERBINDEN · PLANEN · SUPPORTEN': 'CONNECT · PLAN · SUPPORT',
    'Impressum': 'Imprint', 'Datenschutz': 'Privacy',
    'Datenschutzerklärung': 'Privacy Policy',
    // Hero
    'Befreie deinen': 'Free your',
    'Große Pläne, aber allein kommst du nicht weiter? Ich verbinde, plane und zieh dein Projekt mit dir durch. Aus der Szene, für die Szene.':
      'Big plans, but you can’t get there alone? I connect, plan and see your project through with you. From the scene, for the scene.',
    'LASS MAL CONNECTEN!': 'LET’S CONNECT!',
    // Was macht FYS
    'Was macht': 'What is',
    'Eine Agentur für kreative Verbindungen, mit klarer Kommunikation und verlässlicher Umsetzung. Ich bringe Talente, Dienstleister, Auftraggebende und Projekte zusammen: fair, professionell und auf Augenhöhe.':
      'An agency for creative connections, with clear communication and reliable execution. I bring talents, service providers, clients and projects together: fair, professional and on equal footing.',
    'Eventplanung': 'Event Planning',
    'Von Konzept bis Durchführung, live und digital: Firmen-Events, Messen, Festivals, Community-Events und Workshops. Ich plane und realisiere Events, die wirken.':
      'From concept to delivery, live and digital: corporate events, trade fairs, festivals, community events and workshops. I plan and deliver events that work.',
    'Vermittlung': 'Booking & Placement',
    'Ich verbinde dich mit den richtigen Leuten: Artists aus Tanz, Musik und Moderation, dazu Creator, Dienstleister und Fachkräfte etwa für Foto, Video, Technik oder Web. Passend, fair und auf Augenhöhe.':
      'I connect you with the right people: artists in dance, music and hosting, plus creators, service providers and specialists for photo, video, tech or web, for example. A good fit, fair and on equal footing.',
    'Projekt-Support': 'Project Support',
    'Projektassistenz und Beratung, Content-, Video- und Fotoproduktion, Livestreaming: ich manage und begleite dein Projekt von A bis Z, auch nach dem Event.':
      'Project assistance and consulting, content, video and photo production, livestreaming: I manage and support your project from A to Z, even after the event.',
    'Über mich erfahren': 'Learn about me',
    // Vorteile
    'Vorteile der': 'Benefits of', 'Zusammenarbeit': 'working together',
    'Als Auftraggeber': 'For Clients',
    '(Unternehmen & Privatpersonen)': '(Companies & Private Individuals)',
    'Zugang zu einem kuratierten Talent-Netzwerk': 'Access to a curated talent network',
    'Zuverlässige Planung & Durchführung': 'Reliable planning & delivery',
    'Ein Ansprechpartner für alles': 'One contact for everything',
    'Transparente Preise, keine versteckten Kosten': 'Transparent pricing, no hidden costs',
    'Content-Produktion aus einer Hand': 'Content production from a single source',
    'Als Auftraggeber anfragen': 'Enquire as a client',
    'Als Artist': 'For Artists',
    'Faire Vermittlung & transparente Konditionen': 'Fair placement & transparent terms',
    'Zugang zu spannenden Projekten & Events': 'Access to exciting projects & events',
    'Persönliche Betreuung & ehrliche Kommunikation': 'Personal support & honest communication',
    'Unterstützung bei Selbstvermarktung': 'Support with self-marketing',
    'Community & Netzwerk': 'Community & network',
    'Als Artist anfragen': 'Enquire as an artist',
    'Als Dienstleister': 'For Service Providers',
    'Passende Projekte statt Kaltakquise': 'Fitting projects instead of cold outreach',
    'Faire, transparente Konditionen': 'Fair, transparent terms',
    'Ein verlässlicher Partner statt anonymer Plattform': 'A reliable partner instead of an anonymous platform',
    'Zugang zu Auftraggebern und Netzwerk': 'Access to clients and network',
    'Du lieferst dein Handwerk, ich halte den Rest zusammen': 'You deliver your craft, I hold the rest together',
    'Als Dienstleister anfragen': 'Enquire as a service provider',
    // About: zweizeilige Bild-CTA-Labels (ein Textknoten mit Zeilenumbruch,
    // dadurch eigener Key statt Kollision mit den Vorteile-Uebersetzungen oben)
    'Als Auftraggeber\nAnfragen': 'As a client\nGet in touch',
    'Als Artist\nAnfragen': 'As an artist\nGet in touch',
    'Als Dienstleister\nAnfragen': 'As a service provider\nGet in touch',
    // Prozess
    'Wie läuft': 'How it', 'es ab': 'works',
    'Verstehen': 'Understand',
    'Kostenloses Erstgespräch: ich höre zu und verstehe dein Projekt.': 'Free initial consultation: I listen and understand your project.',
    'Planen': 'Plan',
    'Ich entwickle ein individuelles Konzept mit klaren Schritten.': 'I develop a tailored concept with clear steps.',
    'Umsetzen': 'Execute',
    'Professionelle Durchführung mit laufender Kommunikation.': 'Professional delivery with ongoing communication.',
    'Begleiten': 'Support',
    'Auch nach dem Projekt stehe ich an deiner Seite.': 'I stay by your side even after the project.',
    'Zum Formular': 'To the form',
    // Quotes
    '„Transparent. Fair. Miteinander.“': '„Transparent. Fair. Together.“',
    '„Verstehen, bevor ich plane. Planen, bevor ich umsetze. Begleiten, auch nach dem Projekt.“':
      '„Understand before I plan. Plan before I execute. Support, even after the project.“',
    // USP — Einer für alles
    'EINER FÜR': 'ONE FOR', 'ALLES': 'EVERYTHING',
    '. VON IDEE BIS UMSETZUNG.': '. FROM IDEA TO EXECUTION.',
    'Bereit': 'Ready to', 'loszulegen': 'Create',
    'Ich bin nicht der Dienstleister, der bucht und sich verabschiedet. Ich bin der eine Ansprechpartner, der dein Netzwerk, deine Orga und dein Nervenkostüm zusammenhält, von der ersten Idee bis zur Umsetzung. Weil ich das Chaos der Szene selbst durchgemacht habe, bleibe ich dran. Kreativ, organisatorisch und persönlich.':
      'I’m not the service provider who books you and disappears. I’m the one contact who keeps your network, your logistics and your sanity together, from the first idea to the finished project. Because I’ve lived the chaos of the scene myself, I stay on it. Creatively, organizationally and personally.',
    // Garantie
    'Klare Absprachen,': 'Clear Terms,', 'Deine Entscheidung': 'Your Call',
    // Testimonials
    'Stimmen aus der Szene': 'Voices from the scene',
    'Was andere': 'What others', 'sagen': 'say',
    '„Man hat sich als Künstler jederzeit professionell betreut gefühlt. Besonders schön: Das Wohlergehen der Künstler steht klar im Vordergrund. Rückfragen wurden stets schnell und zuverlässig beantwortet. Eine rundum empfehlenswerte Zusammenarbeit!“':
      '„As an artist, you always felt professionally supported. What’s especially nice: the artists’ wellbeing is clearly the priority. Questions were always answered quickly and reliably. A thoroughly recommendable collaboration!“',
    'Musicaldarstellerin, Schauspielerin, Showgirl, Sängerin, Tänzerin, Choreografin & Model':
      'Musical performer, actress, showgirl, singer, dancer, choreographer & model',
    '„Die Zusammenarbeit mit Phil beim ‘Artist Room’ Event in Hamburg war von Anfang bis Ende professionell, strukturiert und auf Augenhöhe. Besonders bei Organisation und Troubleshooting vor Ort hat er auch in stressigen Situationen den Überblick behalten. Klare Empfehlung und gerne wieder!“':
      '„Working with Phil on the ‘Artist Room’ event in Hamburg was professional, well structured and on equal footing from start to finish. Especially with organisation and on-site troubleshooting, he kept the overview even in stressful situations. Clear recommendation and happy to work with him again!“',
    'Sänger, Rapper & Songwriter': 'Singer, Rapper & Songwriter',
    '„Phil hat uns bei der Organisation unserer ersten Veranstaltung ‘Art meets Poetry’ mit seiner Expertise in Eventmanagement, Content und Marketing tatkräftig unterstützt. Mit kreativen Ideen, wertvollen Tipps, Flexibilität und viel positiver Energie war er eine große Unterstützung für unser Projekt. Die Zusammenarbeit war sowohl fachlich als auch menschlich unglaublich wertvoll und hat einfach Spaß gemacht.“':
      '„Phil supported us in organising our first event ‘Art meets Poetry’ with his expertise in event management, content and marketing. With creative ideas, valuable tips, flexibility and a lot of positive energy, he was a great support for our project. The collaboration was incredibly valuable both professionally and personally, and it was simply fun.“',
    'Tänzerin, Tanzlehrerin, Spoken-Word Artist, Pädagogin': 'Dancer, dance teacher, spoken-word artist, educator',
    'Alle Pakete und Einzelleistungen sind für Unternehmen, Agenturen, Talente, Dienstleister und Privatpersonen buchbar.':
      'All packages and individual services can be booked by companies, agencies, talents, service providers and private individuals.',
    'Wir klären alles in einem kostenfreien Erstgespräch, und ich kalkuliere fair. Keine versteckten Kosten, keine langfristige Bindung. Eine exklusive Zusammenarbeit ist möglich, wenn du sie willst, aber kein Muss, das entscheidest du. Was ich für dich vermittle, halten wir vorher offen und schriftlich fest, fair für alle Seiten. Du bleibst frei in deinen Entscheidungen.':
      'We sort everything out in a free initial consultation, and I calculate fairly. No hidden costs, no long-term commitment. An exclusive collaboration is possible if you want it, but it’s not a must, that’s your call. Whatever I arrange for you, we put down openly and in writing beforehand, fair for all sides. You stay free in your decisions.',
    // FAQ
    'Häufig gestellte': 'Frequently asked', 'Fragen': 'questions',
    'Wer bist, was machst du, was habe ich davon?': 'Who are you, what do you do, what is in it for me?',
    'Free Your Skill (FYS) ist die Agentur aus Hamburg, die Talente, Events und Unternehmen verbindet. Ich plane Projekte, vermittle passende Talente und Dienstleister und biete Support während und nach dem Projekt. Für dich heißt das: direkte Vernetzung, Projektplanung, laufende Betreuung, faire und transparente Preise sowie deutschlandweite und digitale Einsätze.':
      'Free Your Skill (FYS) is the agency from Hamburg connecting talents, events and companies. I plan projects, place the right talents and service providers and provide support during and after the project. For you that means: direct networking, project planning, ongoing support, fair and transparent pricing as well as nationwide and digital assignments.',
    'Was kostet eine Zusammenarbeit?': 'What does working together cost?',
    'Die Kosten hängen vom Umfang des Projekts ab. In einem kostenlosen Erstgespräch kläre ich alles und erstelle ein individuelles Angebot. Ich kalkuliere fair und transparent; der Einstieg ist schon im niedrigen dreistelligen Bereich möglich.':
      'Costs depend on the scope of the project. In a free initial consultation I clarify everything and create a tailored offer. I price fairly and transparently; entry is possible already in the low three-digit range.',
    'Für wen ist die Agentur geeignet?': 'Who is the agency for?',
    'Für Unternehmen, Agenturen, Talente und Dienstleister jeder Art und auch Privatpersonen. Ob du einen Artist oder Dienstleister für dein Projekt brauchst oder selbst vermittelt werden möchtest: ich bin für dich da.':
      'For companies, agencies, talents and service providers of any kind and private clients too. Whether you need an artist or service provider for your project or want to be placed yourself: I am here for you.',
    'Vermittelst du nur Artists oder auch andere Dienstleister?': 'Do you only place artists or other service providers too?',
    'Beides. Ich vermittle Artists genauso wie Dienstleister und Fachkräfte, etwa für Foto, Video, Technik oder Web. Für mich zählt, die richtigen Leute für dein Projekt zusammenzubringen, ob kreativ oder geschäftlich.':
      'Both. I place artists just as much as service providers and specialists, for photo, video, tech or web, for example. What matters to me is bringing the right people together for your project, whether creative or business.',
    'Was unterscheidet dich von einer klassischen Agentur?': 'What sets you apart from a classic agency?',
    'Bei mir hast du einen Ansprechpartner statt drei. Ich komme selbst aus der Szene, kenne beide Seiten und bleibe vom ersten Gespräch bis nach dem Projekt an deiner Seite. Kein Booking-Automat, sondern ein Partner, der dranbleibt.':
      'With me you get one contact instead of three. I come from the scene myself, know both sides and stay by your side from the first conversation to after the project. Not a booking machine, but a partner who stays on it.',
    'Gibt es eine Vertragsbindung?': 'Is there a lock-in contract?',
    'Nein! Ich arbeite projektbasiert und ohne langfristige Vertragsbindung. Transparenz und Fairness stehen bei mir an erster Stelle.':
      'No! I work project-based and without long-term lock-in. Transparency and fairness come first.',
    'Wie funktioniert die Vermittlung?': 'How does placement work?',
    'Du sagst mir, was du brauchst. Ich schlage passende Talente oder Dienstleister vor. Die Vermittlungsprovision vereinbare ich individuell und kommuniziere sie immer offen und transparent.':
      'You tell me what you need. I suggest suitable talents or service providers. The placement fee is agreed individually and always communicated openly and transparently.',
    'In welcher Region ist FYS aktiv?': 'Which region does FYS operate in?',
    'Ich bin in Hamburg ansässig, arbeite aber deutschlandweit und auch digital für Online-Events und Livestreams.':
      'I am based in Hamburg but work nationwide and also digitally for online events and livestreams.',
    // Turnier teaser
    'Alle Stile und jedes Level sind willkommen. Mein Online-Turnier bringt die Community zusammen.':
      'All styles and every level are welcome. My online tournament brings the community together.',
    'Zum Turnier': 'To the tournament',
    // Kontakt
    'Du hast eine Idee? Ich helfe dir, sie sichtbar zu machen.': 'Got an idea? I help you make it visible.',
    'Ich bin / mein Anliegen': 'I am / my enquiry',
    'Bitte wählen...': 'Please choose...',
    'Unternehmen / Marke': 'Company / Brand',
    'Künstler / Artist': 'Artist',
    'Dienstleister / Fachkraft': 'Service provider / specialist',
    'Privatperson': 'Private client',
    'Allgemeine Anfrage': 'General enquiry',
    'Was suchst du?': 'What are you looking for?',
    'Art des Projekts / Anlass': 'Type of project / occasion',
    'Disziplin / Skill': 'Discipline / skill',
    'Links (Portfolio, Instagram)': 'Links (portfolio, Instagram)',
    'Fachgebiet (Foto, Video, Technik, Web ...)': 'Field (photo, video, tech, web ...)',
    'Links / Portfolio': 'Links / portfolio',
    'Nachricht': 'Message', 'Abschicken': 'Send',
    'Öffnet dein E-Mail-Programm mit vorausgefüllter Nachricht.': 'Opens your email app with a pre-filled message.',
    // About
    'Über Free Your Skill — die Agentur aus Hamburg': 'About Free Your Skill — the agency from Hamburg',
    '„Die besten Sachen entstehen, wenn die richtigen Menschen, Ideen und Projekte zusammenfinden, egal wie verrückt es zuerst klingt.“':
      '„The best things happen when the right people, ideas and projects come together, no matter how crazy it sounds at first.“',
    'Was macht die': 'What does the', 'Agentur': 'agency',
    'Free Your Skill ist eine Agentur für kreative Verbindungen. Ich plane Events, vermittle Talente und Dienstleister und produziere Content, alles aus einer Hand.':
      'Free Your Skill is an agency for creative connections. I plan events, place talents and service providers and produce content, all from a single source.',
    'Kontaktieren': 'Get in touch',
    'Welche': 'Which', 'Formate': 'formats',
    'Für welche Projekte vermittle ich Talente und Dienstleister?': 'What projects do I place talents and service providers for?',
    'Firmen-Events & Messen': 'Corporate events & trade fairs',
    'Kultur- & Kunst-Veranstaltungen': 'Cultural & art events',
    'Community-Events & Workshops': 'Community events & workshops',
    'Festivals & Open Airs': 'Festivals & open airs',
    'Online-Turniere & Livestreams': 'Online tournaments & livestreams',
    'Content- & Videoproduktionen': 'Content & video productions',
    'Vermittlung von Dienstleistern & Fachkräften (z. B. Foto, Video, Technik, Web)':
      'Placement of service providers & specialists (e.g. photo, video, tech, web)',
    'Der Mann': 'The man', 'dahinter': 'behind it',
    'Gründer & Kopf der Agentur': 'Founder & head of the agency',
    'Ich bin keine Agentur, die von außen auf die Szene schaut. Ich bin Teil von ihr. Ich komme aus der Tanzszene und habe jahrelang selbst als Artist auf der Bühne gestanden. Heute liegt mein Fokus auf der anderen Seite, aber die Bühne und ihre Tücken kenne ich aus erster Hand, das Chaos, die Abhängigkeiten und die Unzuverlässigkeit dieser Branche.':
      'I’m not an agency that looks at the scene from the outside. I’m part of it. I come from the dance scene and spent years on stage as an artist myself. Today my focus is on the other side, but I know the stage and its pitfalls first-hand: the chaos, the dependencies and the unreliability of this industry.',
    'Mit Background als Artist, Sales- & Eventmanager bringe ich Know-how von beiden Seiten mit. Seit 2009 in der Kreativszene, als Artist, Creator und Supporter, auch wenn ich heute seltener selbst auftrete. Dazu kommen Eventtechnik und Eventmarketing. Genau dieses Wissen bündle ich an einem Ort, damit du dir den Stress sparst, mit dem ich mich selbst lange genug herumgeschlagen habe.':
      'With a background as an artist, sales and event manager, I bring know-how from both sides. In the creative scene since 2009 as an artist, creator and supporter, even if I perform less often myself these days. On top of that come event tech and event marketing. I bundle exactly this knowledge in one place, so you’re spared the stress I struggled with for long enough myself.',
    'Und das ist der Kern: Ich bin nicht der Dienstleister, der bucht und sich verabschiedet. Ich bin der eine Ansprechpartner, der dein Netzwerk, deine Orga und dein Nervenkostüm zusammenhält, von der ersten Idee bis zur Umsetzung. Weil ich das Chaos der Szene selbst durchgemacht habe, weißt du, dass ich dranbleibe, kreativ, organisatorisch und persönlich.':
      'And that’s the core: I’m not the service provider who books you and disappears. I’m the one contact who keeps your network, your logistics and your sanity together, from the first idea to the finished project. Because I’ve lived the chaos of the scene myself, you know I’ll stay on it, creatively, organizationally and personally.',
    'Keine drei Kontakte, keine endlosen Abstimmungsschleifen zwischen Kreation, Booking und Organisation.':
      'No three contacts, no endless feedback loops between creation, booking and organization.',
    'Ein starkes Netzwerk, gebündelt in einer Person, die an deiner Seite bleibt.':
      'One strong network, bundled in one person who stays by your side.',
    'Mein Motto: Each One Teach One. Miteinander kommen wir weiter als gegeneinander. Lass mal connecten.':
      'My motto: Each One Teach One. Together we get further than against each other. Let’s connect.',
    'Jahre Vertrieb & Kundenkontakt': 'years of sales & client contact',
    'Jahre Eventmanagement': 'years of event management',
    'Jahre in der Kreativszene': 'years in the creative scene',
    'Folge mir auf': 'Follow me on',
    'Hier zeige ich meine aktuellen Instagram-Beiträge. Zum Laden wird eine Verbindung zu Instagram/Meta (USA) hergestellt, dabei kann deine IP-Adresse übertragen werden.':
      'Here I show my current Instagram posts. Loading them establishes a connection to Instagram/Meta (USA), and your IP address may be transmitted.',
    'Mehr in der Datenschutzerklärung': 'See our privacy policy',
    'Auswahl merken': 'Remember my choice',
    'Instagram-Beiträge laden': 'Load Instagram posts',
    'Anfragen': 'Enquire', 'Bewerben': 'Apply',
    // Tournament coming soon
    'Mein Online-Turnier ist in Vorbereitung. Alle Stile, jedes Level, die Community kommt zusammen. Bald geht’s los.':
      'My online tournament is in preparation. All styles, every level, the community comes together. Coming soon.',
    'Zur Agency': 'To the agency', 'Updates auf Instagram': 'Updates on Instagram',
    // Footer
    'Verbinden · Planen · Supporten': 'Connect · Plan · Support',
    'Navigation': 'Navigation', 'Rechtliches': 'Legal',
    '© 2025 Free Your Skill Agency. Alle Rechte vorbehalten. ·': '© 2025 Free Your Skill Agency. All rights reserved. ·',
    // Legal back buttons
    '← Zurück zur Startseite': '← Back to home'
  };

  // Placeholder translations by element id
  const PLACEHOLDERS = {
    name: ['Dein Name', 'Your name'],
    email: ['deine@email.de', 'you@email.com'],
    suche: ['z. B. Artist, Dienstleister, Event-Unterstützung', 'e.g. artist, service provider, event support'],
    eventart: ['z. B. Firmenfeier, Messe, Kampagne, Geburtstag', 'e.g. company party, trade fair, campaign, birthday'],
    disziplin: ['z. B. Tanz, Musik, Moderation', 'e.g. dance, music, hosting'],
    links: ['@profil / Website', '@profile / website'],
    fachgebiet: ['z. B. Fotografie, Videoschnitt, Lichttechnik, Web', 'e.g. photography, video editing, lighting, web'],
    portfolio: ['Website / @profil', 'website / @profile'],
    nachricht: ['Erzähl mir von deinem Projekt...', 'Tell me about your project...']
  };

  let i18nNodes = null; // [{node, de, lead, trail}]

  function collectI18nNodes() {
    i18nNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('.lang-toggle')) return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      const m = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
      const core = m[2];
      if (DICT[core] !== undefined) {
        i18nNodes.push({ node, de: core, lead: m[1], trail: m[3] });
      }
    }
  }

  function applyLang(lang) {
    currentLang = lang;
    if (!i18nNodes) collectI18nNodes();
    i18nNodes.forEach(rec => {
      const txt = (lang === 'en' && DICT[rec.de] != null) ? DICT[rec.de] : rec.de;
      rec.node.nodeValue = rec.lead + txt + rec.trail;
    });
    // placeholders
    Object.keys(PLACEHOLDERS).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('placeholder', PLACEHOLDERS[id][lang === 'en' ? 1 : 0]);
    });
    // toggle button active state
    document.querySelectorAll('.lang-toggle .lang-toggle__opt').forEach(opt => {
      opt.classList.toggle('is-active', opt.dataset.lang === lang);
    });
    // html lang + title/meta for current route
    document.documentElement.setAttribute('lang', lang);
    const view = currentView();
    document.title = (TITLES[lang] && TITLES[lang][view]) || document.title;
    if (metaDesc && DESCRIPTIONS[lang] && DESCRIPTIONS[lang][view]) {
      metaDesc.setAttribute('content', DESCRIPTIONS[lang][view]);
    }
    if (ogDesc && OG_DESCRIPTIONS[lang]) {
      ogDesc.setAttribute('content', OG_DESCRIPTIONS[lang]);
    }
    try { localStorage.setItem('fys-lang', lang); } catch (e) {}
  }

  function initLang() {
    let saved = 'de';
    try { saved = localStorage.getItem('fys-lang') || 'de'; } catch (e) {}
    [document.getElementById('langToggle'), document.getElementById('langToggleMobile')].forEach(btn => {
      if (btn) btn.addEventListener('click', () => {
        applyLang(currentLang === 'de' ? 'en' : 'de');
        closeMobileNav();
      });
    });
    if (saved === 'en') applyLang('en'); else applyLang('de');
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

  /* ---- MULTIPAGE INIT (eine View pro Seite, saubere URL, kein Hash-Router) ---- */
  function initMultiPage() {
    const target = document.querySelector('#app [data-view]');
    if (target) {
      target.classList.add('view--active');
      observeRevealsIn(target);
    }
    // Nav-Highlight anhand des Pfads (z. B. /agency/ -> "Leistungen"/"FAQ" gehoeren zu /agency/)
    const path = window.location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('.header__link').forEach(link => {
      const base = (link.getAttribute('href') || '').split('#')[0];
      link.classList.toggle('header__link--active', base === path);
    });
    // Anker beim Direktaufruf ansteuern (z. B. /agency/#kontakt), mit Header-Offset
    const hash = window.location.hash;
    if (hash && hash.length > 1 && hash.indexOf('#/') !== 0) {
      requestAnimationFrame(() => {
        let el = null;
        try { el = document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) {}
        if (el) {
          const offset = header ? header.offsetHeight + 20 : 0;
          const top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        }
      });
    }
    onScroll();
  }

  /* ---- TESTIMONIALS: 3D-COVERFLOW-KARUSSELL ----
     Iteriert generisch ueber alle .testimonial-Karten im Track (keine feste
     Anzahl, neue Karten in der Quelle werden automatisch Teil des Karussells).
     Steuert nur data-state/aria-hidden auf den bestehenden Karten — fasst
     Text/Bilder/DICT nicht an, stoert die TreeWalker-Uebersetzung also nicht. */
  function initTestimonialsCarousel() {
    const carousel = document.getElementById('testimonialsCarousel');
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialsPrev');
    const nextBtn = document.getElementById('testimonialsNext');
    if (!carousel || !track) return;

    const cards = Array.prototype.slice.call(track.querySelectorAll(':scope > .testimonial'));
    if (cards.length === 0) return;

    const AUTOPLAY_MS = 6500;
    const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    let active = 0;
    let timer = null;
    let isHovering = false;
    let isFocused = false;

    function render() {
      const n = cards.length;
      cards.forEach((card, i) => {
        let diff = i - active;
        if (diff > n / 2) diff -= n;
        if (diff < -n / 2) diff += n;

        let state;
        if (diff === 0) state = 'active';
        else if (diff === -1 || (n === 2 && diff === 1)) state = 'prev';
        else if (diff === 1) state = 'next';
        else state = 'far';

        card.dataset.state = state;
        // prev/next sind sichtbar UND anklickbar -> nicht vor Screenreadern/Tastatur verstecken.
        // Nur die unsichtbaren "far"-Karten (bei >3 Testimonials) bleiben ausgeblendet.
        const clickable = state === 'prev' || state === 'next';
        card.setAttribute('aria-hidden', state === 'far' ? 'true' : 'false');
        if (clickable) {
          card.setAttribute('role', 'button');
          card.setAttribute('tabindex', '0');
          card.setAttribute('aria-label',
            (state === 'prev' ? 'Vorheriges Testimonial anzeigen / Show previous testimonial' : 'Nächstes Testimonial anzeigen / Show next testimonial'));
        } else {
          card.removeAttribute('role');
          card.removeAttribute('aria-label');
          card.setAttribute('tabindex', '-1');
        }
      });
    }

    function goTo(i) {
      const n = cards.length;
      active = ((i % n) + n) % n;
      render();
    }
    // Nach manueller Navigation nur weiterlaufen lassen, wenn gerade NICHT
    // gehovert/fokussiert wird — sonst bliebe es beim Hover ja nicht wirklich stehen.
    function next() { goTo(active + 1); startAutoplay(); }
    function prev() { goTo(active - 1); startAutoplay(); }

    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function startAutoplay() {
      stopAutoplay();
      if (reduceMotion || cards.length < 2 || isHovering || isFocused) return;
      timer = setInterval(() => { goTo(active + 1); }, AUTOPLAY_MS);
    }

    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Klick auf eine sichtbare Nachbar-Karte (links/rechts im Hintergrund) wechselt zu ihr
    track.addEventListener('click', (e) => {
      const card = e.target.closest('.testimonial');
      if (!card) return;
      if (card.dataset.state === 'prev') prev();
      else if (card.dataset.state === 'next') next();
    });
    track.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.testimonial');
      if (!card) return;
      if (card.dataset.state === 'prev') { e.preventDefault(); prev(); }
      else if (card.dataset.state === 'next') { e.preventDefault(); next(); }
    });

    // Pausiert Autoplay, solange die Maus ueber der Sektion ist oder ein
    // Pfeil/eine Nachbar-Karte den Fokus haelt — bleibt dabei wirklich stehen,
    // auch wenn zwischendurch geklickt wird (kein automatischer Neustart).
    carousel.addEventListener('mouseenter', () => { isHovering = true; stopAutoplay(); });
    carousel.addEventListener('mouseleave', () => { isHovering = false; startAutoplay(); });
    carousel.addEventListener('focusin', () => { isFocused = true; stopAutoplay(); });
    carousel.addEventListener('focusout', () => { isFocused = false; startAutoplay(); });

    // Wischen (Touch)
    let touchStartX = null;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      if (touchStartX == null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      else { startAutoplay(); }
      touchStartX = null;
    }, { passive: true });

    render();
    startAutoplay();
  }

  /* ---- INIT ---- */
  function init() {
    setupReveal();
    injectFooters();
    initFAQ();
    initParallax();
    initContactForm();
    initLinks();
    initLang();
    initTestimonialsCarousel();

    if (burger) burger.addEventListener('click', () => {
      mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    if (isMultiPage) {
      // Echte Seiten mit sauberen URLs: kein Hash-Router, kein Hash-Normalisieren.
      initMultiPage();
    } else {
      window.addEventListener('hashchange', route);
      // normalize empty hash to home
      if (!window.location.hash) window.location.replace('#/');
      route();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
