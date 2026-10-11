import { describe, it, expect } from 'vitest';
import { questSchema } from '@/features/quest-builder/schemas/quest-schema';
import type { Quest } from '@/types';

const baseValidQuest: Quest = {
  id: 'quest_test_1',
  title: 'Morning Canopy Walk',
  summary: 'A peaceful stroll to observe neighborhood tree cover.',
  durationMinutes: 15,
  theme: 'CALM • MINDFULNESS',
  introduction: 'Take 15 minutes away from your screen to notice the living canopy above.',
  environment: 'park',
  mood: 'calm',
  intensity: 'gentle',
  experienceType: 'solo',
  interests: ['mindfulness', 'plants'],
  steps: [
    {
      id: 'step_1',
      order: 1,
      title: 'Threshold Pause',
      instruction: 'Pause for 5 minutes at the park entrance.',
      durationMinutes: 5,
      isCompleted: false,
    },
    {
      id: 'step_2',
      order: 2,
      title: 'Bark Texture',
      instruction: 'Examine bark ridges along a mature tree.',
      durationMinutes: 5,
      isCompleted: false,
    },
    {
      id: 'step_3',
      order: 3,
      title: 'Canopy Gaze',
      instruction: 'Look upward into the branch silhouettes.',
      durationMinutes: 5,
      isCompleted: false,
    },
  ],
  equipmentSuggestions: ['Comfortable walking shoes', 'Water bottle'],
  safetyGuidance: ['Stay on designated public pathways', 'Remain alert to footing'],
  screenFreeReminder: 'Phone away. Adventure on.',
  reflectionQuestions: ['What surprised your senses?', 'How did your breath change?'],
  generationSource: 'curated-template',
  status: 'draft',
  createdAt: '2026-10-11T12:00:00.000Z',
  updatedAt: '2026-10-11T12:00:00.000Z',
};

describe('Quest Schema Runtime Validation (Feature 2)', () => {
  it('validates a well-formed quest successfully', () => {
    const result = questSchema.safeParse(baseValidQuest);
    expect(result.success).toBe(true);
  });

  it('rejects if step duration sum does not equal total quest duration', () => {
    const mismatchedQuest = {
      ...baseValidQuest,
      durationMinutes: 15,
      steps: [
        { ...baseValidQuest.steps[0]!, durationMinutes: 5 },
        { ...baseValidQuest.steps[1]!, durationMinutes: 5 },
        { ...baseValidQuest.steps[2]!, durationMinutes: 10 }, // sum = 20, expected 15
      ],
    };
    const result = questSchema.safeParse(mismatchedQuest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Sum of step durations');
    }
  });

  it('rejects if any step duration is zero or negative', () => {
    const nonPositiveQuest = {
      ...baseValidQuest,
      steps: [
        { ...baseValidQuest.steps[0]!, durationMinutes: 0 },
        { ...baseValidQuest.steps[1]!, durationMinutes: 7.5 },
        { ...baseValidQuest.steps[2]!, durationMinutes: 7.5 },
      ],
    };
    const result = questSchema.safeParse(nonPositiveQuest);
    expect(result.success).toBe(false);
  });

  it('rejects if step count is fewer than 3', () => {
    const tooFewStepsQuest = {
      ...baseValidQuest,
      steps: [
        { ...baseValidQuest.steps[0]!, durationMinutes: 7.5 },
        { ...baseValidQuest.steps[1]!, durationMinutes: 7.5 },
      ],
    };
    const result = questSchema.safeParse(tooFewStepsQuest);
    expect(result.success).toBe(false);
  });

  it('rejects if step count is greater than 5', () => {
    const tooManyStepsQuest = {
      ...baseValidQuest,
      durationMinutes: 60,
      steps: [
        { ...baseValidQuest.steps[0]!, id: 's1', durationMinutes: 10 },
        { ...baseValidQuest.steps[0]!, id: 's2', durationMinutes: 10 },
        { ...baseValidQuest.steps[0]!, id: 's3', durationMinutes: 10 },
        { ...baseValidQuest.steps[0]!, id: 's4', durationMinutes: 10 },
        { ...baseValidQuest.steps[0]!, id: 's5', durationMinutes: 10 },
        { ...baseValidQuest.steps[0]!, id: 's6', durationMinutes: 10 }, // 6 steps
      ],
    };
    const result = questSchema.safeParse(tooManyStepsQuest);
    expect(result.success).toBe(false);
  });

  it('validates a quest containing completed reflection data', () => {
    const questWithReflection: Quest = {
      ...baseValidQuest,
      status: 'completed',
      completedAt: '2026-10-11T12:20:00.000Z',
      actualElapsedSeconds: 940,
      reflection: {
        noticed: 'Fallen acorns and damp moss',
        feltAfter: 'Significantly calmer breathing',
        favoritePart: 'Listening to the mourning dove call',
        wouldRepeat: true,
        notes: 'Walked on the paved perimeter trail',
        submittedAt: '2026-10-11T12:21:00.000Z',
      },
    };
    const result = questSchema.safeParse(questWithReflection);
    expect(result.success).toBe(true);
  });
});
