'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Trash2,
  Clock,
  CheckCircle2,
  MapPin,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Award,
  Filter,
  Check,
  AlertTriangle,
  Download,
  Printer,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { AchievementBadge } from '@/features/achievements/components/AchievementBadge';
import { AchievementService } from '@/features/achievements/services/achievement-service';
import { useQuestHistory } from '../hooks/useQuestHistory';
import { formatDate, formatDuration } from '@/lib/utils';
import type { QuestEnvironment } from '@/types';

export function HistoryList() {
  const {
    quests,
    allQuests,
    completedQuests,
    totalMinutes,
    selectedEnvironment,
    setSelectedEnvironment,
    isLoading,
    removeQuest,
    clearAllData,
  } = useQuestHistory();

  // State to track expanded detail view for each quest
  const [expandedQuestIds, setExpandedQuestIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedQuestIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all local adventure records? This action cannot be undone.')) {
      await clearAllData();
    }
  };

  const handleExportJournal = () => {
    if (allQuests.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allQuests, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `outsidequest_journal_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintNotes = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        message="Loading your outdoor adventures..."
        subtext="Accessing your device’s IndexedDB journal"
      />
    );
  }

  // Calculate transparent achievements from actual records
  const achievements = AchievementService.calculateFromQuests(allQuests);

  const envFilterOptions: Array<{ value: QuestEnvironment | 'all'; label: string }> = [
    { value: 'all', label: 'All Environments' },
    { value: 'park', label: 'Parks' },
    { value: 'garden', label: 'Gardens' },
    { value: 'neighborhood', label: 'Neighborhood' },
    { value: 'campus', label: 'Campus' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Summary Metrics & Achievement Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Minutes Metric */}
        <Card variant="sand" className="border-earth-border flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-earth-muted mb-2">
              <span>Total Outdoor Time</span>
              <Clock className="w-4 h-4 text-earth-forest" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-earth-forest">
                {totalMinutes}
              </span>
              <span className="text-sm font-semibold text-earth-muted">minutes recorded</span>
            </div>
            <p className="text-[11px] text-earth-muted mt-2 leading-relaxed">
              Calculated exclusively from completed trails saved in your browser&apos;s IndexedDB.
            </p>
          </CardContent>
        </Card>

        {/* Completed Quests Count */}
        <Card variant="sand" className="border-earth-border flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-earth-muted mb-2">
              <span>Completed Adventures</span>
              <CheckCircle2 className="w-4 h-4 text-earth-forest" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-earth-forest">
                {completedQuests.length}
              </span>
              <span className="text-sm font-semibold text-earth-muted">
                of {allQuests.length} planned trails
              </span>
            </div>
            <p className="text-[11px] text-earth-muted mt-2 leading-relaxed">
              Real completed sessions with sensory milestones. No fabricated streaks.
            </p>
          </CardContent>
        </Card>

        {/* Journal Actions / Wipe data */}
        <Card className="border-earth-border flex flex-col justify-between bg-white/70">
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-earth-muted mb-1.5">
                <BookOpen className="w-4 h-4 text-earth-forest" />
                <span>Local Storage Management</span>
              </div>
              <p className="text-xs text-earth-muted leading-relaxed">
                Your journal data is stored 100% locally. You can wipe this data anytime.
              </p>
            </div>
            {allQuests.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportJournal}
                    className="flex-1 text-xs text-earth-forest border-earth-border hover:bg-earth-sand-light"
                    leftIcon={<Download className="w-3.5 h-3.5 text-earth-forest" />}
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintNotes}
                    className="flex-1 text-xs text-earth-forest border-earth-border hover:bg-earth-sand-light"
                    leftIcon={<Printer className="w-3.5 h-3.5 text-earth-forest" />}
                  >
                    Print Notes
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full text-xs text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Clear All Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. Transparent Achievements Section */}
      <section aria-labelledby="achievements-heading" className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-earth-accent" />
          <h2 id="achievements-heading" className="text-sm font-bold uppercase tracking-wider text-earth-forest">
            Verified Nature Achievements ({achievements.filter((a) => a.unlockedAt).length} / {achievements.length} Unlocked)
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {achievements.map((ach) => (
            <AchievementBadge key={ach.id} achievement={ach} />
          ))}
        </div>
      </section>

      {/* 3. Category / Environment Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-earth-border/60">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-earth-muted" />
          <span className="text-xs font-semibold text-earth-charcoal">Filter by Landscape:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {envFilterOptions.map((opt) => {
            const isSelected = selectedEnvironment === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedEnvironment(opt.value)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest ${
                  isSelected
                    ? 'bg-earth-forest text-white font-semibold'
                    : 'bg-white border border-earth-border text-earth-charcoal hover:bg-earth-sand-light'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Quests List & Empty State */}
      {quests.length === 0 ? (
        <EmptyState
          title={allQuests.length === 0 ? 'Your Nature Journal is Ready' : 'No Quests Match This Landscape'}
          description={
            allQuests.length === 0
              ? 'Every time you complete a micro-adventure and submit your reflection, your trail notes and recorded minutes will be safely preserved here on your device.'
              : 'Try selecting "All Environments" above to view your full history.'
          }
          icon={<BookOpen className="w-8 h-8 text-earth-forest" />}
          action={
            allQuests.length === 0 ? (
              <Link href="/">
                <Button variant="primary" leftIcon={<Compass className="w-4 h-4" />}>
                  Craft Your First Quest
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {quests.map((quest) => {
            const isExpanded = !!expandedQuestIds[quest.id];
            const isCompleted = quest.status === 'completed';

            return (
              <Card
                key={quest.id}
                className="border-earth-border/80 hover:border-earth-forest/40 transition-colors shadow-xs overflow-hidden"
              >
                <CardHeader className="p-5 pb-3 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={isCompleted ? 'sage' : 'sand'}
                        className="gap-1 text-xs"
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-earth-forest" />}
                        <span className="capitalize">{quest.status}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs bg-earth-sand-light text-earth-charcoal capitalize">
                        <MapPin className="w-3 h-3 text-earth-forest" />
                        <span>{quest.environment}</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs text-earth-muted">
                        <Clock className="w-3 h-3" />
                        <span>Planned: {formatDuration(quest.durationMinutes)}</span>
                      </Badge>
                      {quest.actualElapsedSeconds && quest.actualElapsedSeconds > 0 && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200 font-mono">
                          Recorded: {Math.floor(quest.actualElapsedSeconds / 60)}m {quest.actualElapsedSeconds % 60}s
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-earth-muted">
                      <span>{formatDate(quest.completedAt || quest.createdAt)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuest(quest.id)}
                        aria-label={`Delete quest ${quest.title}`}
                        className="h-7 w-7 p-0 text-earth-muted hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <CardTitle className="text-lg text-earth-forest">
                    {quest.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <p className="text-xs text-earth-charcoal leading-relaxed">
                    {quest.introduction}
                  </p>

                  {/* Reflection Preview (Feature 4 Requirement) */}
                  {quest.reflection && (
                    <div className="p-4 rounded-xl bg-earth-sand-light/60 border border-earth-border space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-earth-forest flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Field Reflection</span>
                        </span>
                        {quest.reflection.wouldRepeat && (
                          <span className="text-[10px] text-earth-forest font-semibold">
                            ✓ Would explore again
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-earth-charcoal">
                        <div>
                          <strong className="text-earth-muted block text-[11px]">What was noticed:</strong>
                          <p className="italic pl-2 border-l-2 border-earth-forest/40">
                            &ldquo;{quest.reflection.noticed}&rdquo;
                          </p>
                        </div>
                        <div>
                          <strong className="text-earth-muted block text-[11px]">Felt afterward:</strong>
                          <p className="italic pl-2 border-l-2 border-earth-forest/40">
                            &ldquo;{quest.reflection.feltAfter}&rdquo;
                          </p>
                        </div>
                        <div>
                          <strong className="text-earth-muted block text-[11px]">Favorite part:</strong>
                          <p className="italic pl-2 border-l-2 border-earth-forest/40">
                            &ldquo;{quest.reflection.favoritePart}&rdquo;
                          </p>
                        </div>
                        {quest.reflection.notes && (
                          <div>
                            <strong className="text-earth-muted block text-[11px]">Additional notes:</strong>
                            <p className="text-earth-muted pl-2">
                              {quest.reflection.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detail View Expander (Feature 5 Requirement) */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(quest.id)}
                      className="text-xs font-semibold text-earth-forest hover:text-earth-forest-hover flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
                    >
                      <span>
                        {isExpanded ? 'Hide Milestone Details' : `View Full Trail Details (${quest.steps.length} Steps)`}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-white border border-earth-border/80 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-earth-forest">
                          Trail Milestones & Instructions
                        </h4>
                        <div className="space-y-2">
                          {quest.steps.map((step) => (
                            <div
                              key={step.id}
                              className="p-2.5 rounded-lg bg-earth-sand-light/40 border border-earth-border/60 text-xs flex items-start gap-2.5"
                            >
                              <span
                                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${
                                  step.isCompleted
                                    ? 'bg-earth-forest text-white'
                                    : 'border border-earth-border text-earth-muted'
                                }`}
                              >
                                {step.isCompleted ? '✓' : step.order}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="font-semibold text-earth-charcoal">
                                    {step.title}
                                  </span>
                                  <span className="text-[10px] text-earth-muted">
                                    {step.durationMinutes} min
                                  </span>
                                </div>
                                <p className="text-earth-muted leading-relaxed">
                                  {step.instruction}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {quest.safetyGuidance.length > 0 && (
                          <div className="pt-2 text-[11px] text-earth-muted">
                            <span className="font-semibold text-earth-charcoal block mb-1">
                              Trail Safety Followed:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5">
                              {quest.safetyGuidance.map((g, idx) => (
                                <li key={idx}>{g}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
