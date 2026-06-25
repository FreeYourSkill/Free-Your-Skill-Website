const puppeteer = require("puppeteer");
const path = require("path");

const OUT = "/Users/timo/Desktop/Claude/Free your Skill /FYS WEBSEITE/mockup/screenshots";

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });

  const pages = [
    { name: "01_intro", url: "http://localhost:8090/", fullPage: false, width: 1440, height: 900 },
    { name: "02_agency_hero", url: "http://localhost:8090/agency.html", fullPage: false, width: 1440, height: 900 },
    { name: "03_agency_full", url: "http://localhost:8090/agency.html", fullPage: true, width: 1440, height: 900 },
    { name: "04_about_hero", url: "http://localhost:8090/about.html", fullPage: false, width: 1440, height: 900 },
    { name: "05_about_full", url: "http://localhost:8090/about.html", fullPage: true, width: 1440, height: 900 },
  ];

  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewport({ width: p.width, height: p.height });
    await page.goto(p.url, { waitUntil: "networkidle2", timeout: 15000 });

    // Force all reveals visible + remove animations
    await page.evaluate(() => {
      document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("revealed"));
      // Kill all CSS animations to show final state
      const style = document.createElement("style");
      style.textContent = "*, *::before, *::after { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }";
      document.head.appendChild(style);
      // Re-apply specific transforms for polaroids etc
      document.querySelectorAll(".polaroid--tilt-left").forEach(el => el.style.transform = "rotate(-3deg)");
      document.querySelectorAll(".polaroid--tilt-right").forEach(el => el.style.transform = "rotate(3deg)");
    });
    await new Promise(r => setTimeout(r, 300));

    const outPath = path.join(OUT, p.name + ".png");
    await page.screenshot({ path: outPath, fullPage: p.fullPage, type: "png" });
    console.log("Saved:", outPath);
    await page.close();
  }

  await browser.close();
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); });
