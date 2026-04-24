import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/PC/.gemini/antigravity/brain/5535f68c-0c35-4e73-8526-bc25b2673cd7/artifacts/preview.png' });
  await browser.close();
})();

