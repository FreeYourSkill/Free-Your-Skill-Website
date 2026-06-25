# FYS SPA — Design Spec

**Datum:** 2026-06-25
**Ziel:** Bestehende Multi-Page-Site (Free Your Skill Agency) zu einer Single-Page-App umbauen. Design + Funktionalität polieren, eng am bestehenden Look. FTP-deploybar ohne Build-Step.

---

## 1. Constraints

- **Kein Build-Step.** Vanilla HTML/CSS/JS. Ein Ordner auf FTP → läuft sofort.
- **Hash-Routing** (`#/...`) — kein Server-Rewrite nötig (FTP-safe).
- **Eng am Original.** Gleiche Farben, Schriften, Inhalte, Sektionsstruktur. Nur runder.
- **Fallback:** Alle bestehenden `.html`-Dateien bleiben erhalten (funktionieren weiter als statische Seiten).

## 2. Architektur

### Dateien (neu / geändert)
```
index.html      → SPA-Shell, enthält alle Views als <section data-view="...">
app.js          → Hash-Router + View-Switching + bestehende UI-Logik
style.css       → bestehend + View-Transitions + Motion-Politur
assets/         → unverändert
```

### Fallback (bleibt unverändert)
```
agency.html, about.html, impressum.html, datenschutz.html, script.js
```

### Router
- Hash-basiert: `window.location.hash` → View-ID.
- Routen:
  | Hash | View |
  |------|------|
  | `#/` (oder leer) | Intro-Splash |
  | `#/agency` | Agency-Hauptseite |
  | `#/about` | About |
  | `#/tournament` | Coming-soon |
  | `#/impressum` | Impressum |
  | `#/datenschutz` | Datenschutz |
- Unbekannter Hash → Redirect auf `#/`.
- Bei Routenwechsel: alte View ausblenden, neue einblenden (Transition), `scrollTo(0,0)`, Reveal-Animationen neu triggern, `<title>` + aktiver Nav-State aktualisieren.

## 3. Views

Inhalte = bestehende Seiten 1:1 übernommen.

- **Intro-Splash** (`#/`): Logo, Tagline, zwei Karten (Agency → `#/agency`, Tournament → `#/tournament`), Minimal-Footer mit Legal-Links + Social.
- **Agency** (`#/agency`): Header-Nav, Hero, Leistungen, Vorteile, Prozess, USP/Troubleshooting, Garantie, Reviews, FAQ, Turnier-Teaser, Kontakt, Footer.
- **About** (`#/about`): About-Hero, Was macht die Agentur, Formate, Der Mann dahinter, Polaroid-Galerie, Dual-CTA, Instagram-Teaser, Footer.
- **Tournament** (`#/tournament`): Coming-soon. Tournament-Logo, Titel, kurzer Text ("Bald verfügbar"), Back-Button zur Agency, Social-Links.
- **Impressum / Datenschutz**: Legal-Inhalte (bestehend).

## 4. Funktionalität

### Kontaktformular → mailto
- Pflichtfeld-Validierung (Name, E-Mail, Nachricht) clientseitig vor Absenden.
- Bei valide: baue `mailto:info@freeyourskill.com?subject=...&body=...` aus Feldern (Name, E-Mail, Betreff-Select, Nachricht), öffne Mailclient.
- Fehlende Felder: Inline-Fehlermeldung, kein Absenden.
- E-Mail-Format simpel per Regex/`type=email`-Check.

### Navigation
- Alle internen Links nutzen Hash-Routen → kein Page-Reload.
- Anker innerhalb einer View (z.B. `#kontakt` auf Agency) → smooth-scroll nach Routenwechsel.
- Burger/Mobile-Nav: Link-Klick schließt Overlay + routet.

### Tournament
- Alle "Zum Turnier"-Buttons + Tournament-Karte → `#/tournament` (Coming-soon-View).

## 5. Motion-Politur

- **View-Transitions:** sanftes Fade/Slide-up beim Routenwechsel (CSS-Transition auf `.view--active`).
- **Hover-States:** Buttons (Lift + Glow), Karten (bestehende Scale beibehalten/verfeinern).
- **Scroll-Reveals:** bestehender IntersectionObserver bleibt; nach Routenwechsel neu angewandt auf sichtbare View.
- **Parallax:** bestehend, bleibt.
- `prefers-reduced-motion`: Transitions/Animationen reduzieren.

## 6. Komponenten-Grenzen (app.js)

Klar getrennte Funktionen, jede eine Aufgabe:
- `initRouter()` — Hash-Listener, View-Switching, Title/Nav-State.
- `showView(id)` — Ein/Ausblenden + Transition + scroll + reveal re-trigger.
- `initNav()` — Burger/Mobile-Overlay.
- `initFAQ()` — Accordion.
- `initReveal()` — IntersectionObserver (re-run-fähig pro View).
- `initParallax()` — Scroll-Parallax.
- `initContactForm()` — Validierung + mailto.
- `initSmoothScroll()` — In-View-Anker.

## 7. Testing / Verifikation

- Lokaler Server (Preview), durch alle Routen klicken.
- Screenshots: Intro, Agency, About, Tournament, Legal.
- Formular: leeres Absenden (Fehler), valides Absenden (mailto öffnet).
- Mobile-Viewport (Burger-Nav, Routing).
- `prefers-reduced-motion` greift.
- Bildpfade laden (ASCII-safe Namen, bereits gefixt).

## 8. FTP-Deliverables

```
index.html
app.js
style.css
assets/
+ (Fallback) agency.html, about.html, impressum.html, datenschutz.html, script.js
```
Ein Ordner hochladen → läuft.

## 9. Out of Scope (YAGNI)

- Kein echtes Backend, keine DB.
- Kein Tournament-System (nur Coming-soon).
- Kein echter Instagram-Feed (Platzhalter bleibt).
- Keine Cookie-Banner/Analytics (keine Tracker eingebaut).
