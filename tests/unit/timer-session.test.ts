import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuestSessionService } from '@/features/quest-session/services/session-service';
import type { ActiveSessionPersistedState } from '@/types';

describe('Quest Session Timer & Calculations (Feature 3)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('computes accurate elapsed seconds from start timestamp', () => {
    const startedAt = 1000000;
    const now = startedAt + 125 * 1000; // 125 seconds later

    vi.spyOn(Date, 'now').mockReturnValue(now);

    const sessionState: ActiveSessionPersistedState = {
      questId: 'quest_timer_test',
      startedAtTimestamp: startedAt,
      elapsedPausedSeconds: 0,
      isPaused: false,
      pausedAtTimestamp: null,
      currentStepIndex: 0,
      stepsCompleted: {},
    };

    const elapsed = QuestSessionService.computeElapsedSeconds(sessionState);
    expect(elapsed).toBe(125);
  });

  it('freezes elapsed time while session is paused', () => {
    const startedAt = 1000000;
    const pausedAt = startedAt + 60 * 1000; // Paused after 60s
    const laterTime = pausedAt + 300 * 1000; // 5 minutes pass while paused

    vi.spyOn(Date, 'now').mockReturnValue(laterTime);

    const pausedState: ActiveSessionPersistedState = {
      questId: 'quest_timer_test',
      startedAtTimestamp: startedAt,
      elapsedPausedSeconds: 0,
      isPaused: true,
      pausedAtTimestamp: pausedAt,
      currentStepIndex: 1,
      stepsCompleted: {},
    };

    const elapsed = QuestSessionService.computeElapsedSeconds(pausedState);
    expect(elapsed).toBe(60);
  });

  it('accounts for paused duration after resuming session', () => {
    const startedAt = 1000000;
    const pausedAt = startedAt + 60 * 1000;
    const resumeAt = pausedAt + 40 * 1000; // Paused for 40 seconds

    // Pause
    const state: ActiveSessionPersistedState = {
      questId: 'quest_timer_test',
      startedAtTimestamp: startedAt,
      elapsedPausedSeconds: 0,
      isPaused: false,
      pausedAtTimestamp: null,
      currentStepIndex: 1,
      stepsCompleted: {},
    };

    vi.spyOn(Date, 'now').mockReturnValue(pausedAt);
    const paused = QuestSessionService.pauseSession(state);
    expect(paused.isPaused).toBe(true);

    vi.spyOn(Date, 'now').mockReturnValue(resumeAt);
    const resumed = QuestSessionService.resumeSession(paused);
    expect(resumed.isPaused).toBe(false);
    expect(resumed.elapsedPausedSeconds).toBe(40);

    // 10 seconds of active walking after resume
    const walkTime = resumeAt + 10 * 1000;
    vi.spyOn(Date, 'now').mockReturnValue(walkTime);

    const netElapsed = QuestSessionService.computeElapsedSeconds(resumed);
    // Total clock elapsed: 60s + 40s + 10s = 110s. Minus 40s paused = 70s.
    expect(netElapsed).toBe(70);
  });

  it('persists and retrieves session state from localStorage', () => {
    const state: ActiveSessionPersistedState = {
      questId: 'quest_persist_1',
      startedAtTimestamp: 1234567,
      elapsedPausedSeconds: 15,
      isPaused: false,
      pausedAtTimestamp: null,
      currentStepIndex: 2,
      stepsCompleted: { step_1: true },
    };

    QuestSessionService.persistSession(state);

    const loaded = QuestSessionService.getPersistedSession('quest_persist_1');
    expect(loaded).not.toBeNull();
    expect(loaded?.currentStepIndex).toBe(2);
    expect(loaded?.stepsCompleted['step_1']).toBe(true);

    // Mismatched quest ID returns null
    const wrongQuest = QuestSessionService.getPersistedSession('other_quest');
    expect(wrongQuest).toBeNull();
  });
});
