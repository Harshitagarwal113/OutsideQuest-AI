import React from 'react';
import { Award, Lock, Footprints, Eye, Clock, Compass } from 'lucide-react';
import type { Achievement } from '@/types';
import { cn } from '@/lib/utils';

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const isUnlocked = !!achievement.unlockedAt;

  const renderIcon = () => {
    switch (achievement.icon) {
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-earth-sage" />;
      case 'Eye':
        return <Eye className="w-5 h-5 text-earth-sage" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-earth-sage" />;
      case 'Compass':
      default:
        return <Compass className="w-5 h-5 text-earth-sage" />;
    }
  };

  return (
    <div
      className={cn(
        'p-3 rounded-xl border flex items-center gap-3 transition-colors',
        isUnlocked
          ? 'bg-earth-sand-light/60 border-earth-forest/30 text-earth-charcoal shadow-xs'
          : 'bg-white/40 border-earth-border/60 text-earth-muted opacity-75'
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
          isUnlocked
            ? 'bg-earth-forest text-white shadow-xs'
            : 'bg-earth-sand text-earth-muted'
        )}
      >
        {isUnlocked ? renderIcon() : <Lock className="w-4 h-4 text-earth-muted" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs text-earth-charcoal block truncate">
              {achievement.title}
            </span>
            {isUnlocked && <Award className="w-3.5 h-3.5 text-earth-accent shrink-0" />}
          </div>
          <span className="text-[10px] font-mono text-earth-muted shrink-0">
            {achievement.progress}/{achievement.target}
          </span>
        </div>
        <p className="text-[11px] text-earth-muted leading-tight mt-0.5">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}
