'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Quest, QuestReflection, ActiveSessionPersistedState } from '@/types';
import { QuestSessionService } from '../services/session-service';

export function useQuestSession(initialQuest: Quest) {
  const [quest, setQuest] = useState<Quest>(initialQuest);
  const [sessionState, setSessionState] = useState<ActiveSessionPersistedState | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const initializedRef = useRef(false);

  // Initialize or restore session
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    QuestSessionService.startQuest(initialQuest).then(({ quest: startedQuest, sessionState: state }) => {
      setQuest(startedQuest);
      setSessionState(state);
      setCurrentStepIndex(state.currentStepIndex || 0);
      setElapsedSeconds(QuestSessionService.computeElapsedSeconds(state));
    });
  }, [initialQuest]);

  // Real-time ticking timer (updates elapsedSeconds every second using wall clock)
  useEffect(() => {
    if (!sessionState || sessionState.isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds(QuestSessionService.computeElapsedSeconds(sessionState));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState]);

  const toggleStep = useCallback(
    async (stepId: string) => {
      if (!sessionState) return;
      try {
        const { quest: updatedQuest, sessionState: updatedState } =
          await QuestSessionService.toggleStep(quest, sessionState, stepId);
        setQuest(updatedQuest);
        setSessionState(updatedState);
      } catch (err) {
        console.error('Failed to toggle step:', err);
      }
    },
    [quest, sessionState]
  );

  const goToNextStep = useCallback(() => {
    if (currentStepIndex < quest.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (sessionState) {
        const updated = { ...sessionState, currentStepIndex: nextIndex };
        setSessionState(updated);
        QuestSessionService.persistSession(updated);
      }
    }
  }, [currentStepIndex, quest.steps.length, sessionState]);

  const goToPrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (sessionState) {
        const updated = { ...sessionState, currentStepIndex: prevIndex };
        setSessionState(updated);
        QuestSessionService.persistSession(updated);
      }
    }
  }, [currentStepIndex, sessionState]);

  const pauseSession = useCallback(() => {
    if (!sessionState || sessionState.isPaused) return;
    const paused = QuestSessionService.pauseSession(sessionState);
    setSessionState(paused);
    setElapsedSeconds(QuestSessionService.computeElapsedSeconds(paused));
  }, [sessionState]);

  const resumeSession = useCallback(() => {
    if (!sessionState || !sessionState.isPaused) return;
    const resumed = QuestSessionService.resumeSession(sessionState);
    setSessionState(resumed);
    setElapsedSeconds(QuestSessionService.computeElapsedSeconds(resumed));
  }, [sessionState]);

  const submitReflectionAndComplete = useCallback(
    async (reflection: QuestReflection) => {
      setIsFinishing(true);
      try {
        const completedQuest = await QuestSessionService.completeQuest(
          quest,
          elapsedSeconds,
          reflection
        );
        setQuest(completedQuest);
        return completedQuest;
      } catch (err) {
        console.error('Failed to complete quest:', err);
        throw err;
      } finally {
        setIsFinishing(false);
      }
    },
    [quest, elapsedSeconds]
  );

  const exitSession = useCallback(async () => {
    try {
      await QuestSessionService.abandonQuest(quest);
    } catch (err) {
      console.warn('Failed to abandon quest session:', err);
    }
  }, [quest]);

  return {
    quest,
    sessionState,
    currentStepIndex,
    setCurrentStepIndex,
    elapsedSeconds,
    isPaused: sessionState?.isPaused ?? false,
    isFinishing,
    toggleStep,
    goToNextStep,
    goToPrevStep,
    pauseSession,
    resumeSession,
    submitReflectionAndComplete,
    exitSession,
  };
}
