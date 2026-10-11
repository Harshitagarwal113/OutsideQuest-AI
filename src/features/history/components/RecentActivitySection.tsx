'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useQuestHistory } from '../hooks/useQuestHistory';
import { formatDate, formatDuration } from '@/lib/utils';
import type { Quest } from '@/types';

interface RecentActivitySectionProps {
  onSelectQuest?: (quest: Quest) => void;
}

export function RecentActivitySection({ onSelectQuest }: RecentActivitySectionProps) {
  const { quests, isLoading } = useQuestHistory(3);

  return (
    <section aria-labelledby="recent-activity-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="recent-activity-title"
            className="text-lg font-bold text-earth-forest tracking-tight"
          >
            Recent Outdoor Activity
          </h2>
          <p className="text-xs text-earth-muted">
            Persisted exclusively in your browser’s IndexedDB storage.
          </p>
        </div>
        {quests.length > 0 && (
          <Link
            href="/history"
            className="text-xs font-semibold text-earth-forest hover:text-earth-forest-hover flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
          >
            <span>View Full Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          message="Checking local journal records..."
          subtext="Reading from IndexedDB cache"
        />
      ) : quests.length === 0 ? (
        <EmptyState
          title="No Outdoor Quests Logged Yet"
          description="Your trail history is empty. Choose your surroundings above to generate your first nature micro-adventure. Completed steps and reflections will be logged right here."
          icon={<Compass className="w-6 h-6 text-earth-forest" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quests.map((quest) => (
            <Card
              key={quest.id}
              variant="default"
              className="border-earth-border/80 hover:border-earth-forest/40 transition-colors shadow-xs"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-earth-muted">{formatDate(quest.createdAt)}</span>
                  <Badge
                    variant={quest.status === 'completed' ? 'sage' : 'sand'}
                    className="text-[10px] py-0 px-2"
                  >
                    {quest.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-earth-forest">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : (
                      'Draft'
                    )}
                  </Badge>
                </div>
                <CardTitle className="text-base text-earth-charcoal truncate">
                  {quest.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-2">
                <p className="text-xs text-earth-muted line-clamp-2 leading-relaxed">
                  {quest.summary}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-earth-charcoal pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-earth-muted" />
                    {formatDuration(quest.durationMinutes)}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{quest.environment}</span>
                </div>
                {onSelectQuest && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8"
                      onClick={() => onSelectQuest(quest)}
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
