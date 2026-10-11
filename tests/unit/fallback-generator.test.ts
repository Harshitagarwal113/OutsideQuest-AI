import { describe, it, expect } from 'vitest';
import { CuratedFallbackGenerator } from '@/features/quest-builder/services/fallback-generator';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import { questSchema } from '@/features/quest-builder/schemas/quest-schema';

describe('CuratedFallbackGenerator (Feature 2)', () => {
  const generator = new CuratedFallbackGenerator();

  const baseParams: QuestParams = {
    durationMinutes: 15,
    environment: 'park',
    mood: 'curious',
    intensity: 'moderate',
    experienceType: 'solo',
    interests: ['birds', 'mindfulness'],
    localContext: '',
    accessibilityRequirements: '',
  };

  it('generates a 15-minute quest that passes Zod validation with exact duration sum', async () => {
    const quest = await generator.generate({ ...baseParams, durationMinutes: 15 });
    const parsed = questSchema.safeParse(quest);
    expect(parsed.success).toBe(true);

    expect(quest.durationMinutes).toBe(15);
    expect(quest.steps.length).toBeGreaterThanOrEqual(3);
    expect(quest.steps.length).toBeLessThanOrEqual(5);

    const stepSum = quest.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    expect(stepSum).toBe(15);
    quest.steps.forEach((s) => expect(s.durationMinutes).toBeGreaterThan(0));

    expect(quest.generationSource).toBe('curated-template');
  });

  it('generates a 30-minute quest with exact step duration sum', async () => {
    const quest = await generator.generate({ ...baseParams, durationMinutes: 30 });
    const parsed = questSchema.safeParse(quest);
    expect(parsed.success).toBe(true);

    const stepSum = quest.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    expect(stepSum).toBe(30);
  });

  it('generates a 45-minute quest with exact step duration sum', async () => {
    const quest = await generator.generate({ ...baseParams, durationMinutes: 45 });
    const parsed = questSchema.safeParse(quest);
    expect(parsed.success).toBe(true);

    const stepSum = quest.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    expect(stepSum).toBe(45);
  });

  it('generates a 60-minute quest with exact step duration sum', async () => {
    const quest = await generator.generate({ ...baseParams, durationMinutes: 60 });
    const parsed = questSchema.safeParse(quest);
    expect(parsed.success).toBe(true);

    const stepSum = quest.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    expect(stepSum).toBe(60);
  });

  it('incorporates local context into introduction when provided', async () => {
    const quest = await generator.generate({
      ...baseParams,
      localContext: 'Old willow tree by the fountain',
    });
    expect(quest.introduction).toContain('Old willow tree by the fountain');
  });

  it('adapts step instructions when accessibility limitations are provided', async () => {
    const quest = await generator.generate({
      ...baseParams,
      accessibilityRequirements: 'Wheelchair user, step-free paved paths only',
    });
    const hasAccessibilityGuidance = quest.steps.some((s) =>
      s.instruction.toLowerCase().includes('adapted for your needs')
    );
    expect(hasAccessibilityGuidance).toBe(true);
  });

  it('includes mandatory screen-free reminder and safety guidance', async () => {
    const quest = await generator.generate(baseParams);
    expect(quest.screenFreeReminder).toBe('Phone away. Adventure on.');
    expect(quest.safetyGuidance.length).toBeGreaterThanOrEqual(3);
    expect(quest.reflectionQuestions.length).toBeGreaterThanOrEqual(2);
  });
});
