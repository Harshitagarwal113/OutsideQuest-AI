import { questParamsSchema, type QuestParams } from '../schemas/quest-params';
import { CuratedFallbackGenerator } from './fallback-generator';
import type { QuestGenerator } from './quest-generator.interface';
import { QuestRepository } from '@/lib/storage/quest-repository';
import type { Quest } from '@/types';
import { localModelService } from '@/features/ai/services/local-model-service';
import { LocalAiQuestGenerator } from '@/features/ai/services/quest-generator';

export interface GenerateOptions {
  forceFallback?: boolean;
  preferLocalAi?: boolean;
}

export class QuestGeneratorService {
  private static fallbackGenerator: QuestGenerator = new CuratedFallbackGenerator();
  private static localAiGenerator: QuestGenerator = new LocalAiQuestGenerator();
  private static customGenerator: QuestGenerator | null = null;

  public static setGenerator(generator: QuestGenerator) {
    this.customGenerator = generator;
  }

  public static resetGenerator(): void {
    this.customGenerator = null;
  }

  public static getGenerator(): QuestGenerator {
    if (this.customGenerator) return this.customGenerator;
    if (localModelService.getStatus().state === 'ready') {
      return this.localAiGenerator;
    }
    return this.fallbackGenerator;
  }

  static validateParams(params: unknown): QuestParams {
    return questParamsSchema.parse(params);
  }

  static async generate(rawParams: unknown, options?: GenerateOptions): Promise<Quest> {
    const validatedParams = this.validateParams(rawParams);

    let chosenGenerator: QuestGenerator;
    if (options?.forceFallback) {
      chosenGenerator = this.fallbackGenerator;
    } else if (this.customGenerator) {
      chosenGenerator = this.customGenerator;
    } else if (options?.preferLocalAi || localModelService.getStatus().state === 'ready') {
      chosenGenerator = this.localAiGenerator;
    } else {
      chosenGenerator = this.fallbackGenerator;
    }

    const quest = await chosenGenerator.generate(validatedParams);

    // Persist draft to IndexedDB
    try {
      await QuestRepository.save(quest);
    } catch (err) {
      console.warn('Draft storage warning (continuing in-memory):', err);
    }

    return quest;
  }
}
