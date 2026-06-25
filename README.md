# Free Your Skill — Website

Single-Page-Website der Free Your Skill Agency (Inhaber: Philipp Müller).
Vanilla HTML/CSS/JS, **kein Build-Step** — Ordner auf FTP laden, läuft sofort.

## Struktur

| Datei | Zweck |
|-------|-------|
| `index.html` | SPA-Shell, alle Views (Hash-Routing) |
| `app.js` | Router + UI-Logik (Nav, FAQ, Formular, Reveal, Parallax) |
| `style.css` | Komplettes Styling, responsive 320px → 4K |
| `assets/` | Bilder & Logos |
| `agency.html`, `about.html`, `impressum.html`, `datenschutz.html`, `script.js` | Statische Fallback-Seiten (funktionieren auch ohne JS) |

## Routen (Hash-basiert, FTP-safe)

`#/` Intro · `#/agency` · `#/about` · `#/tournament` (Coming soon) · `#/impressum` · `#/datenschutz`

## Deploy

Per FTP hochladen:

```
index.html  app.js  style.css  assets/
agency.html  about.html  impressum.html  datenschutz.html  script.js
```

Kein Server, keine Datenbank, kein Build nötig. Kontaktformular nutzt `mailto:`.

## Lokal testen

```bash
npx serve .
# oder
python3 -m http.server 8000
```

---
© Free Your Skill Agency
