import { test, expect } from '@playwright/test';

test.describe('Complete OutsideQuest AI User Journey', () => {
  test('executes end-to-end 8-step user journey with local persistence', async ({ page }) => {
    // 1. Open the app as a new user
    await page.goto('/');

    await expect(page).toHaveTitle(/OutsideQuest AI/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Turn Routine Neighborhood Walks Into Sensory Micro-Adventures/i
    );
    await expect(page.getByText(/Local Generation Engine/i)).toBeVisible();

    // 2. Configure a quest
    // Choose environment: Garden
    const gardenBtn = page.getByRole('button', { name: /^Garden/i });
    await expect(gardenBtn).toBeVisible();
    await gardenBtn.click();

    // Choose mood: Curious
    const curiousBtn = page.getByRole('button', { name: /^Curious/i });
    if (await curiousBtn.isVisible()) {
      await curiousBtn.click();
    }

    // Fill in optional local context
    const localContextInput = page.locator('#localContext');
    await localContextInput.fill('Near ancient oak trees with gravel path and wildflower borders');

    // 3. Generate a quest using deterministic local fallback
    const generateBtn = page.getByRole('button', { name: /Generate Personalized Outdoor Quest/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Verify quest preview
    const beginBtn = page.getByRole('button', { name: /Begin Adventure Now/i });
    await expect(beginBtn).toBeVisible();
    await expect(page.getByText(/Actionable Trail Steps/i)).toBeVisible();
    await expect(page.getByText(/Curated Offline Fallback/i)).toBeVisible();

    // 4. Start the quest and complete steps
    await beginBtn.click();

    // Verify active exploration view
    await expect(page.getByText(/Phone away\. Adventure on\./i)).toBeVisible();
    await expect(page.getByText(/Active Exploration/i)).toBeVisible();

    // Mark current step completed
    const markStepBtn = page.getByRole('button', { name: /Mark Step Completed/i });
    await expect(markStepBtn).toBeVisible();
    await markStepBtn.click();
    await expect(page.getByText(/Step Completed ✓/i)).toBeVisible();

    // Advance to next step if button enabled
    const nextStepBtn = page.getByRole('button', { name: /Next Step/i });
    if (await nextStepBtn.isEnabled()) {
      await nextStepBtn.click();
      const markNextBtn = page.getByRole('button', { name: /Mark Step Completed/i });
      if (await markNextBtn.isVisible()) {
        await markNextBtn.click();
      }
    }

    // 5. Finish the session and save a reflection
    const finishBtn = page.getByRole('button', { name: /Finish & Log Nature Journal/i });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // Confirm reflection screen
    await expect(page.getByRole('heading', { level: 2 })).toContainText(/Record Your Nature Reflection/i);

    // Fill in reflection form
    await page.locator('#refNotice').fill('Sweet smell of flowering jasmine and yellowfinches in the hedge');
    await page.locator('#refFelt').fill('Deeply refreshed, grounded in my senses, calm heart rate');
    await page.locator('#refFav').fill('Observing moss patterns on old stone boundary');
    await page.getByRole('button', { name: /✓ Yes, definitely/i }).click();

    // Submit reflection
    const saveJournalBtn = page.getByRole('button', { name: /Save to My Nature Journal/i });
    await expect(saveJournalBtn).toBeVisible();
    await saveJournalBtn.click();

    // Should return to home view with active quest cleared
    await expect(page.getByText(/Phone away\. Adventure on\./i)).not.toBeVisible();

    // 6. Open the journal and confirm the record appears
    const journalLink = page.locator('a[href="/history"]:visible').first();
    await journalLink.click();
    await expect(page).toHaveURL(/.*history/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/My Outdoor Journal/i);

    // Check that entry is displayed in journal
    await expect(page.getByText(/Garden/i).first()).toBeVisible();
    await expect(page.getByText(/Sweet smell of flowering jasmine/i)).toBeVisible();

    // 7. Refresh the page and check local IndexedDB persistence
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/My Outdoor Journal/i);
    await expect(page.getByText(/Sweet smell of flowering jasmine/i)).toBeVisible();

    // 8. Open Privacy and About the AI pages
    const privacyLink = page.locator('a[href="/privacy"]:visible').first();
    await privacyLink.click();
    await expect(page).toHaveURL(/.*privacy/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Privacy by Architecture/i);
    await expect(page.getByText(/Browser-Native Open-Weight AI Inference/i)).toBeVisible();

    const aboutAiLink = page.locator('a[href="/about-ai"]:visible').first();
    await aboutAiLink.click();
    await expect(page).toHaveURL(/.*about-ai/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/How OutsideQuest AI Operates On-Device/i);
    await expect(page.getByText(/Qwen2\.5-0\.5B-Instruct/i)).toBeVisible();
  });

  test('operates fully offline with zero network connectivity', async ({ page, context }) => {
    // Navigate initially
    await page.goto('/');

    // Cut all network connectivity (simulate being out in the woods/trail with no reception)
    await context.setOffline(true);

    // Select Park environment
    await page.getByRole('button', { name: /^Park/i }).click();

    // Generate quest completely offline
    const generateBtn = page.getByRole('button', { name: /Generate Personalized Outdoor Quest/i });
    await generateBtn.click();

    // Verify offline generation succeeded immediately with fallback template
    await expect(page.getByRole('button', { name: /Begin Adventure Now/i })).toBeVisible();
    await expect(page.getByText(/Curated Offline Fallback/i)).toBeVisible();

    // Restore network
    await context.setOffline(false);
  });
});
