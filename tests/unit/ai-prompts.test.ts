import { describe, it, expect } from 'vitest';
import { AI_SYSTEM_PROMPT, buildQuestUserPrompt } from '@/features/ai/prompts/quest-generation-prompt';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import { SCREEN_FREE_REMINDER } from '@/lib/constants';

describe('AI Prompt Generation', () => {
  it('contains critical system prompt safety and schema constraints', () => {
    expect(AI_SYSTEM_PROMPT).toContain('OutsideQuest AI');
    expect(AI_SYSTEM_PROMPT).toContain('NEVER tell the user to touch or eat wild plants');
    expect(AI_SYSTEM_PROMPT).toContain('NEVER instruct approaching or handling wildlife');
    expect(AI_SYSTEM_PROMPT).toContain('ALWAYS instruct staying on marked public paths');
    expect(AI_SYSTEM_PROMPT).toContain(SCREEN_FREE_REMINDER);
    expect(AI_SYSTEM_PROMPT).toContain('Return ONLY valid, minified JSON');
  });

  it('constructs a complete user prompt incorporating all user parameters', () => {
    const params: QuestParams = {
      durationMinutes: 45,
      environment: 'garden',
      mood: 'calm',
      intensity: 'gentle',
      experienceType: 'friends',
      interests: ['plants', 'mindfulness'],
      localContext: 'Botanical rose garden',
      accessibilityRequirements: 'Step-free paved paths only',
    };

    const prompt = buildQuestUserPrompt(params);

    expect(prompt).toContain('45-minute');
    expect(prompt).toContain('garden');
    expect(prompt).toContain('calm');
    expect(prompt).toContain('gentle');
    expect(prompt).toContain('friends');
    expect(prompt).toContain('plants, mindfulness');
    expect(prompt).toContain('Botanical rose garden');
    expect(prompt).toContain('Step-free paved paths only');
    expect(prompt).toContain('Step Count: Exactly 4 steps');
  });

  it('adjusts step count target based on duration', () => {
    const p15: QuestParams = {
      durationMinutes: 15,
      environment: 'neighborhood',
      mood: 'energetic',
      intensity: 'active',
      experienceType: 'solo',
      interests: ['walking'],
    };
    expect(buildQuestUserPrompt(p15)).toContain('Step Count: Exactly 3 steps');

    const p60: QuestParams = {
      ...p15,
      durationMinutes: 60,
    };
    expect(buildQuestUserPrompt(p60)).toContain('Step Count: Exactly 5 steps');
  });
});
