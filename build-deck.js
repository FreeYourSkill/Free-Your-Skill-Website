const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new PptxGenJS();
pres.layout = "LAYOUT_16x9";
pres.author = "Future Now Studio";
pres.title = "FYS Website Mockup — Praesentation";

// ---- FNS BRANDING COLORS ----
const C = {
  purple: "9B8EC8",
  purpleDark: "6B5B95",
  bg: "111111",
  card: "1A1A1A",
  white: "FFFFFF",
  light: "CCCCCC",
  gray: "888888",
  darkLine: "333333",
  // FYS colors for reference slides
  pink: "FE9EC3",
  teal: "70B0B0",
  blue: "2E5984",
};

// ---- IMAGE LOADER ----
function img(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `${mime};base64,${buf.toString("base64")}`;
}

const SS = "/Users/timo/Desktop/Claude/Free your Skill /FYS WEBSEITE/mockup/screenshots";
const BILDER = "/Users/timo/Desktop/Claude/Free your Skill /FYS WEBSEITE/Bilder";
const LOGOS = "/Users/timo/Desktop/Claude/Free your Skill /FYS WEBSEITE/LOGO_FINAL_2.0";

const ss_intro = img(path.join(SS, "01_intro.png"));
const ss_agency_hero = img(path.join(SS, "02_agency_hero.png"));
const ss_agency_full = img(path.join(SS, "03_agency_full.png"));
const ss_about_hero = img(path.join(SS, "04_about_hero.png"));
const ss_about_full = img(path.join(SS, "05_about_full.png"));
const fysLogo = img(path.join(LOGOS, "LOGO_FYS AGENCY_TRANSPARENT_PNG/FYS_Original_weiß_groß.png"));

// ---- SLIDE TEMPLATE ----
function slide(opts = {}) {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  // Left purple accent bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.06, h: 5.625, fill: { color: C.purple } });
  // Bottom line
  s.addShape(pres.shapes.LINE, { x: 0.06, y: 5.55, w: 9.94, h: 0, line: { color: C.darkLine, width: 0.5 } });
  // Footer text
  s.addText("Future Now Studio  ·  FYS Website Mockup", {
    x: 0.3, y: 5.3, w: 5, h: 0.3, fontSize: 7, fontFace: "Arial", color: C.gray, margin: 0
  });
  if (opts.pageNum) {
    s.addText(opts.pageNum, {
      x: 9, y: 5.3, w: 0.7, h: 0.3, fontSize: 7, fontFace: "Arial", color: C.gray, align: "right", margin: 0
    });
  }
  return s;
}

// ============================================
// 1. TITELFOLIE
// ============================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.purple } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.purple } });

  s.addImage({ data: fysLogo, x: 3.5, y: 0.6, w: 3, h: 1.7, sizing: { type: "contain", w: 3, h: 1.7 } });

  s.addText("WEBSITE MOCKUP", {
    x: 0.5, y: 2.5, w: 9, h: 0.8, fontSize: 44, fontFace: "Arial Black", color: C.white, align: "center", charSpacing: 6
  });
  s.addShape(pres.shapes.LINE, { x: 3.5, y: 3.5, w: 3, h: 0, line: { color: C.purple, width: 2 } });
  s.addText([
    { text: "Erstellt von ", options: { color: C.gray } },
    { text: "Future Now Studio", options: { color: C.purple, bold: true } },
  ], { x: 0.5, y: 3.7, w: 9, h: 0.4, fontSize: 14, fontFace: "Arial", align: "center" });
  s.addText("fur Free Your Skill Agency  ·  Philipp Muller", {
    x: 0.5, y: 4.1, w: 9, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.gray, align: "center"
  });
})();

// ============================================
// 2. INTRO-SEITE
// ============================================
(() => {
  const s = slide({ pageNum: "01" });
  s.addText("INTRO-SEITE", {
    x: 0.4, y: 0.3, w: 5, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });
  s.addText("Fullscreen Auswahlseite — kein Scroll", {
    x: 0.4, y: 0.85, w: 5, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.gray, italic: true, margin: 0
  });
  // Screenshot
  s.addImage({ data: ss_intro, x: 0.4, y: 1.3, w: 9.2, h: 4.0,
    sizing: { type: "contain", w: 9.2, h: 4.0 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.4 }
  });
})();

// ============================================
// 3. AGENCY — HERO
// ============================================
(() => {
  const s = slide({ pageNum: "02" });
  s.addText("AGENCY — HERO", {
    x: 0.4, y: 0.3, w: 5, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });
  s.addText("Fullscreen Hero mit Hintergrundbild, Claim & CTA", {
    x: 0.4, y: 0.85, w: 6, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.gray, italic: true, margin: 0
  });
  s.addImage({ data: ss_agency_hero, x: 0.4, y: 1.3, w: 9.2, h: 4.0,
    sizing: { type: "contain", w: 9.2, h: 4.0 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.4 }
  });
})();

// ============================================
// 4. AGENCY — FULL PAGE
// ============================================
(() => {
  const s = slide({ pageNum: "03" });
  s.addText("AGENCY — GESAMTANSICHT", {
    x: 0.4, y: 0.3, w: 6, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });
  s.addText("Alle Sektionen der Startseite im Uberblick", {
    x: 0.4, y: 0.85, w: 6, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.gray, italic: true, margin: 0
  });
  // Full page screenshot - tall, so show as scrollable preview
  s.addImage({ data: ss_agency_full, x: 1.5, y: 1.25, w: 7, h: 4.1,
    sizing: { type: "contain", w: 7, h: 4.1 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.4 }
  });
})();

// ============================================
// 5. ABOUT — HERO
// ============================================
(() => {
  const s = slide({ pageNum: "04" });
  s.addText("ABOUT — HERO", {
    x: 0.4, y: 0.3, w: 5, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });
  s.addText("Hero mit S/W-Foto und Zitat-Overlay", {
    x: 0.4, y: 0.85, w: 6, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.gray, italic: true, margin: 0
  });
  s.addImage({ data: ss_about_hero, x: 0.4, y: 1.3, w: 9.2, h: 4.0,
    sizing: { type: "contain", w: 9.2, h: 4.0 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.4 }
  });
})();

// ============================================
// 6. ABOUT — FULL PAGE
// ============================================
(() => {
  const s = slide({ pageNum: "05" });
  s.addText("ABOUT — GESAMTANSICHT", {
    x: 0.4, y: 0.3, w: 6, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });
  s.addText("Bio, Formate, Galerie, Dual-CTA, Instagram", {
    x: 0.4, y: 0.85, w: 6, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.gray, italic: true, margin: 0
  });
  s.addImage({ data: ss_about_full, x: 1.5, y: 1.25, w: 7, h: 4.1,
    sizing: { type: "contain", w: 7, h: 4.1 },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 3, angle: 135, opacity: 0.4 }
  });
})();

// ============================================
// 7. DESIGN-ENTSCHEIDUNGEN
// ============================================
(() => {
  const s = slide({ pageNum: "06" });
  s.addText("DESIGN-ENTSCHEIDUNGEN", {
    x: 0.4, y: 0.3, w: 7, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });

  const decisions = [
    { what: "Dark Theme", why: "Direkt aus dem PitchDeck ubernommen — schwarzer Hintergrund durchgehend, urban & kreativ" },
    { what: "3 separate Seiten", why: "Wireframes zeigen Intro als eigene Auswahlseite ohne Scroll, Agency & About als eigene Einheiten" },
    { what: "S/W Bilder + Grayscale", why: "In den Wireframes als \"s/w\" annotiert — schafft visuellen Zusammenhalt" },
    { what: "Farbschema 1:1", why: "Pink #FE9EC3, Teal #70B0B0, Blau #2E5984 — direkt aus Farbschema.png" },
    { what: "Bebas Neue Headlines", why: "Grosse, kraftige Display-Schrift passend zur urbanen Dance/Streetwear-Asthetik" },
    { what: "Kantige Buttons", why: "Kein border-radius — urban, direkt, kantig. Passt zum Silhouetten-Logo" },
    { what: "Karten-Reviews statt Slider", why: "Grid fugt sich besser ins dunkle Karten-Design als ein generischer Carousel" },
  ];

  decisions.forEach((d, i) => {
    const y = 1.15 + i * 0.58;
    s.addShape(pres.shapes.OVAL, { x: 0.4, y: y + 0.06, w: 0.14, h: 0.14, fill: { color: C.purple } });
    s.addText(d.what, {
      x: 0.7, y, w: 2.3, h: 0.4, fontSize: 12, fontFace: "Arial", color: C.white, bold: true, valign: "middle", margin: 0
    });
    s.addText(d.why, {
      x: 3.1, y, w: 6.5, h: 0.5, fontSize: 10, fontFace: "Arial", color: C.light, valign: "middle", margin: 0
    });
    if (i < decisions.length - 1) {
      s.addShape(pres.shapes.LINE, { x: 0.4, y: y + 0.53, w: 9.2, h: 0, line: { color: C.darkLine, width: 0.5 } });
    }
  });
})();

// ============================================
// 8. FARBSCHEMA & TYPOGRAFIE
// ============================================
(() => {
  const s = slide({ pageNum: "07" });
  s.addText("FARBSCHEMA & TYPOGRAFIE", {
    x: 0.4, y: 0.3, w: 7, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });

  // Colors
  const colors = [
    { hex: C.pink, label: "Pink · Primary", code: "#FE9EC3" },
    { hex: C.teal, label: "Teal · Secondary", code: "#70B0B0" },
    { hex: C.blue, label: "Blau · Accent", code: "#2E5984" },
    { hex: "0A0A0A", label: "Schwarz · BG", code: "#0A0A0A" },
    { hex: "1A1A1A", label: "Karte · BG", code: "#1A1A1A" },
  ];
  colors.forEach((c, i) => {
    const x = 0.4 + i * 1.85;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 1.6, h: 0.9, fill: { color: c.hex } });
    s.addText(c.code, { x, y: 2.15, w: 1.6, h: 0.25, fontSize: 9, fontFace: "Consolas", color: C.light, margin: 0 });
    s.addText(c.label, { x, y: 2.38, w: 1.6, h: 0.25, fontSize: 8, fontFace: "Arial", color: C.gray, margin: 0 });
  });

  // Fonts
  s.addText("TYPOGRAFIE", { x: 0.4, y: 3.0, w: 4, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.purple, bold: true, charSpacing: 4, margin: 0 });

  s.addText("Bebas Neue", { x: 0.4, y: 3.4, w: 3, h: 0.45, fontSize: 26, fontFace: "Arial Black", color: C.white, margin: 0 });
  s.addText("Display / Headlines — Urban, kraftig, direkt", { x: 3.5, y: 3.4, w: 6, h: 0.45, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "middle", margin: 0 });

  s.addText("Oswald", { x: 0.4, y: 3.95, w: 3, h: 0.4, fontSize: 20, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s.addText("Sub-Headlines / Navigation — Klar, lesbar", { x: 3.5, y: 3.95, w: 6, h: 0.4, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "middle", margin: 0 });

  s.addText("Source Sans 3", { x: 0.4, y: 4.45, w: 3, h: 0.4, fontSize: 15, fontFace: "Arial", color: C.white, margin: 0 });
  s.addText("Fliesstext / Body — Leicht, angenehm zu lesen", { x: 3.5, y: 4.45, w: 6, h: 0.4, fontSize: 11, fontFace: "Arial", color: C.gray, valign: "middle", margin: 0 });
})();

// ============================================
// 9. NACHSTE SCHRITTE
// ============================================
(() => {
  const s = slide({ pageNum: "08" });
  s.addText("NACHSTE SCHRITTE", {
    x: 0.4, y: 0.3, w: 7, h: 0.6, fontSize: 28, fontFace: "Arial Black", color: C.white, margin: 0
  });

  const steps = [
    "Feedback zum Mockup einarbeiten",
    "WordPress + Elementor Pro aufsetzen",
    "Global Colors & Fonts ubertragen",
    "Sektionen in Elementor nachbauen",
    "Kontaktformular + Instagram Plugin",
    "Responsive-Anpassungen (Tablet/Mobile)",
    "Turnier-Seite konzipieren (kein Wireframe vorhanden)",
    "Sedcards- & Jobs-Seite definieren",
  ];

  steps.forEach((t, i) => {
    const y = 1.2 + i * 0.48;
    const isOpen = i >= 6;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.4, y: y + 0.05, w: 0.22, h: 0.22,
      line: { color: isOpen ? C.gray : C.purple, width: 1.5 },
      fill: isOpen ? undefined : { color: C.purple, transparency: 80 }
    });
    s.addText(t, {
      x: 0.8, y, w: 8.5, h: 0.4, fontSize: 13, fontFace: "Arial",
      color: isOpen ? C.gray : C.light, valign: "middle", margin: 0
    });
  });
})();

// ============================================
// 10. ABSCHLUSS
// ============================================
(() => {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.purple } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.575, w: 10, h: 0.05, fill: { color: C.purple } });

  s.addImage({ data: fysLogo, x: 3.75, y: 0.8, w: 2.5, h: 1.4, sizing: { type: "contain", w: 2.5, h: 1.4 } });

  s.addText("BEREIT ZUR UMSETZUNG.", {
    x: 0.5, y: 2.5, w: 9, h: 0.7, fontSize: 34, fontFace: "Arial Black", color: C.white, align: "center"
  });
  s.addShape(pres.shapes.LINE, { x: 3.5, y: 3.4, w: 3, h: 0, line: { color: C.purple, width: 2 } });
  s.addText([
    { text: "Future Now Studio", options: { bold: true, color: C.purple, fontSize: 14, breakLine: true } },
    { text: "Timo Beyer & Joshua Baron", options: { fontSize: 12, color: C.light, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "timo@future-now.studio  ·  future-now.studio", options: { fontSize: 10, color: C.gray } },
  ], { x: 0.5, y: 3.6, w: 9, h: 1.5, align: "center" });
})();

// ---- SAVE ----
const outPath = "/Users/timo/Desktop/Claude/Free your Skill /FYS WEBSEITE/FYS_Website_Mockup_PitchDeck.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Saved:", outPath);
}).catch(console.error);
