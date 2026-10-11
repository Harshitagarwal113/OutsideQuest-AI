import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementService } from '@/features/achievements/services/achievement-service';
import { HistoryService } from '@/features/history/services/history-service';
import { QuestRepository } from '@/lib/storage/quest-repository';
import type { Quest } from '@/types';

describe('Achievement and History Service Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates achievements from completed repository records', async () => {
    const mockCompleted: Quest = {
      id: 'q_int_1',
      title: 'Garden Flower Walk',
      summary: 'Strolling past roses and herbs',
      durationMinutes: 30,
      theme: 'CALM',
      introduction: 'Intro text',
      environment: 'garden',
      mood: 'calm',
      intensity: 'gentle',
      experienceType: 'solo',
      interests: ['plants'],
      steps: [
        {
          id: 's1',
          order: 1,
          title: 'Petal Texture',
          instruction: 'Touch leaf',
          durationMinutes: 15,
          sensoryFocus: 'touch',
          isCompleted: true,
        },
        {
          id: 's2',
          order: 2,
          title: 'Herbaceous Scent',
          instruction: 'Smell thyme',
          durationMinutes: 15,
          sensoryFocus: 'smell',
          isCompleted: true,
        },
      ],
      equipmentSuggestions: ['Water'],
      safetyGuidance: ['Stay on path'],
      screenFreeReminder: 'Phone away. Adventure on.',
      reflectionQuestions: ['Q1', 'Q2'],
      generationSource: 'curated-template',
      status: 'completed',
      completedAt: '2026-10-11T15:00:00.000Z',
      actualElapsedSeconds: 1800,
      createdAt: '2026-10-11T14:30:00.000Z',
      updatedAt: '2026-10-11T15:00:00.000Z',
    };

    vi.spyOn(QuestRepository, 'getAll').mockResolvedValue([mockCompleted]);

    const all = await HistoryService.getAll();
    const achievements = AchievementService.calculateFromQuests(all);

    const firstAdv = achievements.find((a) => a.id === 'first_adventure');
    expect(firstAdv?.unlockedAt).toBe('2026-10-11T15:00:00.000Z');

    const minutes30 = achievements.find((a) => a.id === 'minutes_30');
    expect(minutes30?.progress).toBe(30);
    expect(minutes30?.unlockedAt).toBeDefined();
  });
});
