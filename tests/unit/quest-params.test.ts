import { describe, it, expect } from 'vitest';
import { questParamsSchema } from '@/features/quest-builder/schemas/quest-params';
import { defaultQuestParams } from '@/features/quest-builder/hooks/useQuestBuilder';

describe('QuestParams Form Validation (Feature 1)', () => {
  it('validates default quest parameters successfully', () => {
    const result = questParamsSchema.safeParse(defaultQuestParams);
    expect(result.success).toBe(true);
  });

  it('accepts valid 15, 30, 45, and 60 minute durations', () => {
    for (const duration of [15, 30, 45, 60]) {
      const result = questParamsSchema.safeParse({
        ...defaultQuestParams,
        durationMinutes: duration,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects unsupported durations (e.g. 20 or 90 minutes)', () => {
    const invalid20 = questParamsSchema.safeParse({
      ...defaultQuestParams,
      durationMinutes: 20,
    });
    expect(invalid20.success).toBe(false);

    const invalid90 = questParamsSchema.safeParse({
      ...defaultQuestParams,
      durationMinutes: 90,
    });
    expect(invalid90.success).toBe(false);
  });

  it('accepts all 5 valid environments (park, garden, neighborhood, campus, other)', () => {
    for (const env of ['park', 'garden', 'neighborhood', 'campus', 'other']) {
      const result = questParamsSchema.safeParse({
        ...defaultQuestParams,
        environment: env,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an invalid environment string', () => {
    const result = questParamsSchema.safeParse({
      ...defaultQuestParams,
      environment: 'outer-space',
    });
    expect(result.success).toBe(false);
  });

  it('validates moods, intensity, and experience types', () => {
    const result = questParamsSchema.safeParse({
      durationMinutes: 45,
      environment: 'campus',
      mood: 'energetic',
      intensity: 'active',
      experienceType: 'friends',
      interests: ['walking', 'photography'],
      localContext: 'Main academic quadrangle',
      accessibilityRequirements: 'Step-free routes only',
    });
    expect(result.success).toBe(true);
  });

  it('rejects when interests array is empty', () => {
    const result = questParamsSchema.safeParse({
      ...defaultQuestParams,
      interests: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Select at least one interest');
    }
  });

  it('rejects local context exceeding 300 characters', () => {
    const result = questParamsSchema.safeParse({
      ...defaultQuestParams,
      localContext: 'x'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('rejects accessibility requirements exceeding 300 characters', () => {
    const result = questParamsSchema.safeParse({
      ...defaultQuestParams,
      accessibilityRequirements: 'x'.repeat(301),
    });
    expect(result.success).toBe(false);
  });
});
