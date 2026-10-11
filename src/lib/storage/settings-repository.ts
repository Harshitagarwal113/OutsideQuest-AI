import { getDatabase } from './database';
import { DB_STORES, DEFAULT_SETTINGS } from '@/lib/constants';
import type { UserSettings } from '@/types';

export class SettingsRepository {
  static async get(): Promise<UserSettings> {
    const db = await getDatabase();
    if (!db) return DEFAULT_SETTINGS;
    try {
      const settings = await db.get(DB_STORES.SETTINGS, 'current_user');
      return settings || DEFAULT_SETTINGS;
    } catch (error) {
      console.warn('Failed to get settings from IndexedDB:', error);
      return DEFAULT_SETTINGS;
    }
  }

  static async save(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.get();
    const updated: UserSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    const db = await getDatabase();
    if (db) {
      try {
        await db.put(DB_STORES.SETTINGS, updated);
      } catch (error) {
        console.warn('Failed to save settings to IndexedDB:', error);
      }
    }

    return updated;
  }
}
