import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, DB_STORES } from '@/lib/constants';
import type { Quest, UserSettings, Achievement } from '@/types';

export interface OutsideQuestDBSchema extends DBSchema {
  [DB_STORES.QUESTS]: {
    key: string;
    value: Quest;
    indexes: {
      'by-status': string;
      'by-created': string;
      'by-environment': string;
    };
  };
  [DB_STORES.SETTINGS]: {
    key: string;
    value: UserSettings;
  };
  [DB_STORES.ACHIEVEMENTS]: {
    key: string;
    value: Achievement;
  };
}

let dbPromise: Promise<IDBPDatabase<OutsideQuestDBSchema>> | null = null;

export async function getDatabase(): Promise<IDBPDatabase<OutsideQuestDBSchema> | null> {
  // Guard against server-side rendering execution
  if (typeof window === 'undefined' || !window.indexedDB) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = openDB<OutsideQuestDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Quests store
        if (!db.objectStoreNames.contains(DB_STORES.QUESTS)) {
          const questStore = db.createObjectStore(DB_STORES.QUESTS, {
            keyPath: 'id',
          });
          questStore.createIndex('by-status', 'status');
          questStore.createIndex('by-created', 'createdAt');
          questStore.createIndex('by-environment', 'environment');
        }

        // Settings store
        if (!db.objectStoreNames.contains(DB_STORES.SETTINGS)) {
          db.createObjectStore(DB_STORES.SETTINGS, { keyPath: 'id' });
        }

        // Achievements store
        if (!db.objectStoreNames.contains(DB_STORES.ACHIEVEMENTS)) {
          db.createObjectStore(DB_STORES.ACHIEVEMENTS, { keyPath: 'id' });
        }
      },
    });
  }

  return dbPromise;
}
