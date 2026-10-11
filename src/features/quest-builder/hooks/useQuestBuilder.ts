'use client';

import { useState, useCallback } from 'react';
import type { QuestParams } from '../schemas/quest-params';
import { QuestGeneratorService } from '../services/generator';
import type { Quest, QuestInterest } from '@/types';

export const defaultQuestParams: QuestParams = {
  durationMinutes: 15,
  environment: 'park',
  mood: 'curious',
  intensity: 'moderate',
  experienceType: 'solo',
  interests: ['birds', 'plants'],
  localContext: '',
  accessibilityRequirements: '',
};

export function useQuestBuilder() {
  const [params, setParams] = useState<QuestParams>(defaultQuestParams);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuest, setGeneratedQuest] = useState<Quest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateParam = useCallback(
    <K extends keyof QuestParams>(key: K, value: QuestParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
      if (error) setError(null);
    },
    [error]
  );

  const toggleInterest = useCallback((interest: QuestInterest) => {
    setParams((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        // Keep at least 1 interest
        if (prev.interests.length <= 1) return prev;
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      }
    });
  }, []);

  const generateQuest = useCallback(
    async (options?: { forceFallback?: boolean; preferLocalAi?: boolean }) => {
      setIsGenerating(true);
      setError(null);

      try {
        const result = await QuestGeneratorService.generate(params, options);
        setGeneratedQuest(result);
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to generate quest. Please verify options.';
        setError(msg);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [params]
  );

  const resetBuilder = useCallback(() => {
    setGeneratedQuest(null);
    setError(null);
  }, []);

  return {
    params,
    isGenerating,
    generatedQuest,
    error,
    updateParam,
    toggleInterest,
    generateQuest,
    resetBuilder,
    setGeneratedQuest,
  };
}
