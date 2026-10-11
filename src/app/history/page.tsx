import React from 'react';
import type { Metadata } from 'next';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { HistoryList } from '@/features/history/components/HistoryList';

export const metadata: Metadata = {
  title: 'My Outdoor Journal | OutsideQuest AI',
  description: 'View your completed outdoor walks, sensory observations, and field reflections stored locally on your device.',
};

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-earth-border/80 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-earth-forest text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-earth-sage" />
            </div>
            <h1 className="text-2xl font-bold text-earth-forest tracking-tight">
              My Outdoor Journal
            </h1>
          </div>
          <Badge variant="sage" className="gap-1 text-xs py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-earth-forest" />
            <span>Stored in Local IndexedDB</span>
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-earth-muted leading-relaxed max-w-xl">
          A personal log of your nature micro-adventures, sensory milestones, and reflections. None of this data is ever synced to a remote server or shared with third parties.
        </p>
      </div>

      <HistoryList />
    </div>
  );
}
