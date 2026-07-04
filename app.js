/* ============================================
   FREE YOUR SKILL — SPA
   Vanilla JS Hash-Router + UI-Logik
   ============================================ */

(() => {
  'use strict';

  const VIEWS = ['home', 'agency', 'about', 'tournament', 'impressum', 'datenschutz'];

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
      privat: 'Privatperson',
      allgemein: 'Allgemeine Anfrage'
    };
    // Which extra inputs belong to which Betreff, with human labels for the mail body
    const COND_FIELDS = {
      unternehmen: [['firma', 'Unternehmen/Marke'], ['eventart', 'Art des Events/Projekts']],
      kuenstler: [['disziplin', 'Disziplin/Skill'], ['links', 'Links']],
      privat: [['anlass', 'Anlass']]
    };
    const conds = form.querySelectorAll('.form-conditional');

    function syncConditional() {
      const val = fields.betreff.value;
      conds.forEach(c => c.classList.toggle('is-active', c.dataset.cond === val));
    }
    fields.betreff.addEventListener('change', syncConditional);
    syncConditional();

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
    // Hero
    'Befreie deinen': 'Free your',
    'Große Pläne, aber allein kommst du nicht weiter? Ich verbinde, plane und zieh dein Projekt mit dir durch. Aus der Szene, für die Szene.':
      'Big plans, but you can’t get there alone? I connect, plan and see your project through with you. From the scene, for the scene.',
    'LASS MAL CONNECTEN!': 'LET’S CONNECT!',
    // Was macht FYS
    'Was macht': 'What is',
    'Eine Agentur für kreative Verbindungen, mit klarer Kommunikation und verlässlicher Umsetzung. Ich bringe Talente, Auftraggebende und Projekte zusammen: fair, professionell und auf Augenhöhe.':
      'An agency for creative connections, with clear communication and reliable execution. I bring talents, clients and projects together: fair, professional and on equal footing.',
    'Eventplanung': 'Event Planning',
    'Von Konzept bis Durchführung, live und digital: Firmen-Events, Messen, Festivals, Community-Events und Workshops. Ich plane und realisiere Events, die wirken.':
      'From concept to delivery, live and digital: corporate events, trade fairs, festivals, community events and workshops. I plan and deliver events that work.',
    'Vermittlung': 'Booking & Placement',
    'Ich verbinde Talente mit Auftraggebenden: Tänzer, Musiker, Artists, Moderatoren und Creator. Passend, fair und auf Augenhöhe.':
      'I connect talents with clients: dancers, musicians, artists, hosts and creators. A good fit, fair and on equal footing.',
    'Projekt-Support': 'Project Support',
    'Beratung, Content- und Videoproduktion, Foto und Livestreaming: ich begleite dein Projekt von A bis Z, auch nach dem Event.':
      'Consulting, content and video production, photo and livestreaming: I support your project from A to Z, even after the event.',
    'Über mich erfahren': 'Learn about me',
    // Vorteile
    'Vorteile der': 'Benefits of', 'Zusammenarbeit': 'working together',
    'Als Unternehmen': 'For Companies',
    'Zugang zu einem kuratierten Talent-Netzwerk': 'Access to a curated talent network',
    'Zuverlässige Planung & Durchführung': 'Reliable planning & delivery',
    'Ein Ansprechpartner für alles': 'One contact for everything',
    'Transparente Preise, keine versteckten Kosten': 'Transparent pricing, no hidden costs',
    'Content-Produktion aus einer Hand': 'Content production from a single source',
    'Als Unternehmen anfragen': 'Enquire as a company',
    'Als Artist': 'For Artists',
    'Faire Vermittlung & transparente Konditionen': 'Fair placement & transparent terms',
    'Zugang zu spannenden Projekten & Events': 'Access to exciting projects & events',
    'Persönliche Betreuung & ehrliche Kommunikation': 'Personal support & honest communication',
    'Unterstützung bei Selbstvermarktung': 'Support with self-marketing',
    'Community & Netzwerk': 'Community & network',
    'Als Artist bewerben': 'Apply as an artist',
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
    'Garantie &': 'Guarantee &', 'keine Vertragsbindung': 'no lock-in',
    // Testimonials
    'Stimmen aus der Szene': 'Voices from the scene',
    'Was andere': 'What others', 'sagen': 'say',
    '„Man hat sich als Künstler jederzeit professionell betreut gefühlt. Besonders schön: Das Wohlergehen der Künstler steht klar im Vordergrund. Rückfragen wurden stets schnell und zuverlässig beantwortet. Eine rundum empfehlenswerte Zusammenarbeit!“':
      '„As an artist, you always felt professionally supported. What’s especially nice: the artists’ wellbeing is clearly the priority. Questions were always answered quickly and reliably. A thoroughly recommendable collaboration!“',
    'Musicaldarstellerin, Schauspielerin, Showgirl, Sängerin, Tänzerin, Choreografin & Model':
      'Musical performer, actress, showgirl, singer, dancer, choreographer & model',
    'Alle Pakete und Einzelleistungen sind sowohl für Unternehmen, Agenturen und Talente jeglicher Art als auch für Privatpersonen buchbar.':
      'All packages and individual services are bookable by companies, agencies, talents of any kind and private clients alike.',
    'Die Inhalte werden in einem kostenfreien Erstgespräch individuell abgestimmt und fair kalkuliert. Keine versteckten Kosten, keine Vertragsbindung.':
      'Everything is tailored in a free initial consultation and priced fairly. No hidden costs, no lock-in.',
    // FAQ
    'Häufig gestellte': 'Frequently asked', 'Fragen': 'questions',
    'Wer bist, was machst du, was habe ich davon?': 'Who are you, what do you do, what is in it for me?',
    'Free Your Skill (FYS) ist die Agentur aus Hamburg, die Talente, Events und Unternehmen verbindet. Ich plane Projekte, vermittle passende Talente und biete Support während und nach dem Projekt. Für dich heißt das: direkte Vernetzung, Projektplanung, laufende Betreuung, faire und transparente Preise sowie deutschlandweite und digitale Einsätze.':
      'Free Your Skill (FYS) is the agency from Hamburg connecting talents, events and companies. I plan projects, place the right talents and provide support during and after the project. For you that means: direct networking, project planning, ongoing support, fair and transparent pricing as well as nationwide and digital assignments.',
    'Was kostet eine Zusammenarbeit?': 'What does working together cost?',
    'Die Kosten hängen vom Umfang des Projekts ab. In einem kostenlosen Erstgespräch kläre ich alles und erstelle ein individuelles Angebot. Ich kalkuliere fair und transparent; der Einstieg ist schon im niedrigen dreistelligen Bereich möglich.':
      'Costs depend on the scope of the project. In a free initial consultation I clarify everything and create a tailored offer. I price fairly and transparently; entry is possible already in the low three-digit range.',
    'Für wen ist die Agentur geeignet?': 'Who is the agency for?',
    'Für Unternehmen, Agenturen, Talente jeglicher Art und auch Privatpersonen. Ob du einen Artist für dein Event brauchst oder als Artist vermittelt werden möchtest: ich bin für dich da.':
      'For companies, agencies, talents of any kind and private clients too. Whether you need an artist for your event or want to be placed as an artist: I am here for you.',
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
    'Privatperson': 'Private client',
    'Allgemeine Anfrage': 'General enquiry',
    'Art des Events / Projekts': 'Type of event / project',
    'Disziplin / Skill': 'Discipline / skill',
    'Links (Instagram, Portfolio)': 'Links (Instagram, portfolio)',
    'Anlass': 'Occasion',
    'Nachricht': 'Message', 'Abschicken': 'Send',
    'Öffnet dein E-Mail-Programm mit vorausgefüllter Nachricht.': 'Opens your email app with a pre-filled message.',
    // About
    'Über Free Your Skill — die Agentur aus Hamburg': 'About Free Your Skill — the agency from Hamburg',
    '„Ich glaube an echte Verbindungen zwischen Menschen, Projekten und Ideen.“':
      '„I believe in real connections between people, projects and ideas.“',
    'Was macht die': 'What does the', 'Agentur': 'agency',
    'Free Your Skill ist eine Agentur für kreative Verbindungen. Ich plane Events, vermittle Talente und produziere Content, alles aus einer Hand.':
      'Free Your Skill is an agency for creative connections. I plan events, place talents and produce content, all from a single source.',
    'Kontaktieren': 'Get in touch',
    'Welche': 'Which', 'Formate': 'formats',
    'Für welche Art von Events vermittelst du Artists?': 'What kind of events do you place artists for?',
    'Firmen-Events & Messen': 'Corporate events & trade fairs',
    'Kultur- & Kunst-Veranstaltungen': 'Cultural & art events',
    'Community-Events & Workshops': 'Community events & workshops',
    'Festivals & Open Airs': 'Festivals & open airs',
    'Online-Turniere & Livestreams': 'Online tournaments & livestreams',
    'Content- & Videoproduktionen': 'Content & video productions',
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
    'Mein Motto: Each One Teach One. Ich glaube an echte Verbindungen zwischen Menschen, Projekten und Ideen, und daran, dass wir miteinander weiterkommen als gegeneinander. Lass mal connecten.':
      'My motto: Each One Teach One. I believe in real connections between people, projects and ideas, and that we get further together than against each other. Let’s connect.',
    'Jahre Vertrieb & Kundenkontakt': 'years of sales & client contact',
    'Jahre Eventmanagement': 'years of event management',
    'Jahre in der Kreativszene': 'years in the creative scene',
    'Folge mir auf': 'Follow me on',
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
    firma: ['Name des Unternehmens', 'Company name'],
    eventart: ['z. B. Firmenfeier, Messe, Kampagne', 'e.g. company party, trade fair, campaign'],
    disziplin: ['z. B. Tanz, Musik, Moderation', 'e.g. dance, music, hosting'],
    links: ['@profil / Website', '@profile / website'],
    anlass: ['z. B. Geburtstag, Hochzeit, privates Event', 'e.g. birthday, wedding, private event'],
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
    const { view } = parseHash();
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

  /* ---- INIT ---- */
  function init() {
    setupReveal();
    injectFooters();
    initFAQ();
    initParallax();
    initContactForm();
    initLinks();
    initLang();

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
