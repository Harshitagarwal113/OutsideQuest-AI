import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import { SCREEN_FREE_REMINDER, GENERAL_SAFETY_GUIDANCE } from '@/lib/constants';

export const AI_SYSTEM_PROMPT = `You are OutsideQuest AI, an expert outdoor micro-adventure designer.
Your mission is to inspire people to step away from screens and connect with living nature.

RULES:
1. Return ONLY valid, minified JSON matching the specified schema. No markdown formatting, no conversational text before or after the JSON.
2. The JSON MUST have: "title", "summary", "theme", "introduction", "durationMinutes", "steps", "equipmentSuggestions", "safetyGuidance", "screenFreeReminder", and "reflectionQuestions".
3. "steps" MUST contain between 3 and 5 steps.
4. Each step MUST contain: "order" (1-based int), "title", "instruction", "durationMinutes" (positive integer), "sensoryFocus" ("sight"|"sound"|"touch"|"smell"|"curiosity"), and "observationPrompt".
5. CRITICAL: The sum of all step "durationMinutes" MUST EXACTLY EQUAL the requested duration.
6. SAFETY FIRST:
   - NEVER tell the user to touch or eat wild plants, berries, or mushrooms.
   - NEVER instruct approaching or handling wildlife.
   - ALWAYS instruct staying on marked public paths and watching footing.
   - Include the exact screen-free reminder: "${SCREEN_FREE_REMINDER}".
7. Never invent real-time weather forecasts or pretend to have live camera/GPS data.
8. Keep descriptions brief, sensory-rich, and grounding.`;

export function buildQuestUserPrompt(params: QuestParams): string {
  const stepCount = params.durationMinutes === 15 ? 3 : params.durationMinutes === 60 ? 5 : 4;

  let prompt = `Create a ${params.durationMinutes}-minute outdoor micro-adventure:
- Landscape: ${params.environment}
- Desired Mood: ${params.mood}
- Movement Pace: ${params.intensity}
- Companion Mode: ${params.experienceType}
- Focus Interests: ${params.interests.join(', ')}
- Step Count: Exactly ${stepCount} steps.
- Target Duration: ${params.durationMinutes} minutes total (all step durationMinutes must sum to ${params.durationMinutes}).`;

  if (params.localContext && params.localContext.trim()) {
    prompt += `\n- Local Context / Landmarks: "${params.localContext.trim()}"`;
  }

  if (params.accessibilityRequirements && params.accessibilityRequirements.trim()) {
    prompt += `\n- Accessibility Needs: "${params.accessibilityRequirements.trim()}". Adapt all paths to be step-free and include seated rests if requested.`;
  }

  prompt += `\n\nReturn JSON in this format:
{
  "title": "short evocative title",
  "summary": "1-2 sentence description",
  "theme": "short theme tags",
  "introduction": "brief invitation to step outside",
  "durationMinutes": ${params.durationMinutes},
  "steps": [
    {
      "order": 1,
      "title": "step title",
      "instruction": "actionable sensory activity",
      "durationMinutes": positive_number,
      "sensoryFocus": "sight",
      "observationPrompt": "what to notice"
    }
  ],
  "equipmentSuggestions": ["comfortable shoes", "water"],
  "safetyGuidance": ["stay on public pathways", "remain alert near roads"],
  "screenFreeReminder": "${SCREEN_FREE_REMINDER}",
  "reflectionQuestions": ["question 1", "question 2"]
}`;

  return prompt;
}
