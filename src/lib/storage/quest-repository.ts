import { getDatabase } from './database';
import { DB_STORES } from '@/lib/constants';
import type { Quest, QuestEnvironment } from '@/types';

export class QuestRepository {
  static async getAll(): Promise<Quest[]> {
    const db = await getDatabase();
    if (!db) return [];
    try {
      const all = await db.getAll(DB_STORES.QUESTS);
      // Sort newest first
      return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Failed to retrieve quests from IndexedDB:', error);
      return [];
    }
  }

  static async getCompleted(): Promise<Quest[]> {
    const all = await this.getAll();
    return all.filter((q) => q.status === 'completed');
  }

  static async getById(id: string): Promise<Quest | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const quest = await db.get(DB_STORES.QUESTS, id);
      return quest ?? null;
    } catch (error) {
      console.warn(`Failed to retrieve quest ${id}:`, error);
      return null;
    }
  }

  static async save(quest: Quest): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    try {
      await db.put(DB_STORES.QUESTS, quest);
    } catch (error) {
      console.warn('Failed to save quest to IndexedDB:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    try {
      await db.delete(DB_STORES.QUESTS, id);
    } catch (error) {
      console.warn(`Failed to delete quest ${id}:`, error);
      throw error;
    }
  }

  static async clearAll(): Promise<void> {
    const db = await getDatabase();
    if (!db) return;
    try {
      await db.clear(DB_STORES.QUESTS);
    } catch (error) {
      console.warn('Failed to clear quests in IndexedDB:', error);
      throw error;
    }
  }

  static async getActive(): Promise<Quest | null> {
    const db = await getDatabase();
    if (!db) return null;
    try {
      const activeQuests = await db.getAllFromIndex(DB_STORES.QUESTS, 'by-status', 'active');
      return activeQuests[0] ?? null;
    } catch (error) {
      console.warn('Failed to retrieve active quest:', error);
      return null;
    }
  }

  static async getRecent(limit = 5): Promise<Quest[]> {
    const all = await this.getAll();
    return all.slice(0, limit);
  }

  static async getTotalRecordedOutdoorMinutes(): Promise<number> {
    const completed = await this.getCompleted();
    return completed.reduce((sum, q) => {
      if (q.actualElapsedSeconds && q.actualElapsedSeconds > 0) {
        return sum + Math.round(q.actualElapsedSeconds / 60);
      }
      return sum + q.durationMinutes;
    }, 0);
  }

  static async getFiltered(environment?: QuestEnvironment | 'all'): Promise<Quest[]> {
    const all = await this.getAll();
    if (!environment || environment === 'all') return all;
    return all.filter((q) => q.environment === environment);
  }
}
