import type { QuestGenerator } from '@/features/quest-builder/services/quest-generator.interface';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import type { Quest } from '@/types';
import { localModelService } from './local-model-service';
import { QuestOutputParser } from './quest-output-parser';
import { AI_SYSTEM_PROMPT, buildQuestUserPrompt } from '../prompts/quest-generation-prompt';
import { CuratedFallbackGenerator } from '@/features/quest-builder/services/fallback-generator';

export class LocalAiQuestGenerator implements QuestGenerator {
  private fallbackGenerator = new CuratedFallbackGenerator();

  /**
   * Generates a personalized outdoor quest using the on-device language model.
   * If model inference or parsing fails, attempts at most one repair pass,
   * and ultimately falls back to the deterministic curated template generator.
   */
  public async generate(params: QuestParams): Promise<Quest> {
    try {
      // 1. Prepare prompts
      const userPrompt = buildQuestUserPrompt(params);

      // 2. Perform on-device inference via Web Worker
      const rawOutput = await localModelService.generateText(userPrompt, AI_SYSTEM_PROMPT);

      // 3. Parse and validate output
      try {
        const quest = QuestOutputParser.parseAndValidate(rawOutput, params);
        return quest;
      } catch (parseError) {
        console.warn('Initial model output failed validation. Attempting single repair pass...', parseError);

        // 4. One constrained repair attempt
        try {
          const repairPrompt = `Your previous output could not be parsed as valid JSON:
${rawOutput.slice(0, 400)}

Please return ONLY valid JSON matching the required schema with exactly ${params.durationMinutes === 15 ? 3 : params.durationMinutes === 60 ? 5 : 4} steps whose durations sum to ${params.durationMinutes}:`;

          const repairedRaw = await localModelService.generateText(repairPrompt, AI_SYSTEM_PROMPT, 30000);
          const repairedQuest = QuestOutputParser.parseAndValidate(repairedRaw, params);
          return repairedQuest;
        } catch (repairError) {
          console.warn('Repair attempt failed. Gracefully falling back to verified curated quest.', repairError);
          return await this.fallbackGenerator.generate(params);
        }
      }
    } catch (generationError) {
      console.warn('On-device generation failed or was aborted. Falling back to curated templates:', generationError);
      return await this.fallbackGenerator.generate(params);
    }
  }

  public isAvailable(): boolean {
    return localModelService.getStatus().state === 'ready';
  }
}

export const localAiQuestGenerator = new LocalAiQuestGenerator();
