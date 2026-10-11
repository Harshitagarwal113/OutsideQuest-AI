import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestRepository } from '@/lib/storage/quest-repository';
import { SettingsRepository } from '@/lib/storage/settings-repository';
import * as databaseModule from '@/lib/storage/database';
import { DEFAULT_SETTINGS } from '@/lib/constants';

describe('Storage Resilience & Failure Handling (Feature 6)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles null database gracefully during SSR or disabled IndexedDB', async () => {
    // Mock getDatabase returning null (simulating server-side or blocked storage)
    vi.spyOn(databaseModule, 'getDatabase').mockResolvedValue(null);

    const allQuests = await QuestRepository.getAll();
    expect(allQuests).toEqual([]);

    const single = await QuestRepository.getById('any_id');
    expect(single).toBeNull();

    const totalMinutes = await QuestRepository.getTotalRecordedOutdoorMinutes();
    expect(totalMinutes).toBe(0);

    const settings = await SettingsRepository.get();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('handles database read exceptions without crashing', async () => {
    // Mock getDatabase returning a throwing mock
    const throwingDb = {
      getAll: vi.fn().mockRejectedValue(new Error('IndexedDB Transaction Corrupted')),
      get: vi.fn().mockRejectedValue(new Error('IndexedDB Quota Corrupted')),
    } as unknown as Awaited<ReturnType<typeof databaseModule.getDatabase>>;

    vi.spyOn(databaseModule, 'getDatabase').mockResolvedValue(throwingDb);

    const results = await QuestRepository.getAll();
    expect(results).toEqual([]);

    const item = await QuestRepository.getById('corrupted_id');
    expect(item).toBeNull();
  });

  it('handles database write exceptions by propagating to caller for graceful UI error display', async () => {
    const quotaExceededDb = {
      put: vi.fn().mockRejectedValue(new Error('QuotaExceededError')),
    } as unknown as Awaited<ReturnType<typeof databaseModule.getDatabase>>;

    vi.spyOn(databaseModule, 'getDatabase').mockResolvedValue(quotaExceededDb);

    await expect(
      QuestRepository.save({
        id: 'test_err',
        title: 'Title',
        summary: 'Summary',
        durationMinutes: 15,
        theme: 'T',
        introduction: 'I',
        environment: 'park',
        mood: 'curious',
        intensity: 'moderate',
        experienceType: 'solo',
        interests: ['birds'],
        steps: [],
        equipmentSuggestions: [],
        safetyGuidance: [],
        screenFreeReminder: 'R',
        reflectionQuestions: [],
        generationSource: 'curated-template',
        status: 'draft',
        createdAt: 'now',
        updatedAt: 'now',
      })
    ).rejects.toThrow('QuotaExceededError');
  });
});
