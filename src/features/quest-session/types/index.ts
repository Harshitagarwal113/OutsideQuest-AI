import type { Quest, QuestStep } from '@/types';

export interface QuestSessionState {
  quest: Quest | null;
  currentStepIndex: number;
  isCompleted: boolean;
  notes: string;
}

export type { Quest, QuestStep };
