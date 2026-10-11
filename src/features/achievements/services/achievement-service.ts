import type { Achievement, Quest } from '@/types';

export class AchievementService {
  static calculateFromQuests(quests: Quest[]): Achievement[] {
    const completedQuests = quests.filter((q) => q.status === 'completed');

    // Total minutes calculated from actual elapsed time or duration
    const totalMinutes = completedQuests.reduce((sum, q) => {
      if (q.actualElapsedSeconds && q.actualElapsedSeconds > 0) {
        return sum + Math.round(q.actualElapsedSeconds / 60);
      }
      return sum + q.durationMinutes;
    }, 0);

    // Total sensory observation steps completed
    const sensoryStepsCompleted = completedQuests.reduce((sum, q) => {
      return (
        sum +
        q.steps.filter(
          (s) => s.isCompleted && (s.sensoryFocus || s.observationPrompt)
        ).length
      );
    }, 0);

    // Unique environments explored
    const distinctEnvironments = new Set(completedQuests.map((q) => q.environment));

    return [
      {
        id: 'first_adventure',
        title: 'First Adventure',
        description: 'Completed your first verified outdoor micro-adventure.',
        icon: 'Footprints',
        progress: Math.min(1, completedQuests.length),
        target: 1,
        unlockedAt: completedQuests[0]?.completedAt,
      },
      {
        id: 'minutes_30',
        title: '30 Minutes Outside',
        description: 'Accumulated 30+ recorded minutes away from screen noise.',
        icon: 'Clock',
        progress: Math.min(30, totalMinutes),
        target: 30,
        unlockedAt: totalMinutes >= 30 ? (completedQuests[completedQuests.length - 1]?.completedAt || new Date().toISOString()) : undefined,
      },
      {
        id: 'nature_observer',
        title: 'Nature Observer',
        description: 'Completed 5+ mindful sensory observations on living trails.',
        icon: 'Eye',
        progress: Math.min(5, sensoryStepsCompleted),
        target: 5,
        unlockedAt: sensoryStepsCompleted >= 5 ? new Date().toISOString() : undefined,
      },
      {
        id: 'multi_terrain',
        title: 'Multi-Terrain Explorer',
        description: 'Completed micro-adventures across 2 or more distinct environments.',
        icon: 'Compass',
        progress: Math.min(2, distinctEnvironments.size),
        target: 2,
        unlockedAt: distinctEnvironments.size >= 2 ? new Date().toISOString() : undefined,
      },
    ];
  }
}
