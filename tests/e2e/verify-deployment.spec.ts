
import { test, expect } from '@playwright/test';

const DASHBOARD_REGEX = /.*dashboard/;

test.describe('Deployment Verification', () => {
  test('User can signup and seed database', async ({ page }) => {
    // 1. Signup
    console.log('Navigating to signup page...');
    await page.goto('https://open-jkn.technosmart.id/signup');

    // Fill form
    console.log('Filling signup form...');
    await page.getByLabel('Nama Lengkap').fill('Deployment Admin');
    const email = `admin_${Date.now()}@technosmart.id`;
    console.log(`Using email: ${email}`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Konfirmasi Password').fill('password123');

    // Submit
    console.log('Submitting signup form...');
    await page.getByRole('button', { name: 'Buat Akun' }).click();

    // Check for error or success
    try {
        console.log('Waiting for redirection...');
        await page.waitForURL(DASHBOARD_REGEX, { timeout: 20_000 });
        console.log('Redirected to dashboard!');
    } catch (e) {
        console.log('Timeout waiting for redirect. Checking for errors...');
        // The error message is in a FieldDescription with text-destructive class
        const errorElement = page.locator('.text-destructive');
        if (await errorElement.isVisible()) {
            const errorText = await errorElement.textContent();
            console.error('Signup error displayed on page:', errorText);
            throw new Error(`Signup failed with UI error: ${errorText}`);
        } else {
            console.log('No error message found on page.');
        }

        throw e;
    }

    // 2. Go to seeders page
    console.log('Navigating to seeders page...');
    await page.goto('https://open-jkn.technosmart.id/pengaturan/seeders');

    // 3. Click Seed All
    console.log('Clicking Seed All...');
    // The button text is "Jalankan Buat Semua Data"
    await page.getByRole('button', { name: 'Jalankan Buat Semua Data' }).click();

    // 4. Wait for success toast/message
    console.log('Waiting for success message...');
    await expect(page.getByText('Database seeded successfully')).toBeVisible({ timeout: 120_000 });
    console.log('Database seeded successfully!');
  });
});
