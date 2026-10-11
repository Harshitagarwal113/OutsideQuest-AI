import type { QuestParams } from '../schemas/quest-params';
import type { Quest } from '@/types';

export interface QuestGenerator {
  generate(params: QuestParams): Promise<Quest>;
}
