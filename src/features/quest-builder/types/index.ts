import type { QuestParams } from '../schemas/quest-params';
import type { Quest } from '@/types';

export type { QuestParams };

export interface QuestBuilderState {
  params: QuestParams;
  isGenerating: boolean;
  generatedQuest: Quest | null;
  error: string | null;
}
