import { describe, it, expect } from 'vitest';
import { AchievementService } from '@/features/achievements/services/achievement-service';
import type { Quest } from '@/types';

function createMockCompletedQuest(
  id: string,
  environment: Quest['environment'],
  durationMinutes: Quest['durationMinutes'],
  actualElapsedSeconds?: number
): Quest {
  return {
    id,
    title: `Adventure in ${environment}`,
    summary: 'Outdoor walk',
    durationMinutes,
    theme: 'EXPLORATION',
    introduction: 'Intro text',
    environment,
    mood: 'curious',
    intensity: 'moderate',
    experienceType: 'solo',
    interests: ['birds', 'mindfulness'],
    steps: [
      {
        id: `${id}_s1`,
        order: 1,
        title: 'Step 1',
        instruction: 'Instruction',
        durationMinutes: 5,
        observationPrompt: 'Look for tree bark',
        sensoryFocus: 'touch',
        isCompleted: true,
      },
      {
        id: `${id}_s2`,
        order: 2,
        title: 'Step 2',
        instruction: 'Instruction',
        durationMinutes: 5,
        observationPrompt: 'Listen for finch calls',
        sensoryFocus: 'sound',
        isCompleted: true,
      },
      {
        id: `${id}_s3`,
        order: 3,
        title: 'Step 3',
        instruction: 'Instruction',
        durationMinutes: 5,
        isCompleted: true,
      },
    ],
    equipmentSuggestions: ['Water'],
    safetyGuidance: ['Stay on paths'],
    screenFreeReminder: 'Phone away. Adventure on.',
    reflectionQuestions: ['Q1', 'Q2'],
    generationSource: 'curated-template',
    status: 'completed',
    completedAt: '2026-10-11T14:00:00.000Z',
    actualElapsedSeconds,
    reflection: {
      noticed: 'Acorns',
      feltAfter: 'Relaxed',
      favoritePart: 'Trees',
      wouldRepeat: true,
      submittedAt: '2026-10-11T14:02:00.000Z',
    },
    createdAt: '2026-10-11T13:45:00.000Z',
    updatedAt: '2026-10-11T14:02:00.000Z',
  };
}

describe('Achievement Calculations & History Verification (Feature 5)', () => {
  it('returns all badges locked with zero progress for empty records', () => {
    const badges = AchievementService.calculateFromQuests([]);
    expect(badges.length).toBe(4);
    badges.forEach((b) => {
      expect(b.unlockedAt).toBeUndefined();
      expect(b.progress).toBe(0);
    });
  });

  it('unlocks "First Adventure" badge upon completing 1 quest', () => {
    const quest = createMockCompletedQuest('q1', 'park', 15);
    const badges = AchievementService.calculateFromQuests([quest]);

    const firstAdv = badges.find((b) => b.id === 'first_adventure');
    expect(firstAdv?.unlockedAt).toBe('2026-10-11T14:00:00.000Z');
    expect(firstAdv?.progress).toBe(1);
  });

  it('unlocks "30 Minutes Outside" when cumulative minutes reach 30', () => {
    // Two 15-minute quests = 30 minutes total
    const q1 = createMockCompletedQuest('q1', 'park', 15);
    const q2 = createMockCompletedQuest('q2', 'garden', 15);

    const badges = AchievementService.calculateFromQuests([q1, q2]);
    const minutes30 = badges.find((b) => b.id === 'minutes_30');
    expect(minutes30?.progress).toBe(30);
    expect(minutes30?.unlockedAt).toBeDefined();
  });

  it('keeps "30 Minutes Outside" locked when cumulative minutes are below 30', () => {
    const q1 = createMockCompletedQuest('q1', 'park', 15);

    const badges = AchievementService.calculateFromQuests([q1]);
    const minutes30 = badges.find((b) => b.id === 'minutes_30');
    expect(minutes30?.progress).toBe(15);
    expect(minutes30?.unlockedAt).toBeUndefined();
  });

  it('unlocks "Nature Observer" when 5+ sensory observations are completed', () => {
    // Each mock quest has 2 sensory steps
    const q1 = createMockCompletedQuest('q1', 'park', 15);
    const q2 = createMockCompletedQuest('q2', 'garden', 15);
    const q3 = createMockCompletedQuest('q3', 'neighborhood', 15); // Total 6 sensory steps

    const badges = AchievementService.calculateFromQuests([q1, q2, q3]);
    const observer = badges.find((b) => b.id === 'nature_observer');
    expect(observer?.progress).toBe(5);
    expect(observer?.unlockedAt).toBeDefined();
  });

  it('unlocks "Multi-Terrain Explorer" when quests are completed in 2 or more distinct environments', () => {
    const q1 = createMockCompletedQuest('q1', 'park', 15);
    const q2 = createMockCompletedQuest('q2', 'neighborhood', 15);

    const badges = AchievementService.calculateFromQuests([q1, q2]);
    const multi = badges.find((b) => b.id === 'multi_terrain');
    expect(multi?.progress).toBe(2);
    expect(multi?.unlockedAt).toBeDefined();
  });
});
