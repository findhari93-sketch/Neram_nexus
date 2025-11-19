const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const outDir = path.join(__dirname, "..", "screenshots");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  try {
    const url = process.env.TARGET_URL || "http://localhost:3000/web-users";
    console.log("Navigating to", url);
    await page.goto(url, { waitUntil: "networkidle" });

    // Give the page a short moment to settle dynamic UI elements (skeletons/progress bars)
    await page.waitForTimeout(1000);

    const fullPath = path.join(outDir, "web-users-full.png");
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log("Saved screenshot:", fullPath);

    const viewportPath = path.join(outDir, "web-users-viewport.png");
    await page.screenshot({ path: viewportPath, fullPage: false });
    console.log("Saved viewport screenshot:", viewportPath);
  } catch (err) {
    console.error("Error taking screenshot:", err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
