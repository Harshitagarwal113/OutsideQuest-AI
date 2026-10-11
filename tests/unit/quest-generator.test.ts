import { describe, it, expect, vi } from 'vitest';
import { QuestGeneratorService } from '@/features/quest-builder/services/generator';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import { QuestRepository } from '@/lib/storage/quest-repository';

describe('QuestGeneratorService End-to-End', () => {
  it('validates raw parameters and generates a complete quest', async () => {
    vi.spyOn(QuestRepository, 'save').mockResolvedValue();

    const rawParams: QuestParams = {
      durationMinutes: 30,
      environment: 'park',
      mood: 'curious',
      intensity: 'gentle',
      experienceType: 'friends',
      interests: ['birds', 'plants'],
      localContext: 'City duck pond',
      accessibilityRequirements: 'Wheelchair access',
    };

    const quest = await QuestGeneratorService.generate(rawParams);

    expect(quest).toBeDefined();
    expect(quest.durationMinutes).toBe(30);
    expect(quest.environment).toBe('park');
    expect(quest.generationSource).toBe('curated-template');
    expect(quest.steps.length).toBeGreaterThanOrEqual(3);
    expect(quest.steps.reduce((sum, s) => sum + s.durationMinutes, 0)).toBe(30);
    expect(quest.screenFreeReminder).toBe('Phone away. Adventure on.');
  });
});
