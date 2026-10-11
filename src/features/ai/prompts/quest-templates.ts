import { QuestEnvironment, QuestDuration, QuestMood, QuestExperienceType, QuestStep } from '@/types';
import { generateId } from '@/lib/utils';

export interface PromptSeed {
  title: string;
  summary: string;
  steps: Array<{
    title: string;
    instruction: string;
    durationMinutes: number;
    sensoryFocus: QuestStep['sensoryFocus'];
  }>;
}

export const MOOD_SEEDS: Record<QuestMood, PromptSeed> = {
  curious: {
    title: 'Curiosity Explorer Walk',
    summary: 'A mindful journey seeking out micro-patterns, wildlife signs, and seasonal change.',
    steps: [
      {
        title: 'Micro Botanical Study',
        instruction: 'Find wild moss, lichens, or seed pods along your path. Observe the miniature world thriving in crevices.',
        durationMinutes: 5,
        sensoryFocus: 'sight',
      },
      {
        title: 'Acoustic Sound Triangulation',
        instruction: 'Close your eyes. Identify the farthest natural sound you can hear through traffic murmur.',
        durationMinutes: 5,
        sensoryFocus: 'sound',
      },
      {
        title: 'Texture & Temperature Mapping',
        instruction: 'Run your fingertips along tree bark, river stones, or weathered wooden rails.',
        durationMinutes: 5,
        sensoryFocus: 'touch',
      },
    ],
  },
  calm: {
    title: 'Quiet Haven Journey',
    summary: 'A slow sensory observation walk to soften visual fatigue and reset attention span.',
    steps: [
      {
        title: 'Threshold Grounding',
        instruction: 'Stand beneath tree shade or open sky for 2 minutes without checking any digital screen.',
        durationMinutes: 5,
        sensoryFocus: 'touch',
      },
      {
        title: 'Deep Canopy Breath',
        instruction: 'Take measured inhalations while gazing up into overhead foliage.',
        durationMinutes: 5,
        sensoryFocus: 'smell',
      },
      {
        title: 'Peripheral Horizon Softness',
        instruction: 'Walk slowly with a soft gaze, taking in peripheral wind and shadow motion.',
        durationMinutes: 5,
        sensoryFocus: 'sight',
      },
    ],
  },
  energetic: {
    title: 'Dynamic Movement Trail',
    summary: 'An active cadence expedition engaging brisk strides, natural inclines, and physical agility.',
    steps: [
      {
        title: 'Cadence Surge',
        instruction: 'Maintain a brisk power-walking pace, pushing off firmly from toes and calves.',
        durationMinutes: 5,
        sensoryFocus: 'touch',
      },
      {
        title: 'Incline & Terrain Challenge',
        instruction: 'Ascend a gentle rise or uneven trail with upright posture and rhythmic breathing.',
        durationMinutes: 5,
        sensoryFocus: 'touch',
      },
      {
        title: 'Equilibrium & Balance Stride',
        instruction: 'Walk along stone borders or narrow trail sections with agile, deliberate footwork.',
        durationMinutes: 5,
        sensoryFocus: 'curiosity',
      },
    ],
  },
  social: {
    title: 'Shared Nature Discovery',
    summary: 'Collaborative observation moments perfect for conversational pauses and shared curiosity.',
    steps: [
      {
        title: 'Dual Sensory Check-In',
        instruction: 'Pause with your companion. Point out one subtle natural movement that the other had not seen.',
        durationMinutes: 5,
        sensoryFocus: 'sight',
      },
      {
        title: 'Soundscape Comparison',
        instruction: 'Listen quietly for 30 seconds, then share the three clearest ambient sounds you identified.',
        durationMinutes: 5,
        sensoryFocus: 'sound',
      },
      {
        title: 'Shared Flora Landmark',
        instruction: 'Find the oldest tree or most vibrant flowering bush along your route and pause together.',
        durationMinutes: 5,
        sensoryFocus: 'curiosity',
      },
    ],
  },
};

export function buildQuestFromSeed(
  environment: QuestEnvironment,
  durationMinutes: QuestDuration,
  mood: QuestMood,
  experienceType: QuestExperienceType,
  localContext?: string
): { title: string; summary: string; steps: QuestStep[] } {
  const seed = MOOD_SEEDS[mood] || MOOD_SEEDS.curious;

  // Build steps with duration
  const perStepDuration = Math.round(durationMinutes / seed.steps.length);
  const steps: QuestStep[] = seed.steps.map((raw, idx) => ({
    id: generateId('step'),
    order: idx + 1,
    title: raw.title,
    instruction: raw.instruction,
    durationMinutes: perStepDuration,
    sensoryFocus: raw.sensoryFocus,
    isCompleted: false,
  }));

  let summary = `${seed.summary} Tailored for ${environment}.`;
  if (localContext) {
    summary += ` Context: "${localContext.trim()}".`;
  }

  return {
    title: `${seed.title} in the ${environment}`,
    summary,
    steps,
  };
}
