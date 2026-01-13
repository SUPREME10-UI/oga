import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log('Navigating to http://localhost:5174/');
        await page.goto('http://localhost:5174/');

        console.log('Opening Auth Modal...');
        await page.click('text=Join Oga');

        console.log('Filling Signup Form...');
        await page.fill('#fullName', 'Kobby Test');
        await page.fill('#email', `test_${Date.now()}@example.com`);
        await page.fill('#phoneNumber', '0240000000');
        await page.fill('#location', 'Accra');
        await page.fill('#password', 'Success123!');
        await page.fill('#confirmPassword', 'Success123!');

        // Check the box
        await page.click('input[type="checkbox"]');

        console.log('Submitting Form...');
        await page.click('text=Create Account');

        console.log('Waiting for Success UI...');
        await page.waitForSelector('.auth-success-view', { timeout: 10000 });

        // Wait for animations
        await page.waitForTimeout(1000);

        console.log('Capturing Screenshot...');
        await page.screenshot({ path: 'C:/Users/Kobby/.gemini/antigravity/brain/79f90f19-8dfb-47ab-bace-8e2e6f98a425/success_ui_preview.webp' });

        console.log('Verification Successful!');
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
