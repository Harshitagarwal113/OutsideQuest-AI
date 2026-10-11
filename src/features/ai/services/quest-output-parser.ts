import { questSchema } from '@/features/quest-builder/schemas/quest-schema';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import type { Quest, QuestStep } from '@/types';
import { generateId } from '@/lib/utils';
import { SCREEN_FREE_REMINDER, GENERAL_SAFETY_GUIDANCE, STANDARD_EQUIPMENT_SUGGESTIONS } from '@/lib/constants';

export class QuestOutputParser {
  /**
   * Extracts JSON substring from model output.
   * Handles markdown code fences (```json ... ```) or bare JSON object.
   */
  public static extractJsonString(rawText: string): string {
    const trimmed = rawText.trim();

    // 1. Check for markdown code fences
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      return fenceMatch[1].trim();
    }

    // 2. Locate outermost curly braces
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return trimmed.slice(firstBrace, lastBrace + 1);
    }

    throw new Error('No JSON object found in model output');
  }

  /**
   * Cleans minor JSON artifacts such as trailing commas before closing braces/brackets.
   */
  public static cleanJsonString(jsonStr: string): string {
    return jsonStr
      .replace(/,\s*([}\]])/g, '$1') // remove trailing commas
      .replace(/[\u0000-\u001F]+/g, ' '); // remove raw control characters
  }

  /**
   * Safely parses and normalizes the AI-generated quest, applying at most one
   * constrained repair pass to ensure mathematical duration consistency and safety rules.
   */
  public static parseAndValidate(
    rawText: string,
    params: QuestParams
  ): Quest {
    const extracted = this.extractJsonString(rawText);
    const cleaned = this.cleanJsonString(extracted);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new Error(`JSON parsing failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed output is not a valid JSON object');
    }

    const obj = parsed as Record<string, unknown>;

    // Normalize and repair fields if slightly off
    const now = new Date().toISOString();
    const durationMinutes = params.durationMinutes;

    // Check steps array
    const rawSteps = Array.isArray(obj['steps']) ? (obj['steps'] as Array<Record<string, unknown>>) : [];
    if (rawSteps.length < 3 || rawSteps.length > 5) {
      throw new Error(`Invalid step count: model produced ${rawSteps.length} steps, expected 3 to 5`);
    }

    // Repair step durations if they drift slightly from total duration
    const totalRawDuration = rawSteps.reduce((sum, s) => {
      const d = typeof s['durationMinutes'] === 'number' ? s['durationMinutes'] : 0;
      return sum + d;
    }, 0);

    const targetStepCount = rawSteps.length;
    const baseDurationPerStep = Math.floor(durationMinutes / targetStepCount);
    const remainder = durationMinutes % targetStepCount;

    const normalizedSteps: QuestStep[] = rawSteps.map((s, idx) => {
      let stepDur = typeof s['durationMinutes'] === 'number' && s['durationMinutes'] > 0
        ? s['durationMinutes']
        : baseDurationPerStep;

      // If model's step durations did not sum up to durationMinutes, redistribute cleanly
      if (Math.abs(totalRawDuration - durationMinutes) > 0.5) {
        stepDur = baseDurationPerStep + (idx === 0 ? remainder : 0);
      }

      const rawFocus = typeof s['sensoryFocus'] === 'string' ? s['sensoryFocus'].toLowerCase() : 'curiosity';
      const validFoci = ['sight', 'sound', 'touch', 'smell', 'curiosity'] as const;
      const sensoryFocus = validFoci.includes(rawFocus as (typeof validFoci)[number])
        ? (rawFocus as (typeof validFoci)[number])
        : 'curiosity';

      return {
        id: generateId('step'),
        order: idx + 1,
        title: typeof s['title'] === 'string' && s['title'].trim() ? s['title'].trim() : `Milestone ${idx + 1}`,
        instruction: typeof s['instruction'] === 'string' && s['instruction'].trim()
          ? s['instruction'].trim()
          : 'Observe your natural surroundings and note sensory patterns.',
        durationMinutes: Math.max(1, Math.round(stepDur)),
        observationPrompt: typeof s['observationPrompt'] === 'string' ? s['observationPrompt'].trim() : undefined,
        sensoryFocus,
        isCompleted: false,
      };
    });

    // Re-verify exact duration sum
    const currentSum = normalizedSteps.reduce((acc, s) => acc + s.durationMinutes, 0);
    if (currentSum !== durationMinutes) {
      // Adjust last step to guarantee exact match
      const lastStep = normalizedSteps[normalizedSteps.length - 1]!;
      lastStep.durationMinutes = Math.max(1, lastStep.durationMinutes + (durationMinutes - currentSum));
    }

    // Safety check: ensure no dangerous terms
    const combinedInstructions = normalizedSteps.map((s) => s.instruction.toLowerCase()).join(' ');
    const forbiddenPhrases = ['eat', 'taste', 'ingest', 'swallow', 'touch wild animal', 'trespass'];
    for (const forbidden of forbiddenPhrases) {
      if (combinedInstructions.includes(forbidden)) {
        throw new Error(`Output violated safety criteria: found forbidden instruction "${forbidden}"`);
      }
    }

    const candidateQuest: Quest = {
      id: generateId('quest'),
      title: typeof obj['title'] === 'string' && obj['title'].trim() ? obj['title'].trim() : `Adventures in ${params.environment}`,
      summary: typeof obj['summary'] === 'string' && obj['summary'].trim() ? obj['summary'].trim() : `A ${durationMinutes}-minute outdoor trail.`,
      durationMinutes,
      theme: typeof obj['theme'] === 'string' && obj['theme'].trim() ? obj['theme'].trim() : `${params.mood.toUpperCase()} • ${params.environment.toUpperCase()}`,
      introduction: typeof obj['introduction'] === 'string' && obj['introduction'].trim() ? obj['introduction'].trim() : `A personalized ${durationMinutes}-minute exploration.`,
      environment: params.environment,
      mood: params.mood,
      intensity: params.intensity,
      experienceType: params.experienceType,
      interests: params.interests,
      localContext: params.localContext,
      accessibilityRequirements: params.accessibilityRequirements,
      steps: normalizedSteps,
      equipmentSuggestions: Array.isArray(obj['equipmentSuggestions']) && obj['equipmentSuggestions'].length > 0
        ? (obj['equipmentSuggestions'] as string[])
        : [...STANDARD_EQUIPMENT_SUGGESTIONS],
      safetyGuidance: Array.isArray(obj['safetyGuidance']) && obj['safetyGuidance'].length > 0
        ? (obj['safetyGuidance'] as string[])
        : [...GENERAL_SAFETY_GUIDANCE],
      screenFreeReminder: SCREEN_FREE_REMINDER,
      reflectionQuestions: Array.isArray(obj['reflectionQuestions']) && obj['reflectionQuestions'].length >= 2
        ? (obj['reflectionQuestions'] as string[])
        : [
            'What natural texture or sound stood out most during your walk?',
            'How did your thoughts shift after stepping away from screens?',
          ],
      generationSource: 'on-device-model',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    // Final strict validation through questSchema
    return questSchema.parse(candidateQuest);
  }
}
