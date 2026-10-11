import { describe, it, expect } from 'vitest';
import { QuestOutputParser } from '@/features/ai/services/quest-output-parser';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';

describe('QuestOutputParser', () => {
  const baseParams: QuestParams = {
    durationMinutes: 30,
    environment: 'park',
    mood: 'curious',
    intensity: 'moderate',
    experienceType: 'solo',
    interests: ['birds', 'plants'],
    localContext: 'Near the pond',
    accessibilityRequirements: '',
  };

  it('extracts JSON from markdown code fences', () => {
    const raw = `Here is your quest:
\`\`\`json
{
  "title": "Whispering Pines",
  "summary": "A peaceful 30-minute nature walk.",
  "theme": "CURIOUS • PARK",
  "introduction": "Step outside into the trees.",
  "durationMinutes": 30,
  "steps": [
    { "order": 1, "title": "Listen", "instruction": "Listen for bird calls in the canopy.", "durationMinutes": 10, "sensoryFocus": "sound" },
    { "order": 2, "title": "Observe", "instruction": "Notice the texture of pine needles on the trail.", "durationMinutes": 10, "sensoryFocus": "touch" },
    { "order": 3, "title": "Breathe", "instruction": "Pause and take three deep breaths.", "durationMinutes": 10, "sensoryFocus": "curiosity" }
  ],
  "equipmentSuggestions": ["Water"],
  "safetyGuidance": ["Stay on path"],
  "screenFreeReminder": "Phone away. Adventure on.",
  "reflectionQuestions": ["What was your favorite moment?", "How do you feel?"]
}
\`\`\`
Hope you enjoy!`;

    const extracted = QuestOutputParser.extractJsonString(raw);
    expect(extracted).toContain('"Whispering Pines"');
    expect(extracted.startsWith('{')).toBe(true);
    expect(extracted.endsWith('}')).toBe(true);
  });

  it('extracts bare JSON object without markdown fences', () => {
    const raw = `{"title": "Meadow Search", "summary": "Walk through meadow.", "theme": "NATURE", "introduction": "Welcome.", "durationMinutes": 30, "steps": []}`;
    const extracted = QuestOutputParser.extractJsonString(raw);
    expect(extracted).toBe(raw);
  });

  it('cleans trailing commas and raw control characters', () => {
    const dirty = '{\n  "title": "Clean Quest",\n  "steps": [\n    1,\n    2,\n  ],\n}';
    const cleaned = QuestOutputParser.cleanJsonString(dirty);
    expect(cleaned).not.toContain(',\n  ]');
    expect(cleaned).not.toContain(',\n}');
  });

  it('successfully parses, validates and normalizes a complete valid AI quest', () => {
    const validJson = JSON.stringify({
      title: 'Canopy & Creek Exploration',
      summary: 'A 30-minute mindful walk identifying pine cones and flowing water.',
      theme: 'CURIOUS • PARK',
      introduction: 'Unplug and let your senses guide you through the local park.',
      durationMinutes: 30,
      steps: [
        {
          order: 1,
          title: 'Canopy Gaze',
          instruction: 'Look upward and trace the pattern of the highest tree branches against the sky.',
          durationMinutes: 10,
          sensoryFocus: 'sight',
          observationPrompt: 'Count how many distinct shades of green you notice.',
        },
        {
          order: 2,
          title: 'Bark & Leaf Textures',
          instruction: 'Touch the bark of three different trees and note the differences.',
          durationMinutes: 10,
          sensoryFocus: 'touch',
          observationPrompt: 'Which tree felt warmest in the morning light?',
        },
        {
          order: 3,
          title: 'Stream Listening',
          instruction: 'Close your eyes for three minutes and focus entirely on the sound of the breeze.',
          durationMinutes: 10,
          sensoryFocus: 'sound',
          observationPrompt: 'Can you hear any distant water or birdsong?',
        },
      ],
      equipmentSuggestions: ['Comfortable walking shoes', 'Water bottle'],
      safetyGuidance: ['Stay on public pathways', 'Watch footing on loose gravel'],
      screenFreeReminder: 'Phone away. Adventure on.',
      reflectionQuestions: [
        'What natural pattern surprised you most?',
        'How did your pace change during the sensory pause?',
      ],
    });

    const quest = QuestOutputParser.parseAndValidate(validJson, baseParams);
    expect(quest).toBeDefined();
    expect(quest.title).toBe('Canopy & Creek Exploration');
    expect(quest.durationMinutes).toBe(30);
    expect(quest.steps.length).toBe(3);
    expect(quest.steps.reduce((sum, s) => sum + s.durationMinutes, 0)).toBe(30);
    expect(quest.generationSource).toBe('on-device-model');
  });

  it('redistributes step durations cleanly when model output drifts from total duration', () => {
    // Model generated step durations that sum to 25 instead of 30
    const driftJson = JSON.stringify({
      title: 'Drifting Walk',
      summary: 'A short walk where durations drift.',
      theme: 'CURIOUS • PARK',
      introduction: 'Step into nature.',
      durationMinutes: 30,
      steps: [
        { order: 1, title: 'Step 1', instruction: 'Walk along the paved trail and observe leaves.', durationMinutes: 5, sensoryFocus: 'sight' },
        { order: 2, title: 'Step 2', instruction: 'Listen for songbirds in the lower brush.', durationMinutes: 10, sensoryFocus: 'sound' },
        { order: 3, title: 'Step 3', instruction: 'Touch a dry pinecone on the ground.', durationMinutes: 10, sensoryFocus: 'touch' },
      ],
      equipmentSuggestions: ['Water'],
      safetyGuidance: ['Stay safe'],
      screenFreeReminder: 'Phone away. Adventure on.',
      reflectionQuestions: ['Question 1?', 'Question 2?'],
    });

    const quest = QuestOutputParser.parseAndValidate(driftJson, baseParams);
    expect(quest.durationMinutes).toBe(30);
    const sum = quest.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
    expect(sum).toBe(30);
    expect(quest.steps.every((s) => s.durationMinutes > 0)).toBe(true);
  });

  it('rejects output with fewer than 3 or more than 5 steps', () => {
    const tooFewSteps = JSON.stringify({
      title: 'Short',
      summary: 'Too few steps.',
      durationMinutes: 30,
      steps: [
        { order: 1, title: 'Only 1', instruction: 'Only one step here.', durationMinutes: 30 },
      ],
    });

    expect(() => QuestOutputParser.parseAndValidate(tooFewSteps, baseParams)).toThrow(
      /Invalid step count/
    );
  });

  it('strictly rejects unsafe suggestions (e.g. foraging or eating wild flora)', () => {
    const unsafeJson = JSON.stringify({
      title: 'Wild Foraging',
      summary: 'Dangerous walk.',
      durationMinutes: 30,
      theme: 'PARK',
      introduction: 'Explore.',
      steps: [
        { order: 1, title: 'Step 1', instruction: 'Walk along the dirt path.', durationMinutes: 10 },
        { order: 2, title: 'Step 2', instruction: 'Find and eat wild mushrooms by the log.', durationMinutes: 10 },
        { order: 3, title: 'Step 3', instruction: 'Rest on a bench.', durationMinutes: 10 },
      ],
      equipmentSuggestions: ['Basket'],
      safetyGuidance: ['Caution'],
      screenFreeReminder: 'Phone away. Adventure on.',
      reflectionQuestions: ['How did it taste?', 'Are you well?'],
    });

    expect(() => QuestOutputParser.parseAndValidate(unsafeJson, baseParams)).toThrow(
      /violated safety criteria.*forbidden instruction "eat"/
    );
  });

  it('throws on non-JSON model output', () => {
    const badText = 'I am an AI and I cannot generate quests right now.';
    expect(() => QuestOutputParser.parseAndValidate(badText, baseParams)).toThrow(
      /No JSON object found/
    );
  });
});
