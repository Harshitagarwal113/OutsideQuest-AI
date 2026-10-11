import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalAiQuestGenerator } from '@/features/ai/services/quest-generator';
import { localModelService } from '@/features/ai/services/local-model-service';
import { QuestGeneratorService } from '@/features/quest-builder/services/generator';
import { QuestRepository } from '@/lib/storage/quest-repository';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';

describe('LocalAiQuestGenerator & Unified QuestGeneratorService', () => {
  const sampleParams: QuestParams = {
    durationMinutes: 30,
    environment: 'park',
    mood: 'curious',
    intensity: 'moderate',
    experienceType: 'solo',
    interests: ['birds', 'plants'],
    localContext: 'Oak grove',
    accessibilityRequirements: '',
  };

  const validModelQuestJson = JSON.stringify({
    title: 'Autumn Oak Exploration',
    summary: 'A 30-minute nature quest discovering acorns and tree canopies.',
    theme: 'CURIOUS • PARK',
    introduction: 'Step into the park and look around with fresh eyes.',
    durationMinutes: 30,
    steps: [
      { order: 1, title: 'Observe Acorns', instruction: 'Search for fallen acorns under mature oak trees.', durationMinutes: 10, sensoryFocus: 'sight' },
      { order: 2, title: 'Bark Rubbing', instruction: 'Gently feel the furrowed bark of the oldest tree nearby.', durationMinutes: 10, sensoryFocus: 'touch' },
      { order: 3, title: 'Bird Melody', instruction: 'Stop walking for 5 minutes and count different bird calls.', durationMinutes: 10, sensoryFocus: 'sound' },
    ],
    equipmentSuggestions: ['Sturdy shoes'],
    safetyGuidance: ['Stay on public paths'],
    screenFreeReminder: 'Phone away. Adventure on.',
    reflectionQuestions: ['What surprised you most?', 'How do you feel?'],
  });

  beforeEach(() => {
    vi.spyOn(QuestRepository, 'save').mockResolvedValue();
    QuestGeneratorService.resetGenerator();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    QuestGeneratorService.resetGenerator();
  });

  it('generates a valid quest with on-device-model provenance when model output is valid', async () => {
    const generator = new LocalAiQuestGenerator();
    vi.spyOn(localModelService, 'generateText').mockResolvedValue(validModelQuestJson);

    const quest = await generator.generate(sampleParams);

    expect(quest).toBeDefined();
    expect(quest.title).toBe('Autumn Oak Exploration');
    expect(quest.durationMinutes).toBe(30);
    expect(quest.generationSource).toBe('on-device-model');
    expect(quest.steps.length).toBe(3);
  });

  it('attempts single constrained repair pass when initial model output is malformed', async () => {
    const generator = new LocalAiQuestGenerator();
    const generateSpy = vi
      .spyOn(localModelService, 'generateText')
      .mockResolvedValueOnce('Invalid non-json output from SLM')
      .mockResolvedValueOnce(validModelQuestJson);

    const quest = await generator.generate(sampleParams);

    expect(generateSpy).toHaveBeenCalledTimes(2);
    expect(quest.title).toBe('Autumn Oak Exploration');
    expect(quest.generationSource).toBe('on-device-model');
  });

  it('falls back to verified curated template when model generation completely fails', async () => {
    const generator = new LocalAiQuestGenerator();
    vi.spyOn(localModelService, 'generateText').mockRejectedValue(new Error('Inference failure'));

    const quest = await generator.generate(sampleParams);

    expect(quest).toBeDefined();
    expect(quest.generationSource).toBe('curated-template');
    expect(quest.durationMinutes).toBe(30);
    expect(quest.steps.length).toBeGreaterThanOrEqual(3);
  });

  it('QuestGeneratorService selects LocalAi when model is ready and CuratedFallback when not ready', async () => {
    // 1. When model is not ready:
    vi.spyOn(localModelService, 'getStatus').mockReturnValue({
      state: 'not_initialized',
      modelId: 'test',
      device: 'wasm',
    });

    const fallbackQuest = await QuestGeneratorService.generate(sampleParams);
    expect(fallbackQuest.generationSource).toBe('curated-template');

    // 2. When model is ready:
    vi.spyOn(localModelService, 'getStatus').mockReturnValue({
      state: 'ready',
      modelId: 'test',
      device: 'webgpu',
    });
    vi.spyOn(localModelService, 'generateText').mockResolvedValue(validModelQuestJson);

    const aiQuest = await QuestGeneratorService.generate(sampleParams);
    expect(aiQuest.generationSource).toBe('on-device-model');

    // 3. When user explicitly chooses forceFallback even if model is ready:
    const forcedFallbackQuest = await QuestGeneratorService.generate(sampleParams, { forceFallback: true });
    expect(forcedFallbackQuest.generationSource).toBe('curated-template');
  });
});
