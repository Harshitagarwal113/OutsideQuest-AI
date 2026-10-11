import { QuestRepository } from '@/lib/storage/quest-repository';
import type { Quest, QuestReflection, ActiveSessionPersistedState } from '@/types';

const SESSION_STORAGE_KEY = 'outsidequest_active_session_v1';

export class QuestSessionService {
  static getPersistedSession(questId: string): ActiveSessionPersistedState | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const parsed: ActiveSessionPersistedState = JSON.parse(raw);
      return parsed.questId === questId ? parsed : null;
    } catch {
      return null;
    }
  }

  static persistSession(state: ActiveSessionPersistedState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed to persist session to localStorage:', err);
    }
  }

  static clearPersistedSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  static computeElapsedSeconds(state: ActiveSessionPersistedState | null): number {
    if (!state) return 0;
    const now = state.isPaused && state.pausedAtTimestamp ? state.pausedAtTimestamp : Date.now();
    const rawElapsed = Math.floor((now - state.startedAtTimestamp) / 1000);
    const net = rawElapsed - state.elapsedPausedSeconds;
    return Math.max(0, net);
  }

  static async startQuest(quest: Quest): Promise<{ quest: Quest; sessionState: ActiveSessionPersistedState }> {
    const existing = this.getPersistedSession(quest.id);
    let sessionState: ActiveSessionPersistedState;

    if (existing) {
      sessionState = existing;
    } else {
      const initialCompletedMap: Record<string, boolean> = {};
      quest.steps.forEach((s) => {
        initialCompletedMap[s.id] = s.isCompleted;
      });

      sessionState = {
        questId: quest.id,
        startedAtTimestamp: Date.now(),
        elapsedPausedSeconds: 0,
        isPaused: false,
        pausedAtTimestamp: null,
        currentStepIndex: 0,
        stepsCompleted: initialCompletedMap,
      };
      this.persistSession(sessionState);
    }

    const updated: Quest = {
      ...quest,
      status: 'active',
      startedAt: quest.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await QuestRepository.save(updated);
    return { quest: updated, sessionState };
  }

  static pauseSession(state: ActiveSessionPersistedState): ActiveSessionPersistedState {
    if (state.isPaused) return state;
    const updated: ActiveSessionPersistedState = {
      ...state,
      isPaused: true,
      pausedAtTimestamp: Date.now(),
    };
    this.persistSession(updated);
    return updated;
  }

  static resumeSession(state: ActiveSessionPersistedState): ActiveSessionPersistedState {
    if (!state.isPaused) return state;
    const pausedDuration = state.pausedAtTimestamp
      ? Math.floor((Date.now() - state.pausedAtTimestamp) / 1000)
      : 0;

    const updated: ActiveSessionPersistedState = {
      ...state,
      isPaused: false,
      pausedAtTimestamp: null,
      elapsedPausedSeconds: state.elapsedPausedSeconds + pausedDuration,
    };
    this.persistSession(updated);
    return updated;
  }

  static async toggleStep(
    quest: Quest,
    sessionState: ActiveSessionPersistedState,
    stepId: string
  ): Promise<{ quest: Quest; sessionState: ActiveSessionPersistedState }> {
    const now = new Date().toISOString();
    const isNowDone = !sessionState.stepsCompleted[stepId];

    const updatedMap = {
      ...sessionState.stepsCompleted,
      [stepId]: isNowDone,
    };

    const updatedSteps = quest.steps.map((step) => {
      if (step.id === stepId) {
        return {
          ...step,
          isCompleted: isNowDone,
          completedAt: isNowDone ? now : undefined,
        };
      }
      return step;
    });

    const updatedQuest: Quest = {
      ...quest,
      steps: updatedSteps,
      updatedAt: now,
    };

    const updatedSessionState: ActiveSessionPersistedState = {
      ...sessionState,
      stepsCompleted: updatedMap,
    };

    this.persistSession(updatedSessionState);
    await QuestRepository.save(updatedQuest);

    return { quest: updatedQuest, sessionState: updatedSessionState };
  }

  static async completeQuest(
    quest: Quest,
    actualElapsedSeconds: number,
    reflection: QuestReflection
  ): Promise<Quest> {
    const now = new Date().toISOString();
    const updated: Quest = {
      ...quest,
      status: 'completed',
      completedAt: now,
      actualElapsedSeconds,
      reflection,
      updatedAt: now,
    };

    this.clearPersistedSession();
    await QuestRepository.save(updated);
    return updated;
  }

  static async abandonQuest(quest: Quest): Promise<Quest> {
    const now = new Date().toISOString();
    const updated: Quest = {
      ...quest,
      status: 'abandoned',
      updatedAt: now,
    };

    this.clearPersistedSession();
    await QuestRepository.save(updated);
    return updated;
  }
}
