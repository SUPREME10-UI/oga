import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log('NETWORK ERROR:', response.url(), response.status());
    }
  });

  console.log('Navigating to live site...');
  await page.goto('https://oga-ku3w.vercel.app/');
  
  console.log('Clicking Sign In...');
  await page.click('text=Sign In');
  
  console.log('Filling form...');
  // We'll try to log in with the testbot created by the subagent?
  // Wait, the subagent tried to sign up but failed because of the hidden input!
  // I need to create a user first, or just try to sign in and see if the network request fails.
  // Actually, let's just observe what happens if we navigate DIRECTLY to /dashboard/hirer
  
  console.log('Navigating to dashboard...');
  await page.goto('https://oga-ku3w.vercel.app/dashboard/hirer');
  await page.waitForTimeout(2000);
  console.log('Current URL after direct nav:', page.url());

  await browser.close();
})();
