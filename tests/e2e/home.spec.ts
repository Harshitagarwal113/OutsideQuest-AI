import { test, expect } from '@playwright/test';

test.describe('OutsideQuest AI Home Page', () => {
  test('displays brand header, hero section, and local AI status', async ({ page }) => {
    await page.goto('/');

    // Check header
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.getByText('OutsideQuest')).toBeVisible();
    await expect(header.getByText('Touch Grass AI')).toBeVisible();

    // Check hero
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Turn Routine Neighborhood Walks Into Sensory Micro-Adventures/i
    );

    // Check Local AI status
    await expect(page.getByText(/Local Generation Engine/i)).toBeVisible();
    await expect(page.getByText(/Curated Templates Active/i)).toBeVisible();

    // Check Quest Builder area
    await expect(page.getByText(/Craft Your Outdoor Micro-Adventure/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Generate Personalized Outdoor Quest/i })).toBeVisible();
  });

  test('interacts with quest builder and generates preview', async ({ page }) => {
    await page.goto('/');

    // Select Park
    await page.getByRole('button', { name: /^Park/i }).click();

    // Click Generate
    const generateBtn = page.getByRole('button', { name: /Generate Personalized Outdoor Quest/i });
    await generateBtn.click();

    // Verify generated preview
    await expect(page.getByRole('button', { name: /Begin Adventure Now/i })).toBeVisible();
    await expect(page.getByText(/Actionable Trail Steps/i)).toBeVisible();
  });

  test('navigates to My Journal, Privacy and About AI pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to My Journal using visible link (works on desktop and mobile)
    await page.locator('a[href="/history"]:visible').first().click();
    await expect(page).toHaveURL(/.*history/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/My Outdoor Journal/i);

    // Navigate to About AI
    await page.locator('a[href="/about-ai"]:visible').first().click();
    await expect(page).toHaveURL(/.*about-ai/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/How OutsideQuest AI Operates On-Device/i);

    // Navigate to Privacy
    await page.locator('a[href="/privacy"]:visible').first().click();
    await expect(page).toHaveURL(/.*privacy/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Privacy by Architecture/i);
  });
});
