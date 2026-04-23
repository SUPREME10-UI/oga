import { chromium } from 'playwright';

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`));
    page.on('pageerror', err => console.error(`[PAGE ERROR] ${err.message}`));
    page.on('requestfailed', request => console.error(`[NETWORK ERROR] ${request.url()} - ${request.failure().errorText}`));

    console.log("Navigating to http://localhost:5173/");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log("Done checking.");
    await browser.close();
  } catch (e) {
    console.error("Script error:", e);
  }
})();
