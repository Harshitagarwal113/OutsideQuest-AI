import { QuestRepository } from '@/lib/storage/quest-repository';
import type { Quest, QuestEnvironment } from '@/types';

export class HistoryService {
  static async getRecent(limit = 3): Promise<Quest[]> {
    return QuestRepository.getRecent(limit);
  }

  static async getAll(): Promise<Quest[]> {
    return QuestRepository.getAll();
  }

  static async getCompleted(): Promise<Quest[]> {
    return QuestRepository.getCompleted();
  }

  static async getTotalRecordedMinutes(): Promise<number> {
    return QuestRepository.getTotalRecordedOutdoorMinutes();
  }

  static async getFiltered(environment?: QuestEnvironment | 'all'): Promise<Quest[]> {
    return QuestRepository.getFiltered(environment);
  }

  static async delete(id: string): Promise<void> {
    return QuestRepository.delete(id);
  }

  static async clearAll(): Promise<void> {
    return QuestRepository.clearAll();
  }
}
