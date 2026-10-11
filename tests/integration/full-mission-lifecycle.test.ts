import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuestGeneratorService } from '@/features/quest-builder/services/generator';
import { QuestRepository } from '@/lib/storage/quest-repository';
import { QuestSessionService } from '@/features/quest-session/services/session-service';
import { AchievementService } from '@/features/achievements/services/achievement-service';
import { questReflectionSchema } from '@/features/quest-builder/schemas/quest-schema';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import type { Quest, QuestStep, QuestReflection } from '@/types';

describe('Full Mission Lifecycle Integration', () => {
  let inMemoryDb: Map<string, Quest>;

  beforeEach(() => {
    inMemoryDb = new Map();

    vi.spyOn(QuestRepository, 'save').mockImplementation(async (quest: Quest) => {
      inMemoryDb.set(quest.id, JSON.parse(JSON.stringify(quest)));
    });

    vi.spyOn(QuestRepository, 'getById').mockImplementation(async (id: string) => {
      return inMemoryDb.get(id) || null;
    });

    vi.spyOn(QuestRepository, 'getAll').mockImplementation(async () => {
      return Array.from(inMemoryDb.values());
    });

    vi.spyOn(QuestRepository, 'delete').mockImplementation(async (id: string) => {
      inMemoryDb.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes the full journey: configure -> generate -> start -> complete steps -> submit reflection -> verify history & achievements', async () => {
    // 1. Configure and generate quest
    const params: QuestParams = {
      durationMinutes: 30,
      environment: 'park',
      mood: 'curious',
      intensity: 'moderate',
      experienceType: 'solo',
      interests: ['birds', 'plants'],
      localContext: 'Cedar pond',
      accessibilityRequirements: '',
    };

    const draftQuest = await QuestGeneratorService.generate(params);
    expect(draftQuest).toBeDefined();
    expect(draftQuest.id).toBeDefined();
    expect(draftQuest.status).toBe('draft');
    expect(draftQuest.steps.length).toBeGreaterThanOrEqual(3);

    // Save draft
    await QuestRepository.save(draftQuest);
    const savedDraft = await QuestRepository.getById(draftQuest.id);
    expect(savedDraft).toBeDefined();
    expect(savedDraft?.id).toBe(draftQuest.id);

    // 2. Start session
    const { quest: startedQuest, sessionState } = await QuestSessionService.startQuest(draftQuest);
    expect(startedQuest.status).toBe('active');
    expect(startedQuest.startedAt).toBeDefined();

    // 3. Complete each step in sequence
    let currentQuest = startedQuest;
    let currentSessionState = sessionState;
    for (let i = 0; i < currentQuest.steps.length; i++) {
      const stepId = currentQuest.steps[i]!.id;
      const result = await QuestSessionService.toggleStep(currentQuest, currentSessionState, stepId);
      currentQuest = result.quest;
      currentSessionState = result.sessionState;
      expect(currentQuest.steps[i]!.isCompleted).toBe(true);
    }

    const allCompleted = currentQuest.steps.every((s: QuestStep) => s.isCompleted);
    expect(allCompleted).toBe(true);

    // 4. Validate and submit reflection
    const rawReflection: QuestReflection = {
      noticed: 'Cedar aroma in the breeze and scrub jays in the branches.',
      feltAfter: 'Nervous system noticeably grounded, clearer mind.',
      favoritePart: 'Listening quietly near the duck pond.',
      wouldRepeat: true,
      notes: 'Will return in late autumn.',
      submittedAt: new Date().toISOString(),
    };

    const validatedReflection = questReflectionSchema.parse(rawReflection);
    expect(validatedReflection.noticed).toBe(rawReflection.noticed);

    const completedQuest = await QuestSessionService.completeQuest(currentQuest, 1750, validatedReflection);
    expect(completedQuest.status).toBe('completed');
    expect(completedQuest.completedAt).toBeDefined();
    expect(completedQuest.actualElapsedSeconds).toBe(1750);
    expect(completedQuest.reflection).toBeDefined();

    // 5. Retrieve history and verify records
    const history = await QuestRepository.getAll();
    expect(history.length).toBe(1);
    expect(history[0]!.id).toBe(draftQuest.id);
    expect(history[0]!.status).toBe('completed');
    expect(history[0]!.reflection?.favoritePart).toBe(rawReflection.favoritePart);

    // 6. Calculate updated achievements
    const achievements = AchievementService.calculateFromQuests(history);
    expect(achievements.length).toBeGreaterThanOrEqual(4);

    const firstQuestAchievement = achievements.find((a) => a.id === 'first_adventure');
    expect(firstQuestAchievement).toBeDefined();
    expect(firstQuestAchievement!.progress).toBeGreaterThanOrEqual(firstQuestAchievement!.target);
    expect(firstQuestAchievement!.unlockedAt).toBeDefined();
  });
});
