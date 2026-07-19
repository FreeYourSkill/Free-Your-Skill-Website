#!/usr/bin/env node
/* ============================================
   FREE YOUR SKILL — STATIC PAGE BUILD
   ============================================
   Quelle bleibt index.html (eine Datei, alle Views als <section data-view>).
   Dieses Skript erzeugt daraus je Route eine echte Seite mit sauberer URL:

     /              /agency/       /about/
     /tournament/   /impressum/    /datenschutz/

   Autoren-Prinzip unveraendert: weiterhin index.html / app.js / style.css pflegen.
   Ausgabe landet in dist/ (Netlify publish-Verzeichnis).
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://freeyourskill.com';

/* ---- Routen: View -> saubere URL + Ausgabedatei ---- */
const ROUTES = [
  { view: 'home',        url: '/',             out: 'index.html' },
  { view: 'agency',      url: '/agency/',      out: path.join('agency', 'index.html') },
  { view: 'about',       url: '/about/',       out: path.join('about', 'index.html') },
  { view: 'tournament',  url: '/tournament/',  out: path.join('tournament', 'index.html') },
  { view: 'impressum',   url: '/impressum/',   out: path.join('impressum', 'index.html') },
  { view: 'datenschutz', url: '/datenschutz/', out: path.join('datenschutz', 'index.html') }
];

/* Statische Dateien, die 1:1 nach dist/ kopiert werden */
const COPY_FILES = [
  'style.css',
  'app.js',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'apple-touch-icon.png'
];
const COPY_DIRS = ['assets'];

/* ============================================
   Hilfsfunktionen
   ============================================ */

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function attr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function text(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/* Element ab startIdx per Tag-Tiefe sauber ausschneiden (verschachtelte Tags korrekt) */
function extractElement(html, startIdx, tag) {
  const tokenRe = new RegExp('<' + tag + '\\b|</' + tag + '\\s*>', 'gi');
  tokenRe.lastIndex = startIdx;
  let depth = 0;
  let m;
  while ((m = tokenRe.exec(html)) !== null) {
    if (m[0][1] === '/') {
      depth--;
      if (depth === 0) return html.slice(startIdx, m.index + m[0].length);
    } else {
      depth++;
    }
  }
  throw new Error('Unbalanced <' + tag + '> ab Index ' + startIdx);
}

/* Objekt-Literal aus app.js lesen (TITLES / DESCRIPTIONS / OG_DESCRIPTIONS),
   damit Titel & Beschreibungen nicht doppelt gepflegt werden muessen. */
function extractObjectLiteral(src, name) {
  const marker = 'const ' + name + ' = ';
  const i = src.indexOf(marker);
  if (i === -1) throw new Error('Nicht gefunden in app.js: ' + name);
  const start = src.indexOf('{', i);
  let depth = 0;
  let inStr = null;
  let escaped = false;
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (inStr) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(start, k + 1);
    }
  }
  throw new Error('Unbalanciertes Objekt in app.js: ' + name);
}

function loadObject(src, name) {
  // eslint-disable-next-line no-new-func
  return new Function('return ' + extractObjectLiteral(src, name))();
}

/* Hash-Links -> saubere URLs.  #/agency/kontakt -> /agency/#kontakt  */
function rewriteLinks(html) {
  return html.replace(/href="#\/([^"]*)"/g, (full, rest) => {
    const parts = String(rest).split('/').filter(Boolean);
    if (parts.length === 0) return 'href="/"';
    const route = ROUTES.filter(r => r.view === parts[0])[0];
    if (!route) return 'href="/"';
    return 'href="' + route.url + (parts[1] ? '#' + parts[1] : '') + '"';
  });
}

/* Relative Asset-Pfade -> root-absolut (noetig in /about/, /agency/ ...) */
function rewriteAssets(html) {
  return html
    .replace(/(src|href)="assets\//g, '$1="/assets/')
    .replace(/href="style\.css"/g, 'href="/style.css"')
    .replace(/src="app\.js"/g, 'src="/app.js"');
}

function prepare(html) {
  return rewriteAssets(rewriteLinks(html));
}

/* View-Section aktiv schalten (CSS versteckt .view ohne .view--active) */
function activateView(sectionHtml) {
  const tagEnd = sectionHtml.indexOf('>');
  const openTag = sectionHtml
    .slice(0, tagEnd + 1)
    .replace(/class="([^"]*)"/, 'class="$1 view--active view--enter"');
  return openTag + sectionHtml.slice(tagEnd + 1);
}

function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDir(from, to) {
  mkdirp(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/* ============================================
   Quelle einlesen und zerlegen
   ============================================ */

const src = read('index.html');
const appSrc = read('app.js');

const TITLES = loadObject(appSrc, 'TITLES');
const DESCRIPTIONS = loadObject(appSrc, 'DESCRIPTIONS');
const OG_DESCRIPTIONS = loadObject(appSrc, 'OG_DESCRIPTIONS');

/* <head>: gemeinsame Bestandteile behalten, seitenspezifische Tags ersetzen */
const headInner = src.slice(src.indexOf('<head>') + '<head>'.length, src.indexOf('</head>'));
const headCommon = headInner
  .replace(/^[ \t]*<title>[\s\S]*?<\/title>[ \t]*\r?\n/im, '')
  .replace(/^[ \t]*<meta\s+name="description"[^>]*>[ \t]*\r?\n/im, '')
  .replace(/^[ \t]*<meta\s+property="og:title"[^>]*>[ \t]*\r?\n/im, '')
  .replace(/^[ \t]*<meta\s+property="og:description"[^>]*>[ \t]*\r?\n/im, '')
  .replace(/^[ \t]*<meta\s+property="og:type"[^>]*>[ \t]*\r?\n/im, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

/* Header + Mobile-Nav (auf jeder Seite identisch) */
const headerHtml = extractElement(src, src.indexOf('<header id="header"'), 'header');
const mobileNavHtml = extractElement(src, src.indexOf('<div class="mobile-nav" id="mobileNav">'), 'div');

/* Views aus <main id="app"> */
const mainOpen = '<main id="app">';
const mainStart = src.indexOf(mainOpen);
const mainEnd = src.indexOf('</main>');
const mainInner = src.slice(mainStart + mainOpen.length, mainEnd);

const views = {};
const viewRe = /<section[^>]*data-view="([a-z]+)"[^>]*>/gi;
let vm;
while ((vm = viewRe.exec(mainInner)) !== null) {
  views[vm[1]] = extractElement(mainInner, vm.index, 'section');
  viewRe.lastIndex = vm.index + 1;
}

/* Alles zwischen </main> und app.js: Footer-Template, verstecktes Netlify-Formular,
   Instagram-Consent-Script. Kommt unveraendert auf jede Seite. */
const tailHtml = src.slice(mainEnd + '</main>'.length, src.indexOf('<script src="app.js"></script>'));

/* Umleitung alter Hash-Links (/#/about -> /about/). Laeuft vor dem Rendern. */
const hashRedirect =
  '<script>(function(){var h=location.hash;if(h.indexOf("#/")!==0)return;' +
  'var p=h.replace(/^#\\/?/,"").split("/").filter(Boolean);' +
  'var m=' + JSON.stringify(ROUTES.reduce((acc, r) => { acc[r.view] = r.url; return acc; }, {})) + ';' +
  'var u=m[p[0]]||"/";if(p[1])u+="#"+p[1];location.replace(u);})();</script>';

/* Ohne JS bleiben [data-reveal]-Bloecke sonst unsichtbar */
const noscriptReveal =
  '<noscript><style>[data-reveal]{opacity:1 !important;transform:none !important;}</style></noscript>';

/* ============================================
   Seiten schreiben
   ============================================ */

fs.rmSync(DIST, { recursive: true, force: true });
mkdirp(DIST);

const preparedHeader = prepare(headerHtml);
const preparedNav = prepare(mobileNavHtml);
const preparedTail = prepare(tailHtml);
const preparedHead = prepare(headCommon);

for (const route of ROUTES) {
  const view = views[route.view];
  if (!view) throw new Error('View fehlt in index.html: ' + route.view);

  const canonical = SITE + route.url;
  const title = TITLES.de[route.view];
  const desc = DESCRIPTIONS.de[route.view];
  if (!title || !desc) throw new Error('Titel/Description fehlt fuer: ' + route.view);

  const page =
`<!DOCTYPE html>
<html lang="de">
<head>
${preparedHead}
  <title>${text(title)}</title>
  <meta name="description" content="${attr(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(OG_DESCRIPTIONS.de)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="de_DE">
  ${hashRedirect}
  ${noscriptReveal}
</head>
<body data-route="${route.view}" data-page="${route.view}">

${preparedHeader}

${preparedNav}

  <main id="app">
${activateView(prepare(view))}
  </main>
${preparedTail}
  <script src="/app.js"></script>
</body>
</html>
`;

  const outPath = path.join(DIST, route.out);
  mkdirp(path.dirname(outPath));
  fs.writeFileSync(outPath, page, 'utf8');
  console.log('  page   ' + route.url.padEnd(15) + ' -> dist/' + route.out.replace(/\\/g, '/'));
}

/* ---- sitemap.xml ---- */
const lastmod = new Date().toISOString().slice(0, 10);
const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(r => `  <url>
    <loc>${SITE}${r.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r.view === 'home' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');
console.log('  file   /sitemap.xml');

/* ---- robots.txt ---- */
const robots =
`User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST, 'robots.txt'), robots, 'utf8');
console.log('  file   /robots.txt');

/* ---- statische Dateien kopieren ---- */
for (const file of COPY_FILES) {
  const from = path.join(ROOT, file);
  if (!fs.existsSync(from)) { console.warn('  WARN   fehlt, uebersprungen: ' + file); continue; }
  fs.copyFileSync(from, path.join(DIST, file));
}
for (const dir of COPY_DIRS) {
  const from = path.join(ROOT, dir);
  if (!fs.existsSync(from)) { console.warn('  WARN   fehlt, uebersprungen: ' + dir + '/'); continue; }
  copyDir(from, path.join(DIST, dir));
}

console.log('\nBuild fertig: ' + ROUTES.length + ' Seiten in dist/');
