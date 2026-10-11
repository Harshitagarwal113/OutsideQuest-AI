'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Quest, QuestEnvironment } from '@/types';
import { HistoryService } from '../services/history-service';

export function useQuestHistory(limit?: number) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [selectedEnvironment, setSelectedEnvironment] = useState<QuestEnvironment | 'all'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Quest[];
      if (limit) {
        data = await HistoryService.getRecent(limit);
      } else {
        data = await HistoryService.getAll();
      }
      setQuests(data);

      const minutes = await HistoryService.getTotalRecordedMinutes();
      setTotalMinutes(minutes);
    } catch (err) {
      console.error('Failed to load quest history:', err);
      setError('Could not load your local adventure history from IndexedDB.');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const removeQuest = useCallback(
    async (id: string) => {
      try {
        await HistoryService.delete(id);
        setQuests((prev) => prev.filter((q) => q.id !== id));
        const minutes = await HistoryService.getTotalRecordedMinutes();
        setTotalMinutes(minutes);
      } catch (err) {
        console.error('Failed to delete quest:', err);
      }
    },
    []
  );

  const clearAllData = useCallback(async () => {
    try {
      await HistoryService.clearAll();
      setQuests([]);
      setTotalMinutes(0);
    } catch (err) {
      console.error('Failed to clear journal data:', err);
      throw err;
    }
  }, []);

  const filteredQuests =
    selectedEnvironment === 'all'
      ? quests
      : quests.filter((q) => q.environment === selectedEnvironment);

  return {
    quests: filteredQuests,
    allQuests: quests,
    completedQuests: quests.filter((q) => q.status === 'completed'),
    totalMinutes,
    selectedEnvironment,
    setSelectedEnvironment,
    isLoading,
    error,
    refresh: fetchQuests,
    removeQuest,
    clearAllData,
  };
}
