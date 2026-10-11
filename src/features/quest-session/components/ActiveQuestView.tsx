'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Circle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Smartphone,
  Eye,
  Volume2,
  Hand,
  Sparkles,
  Footprints,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Quest, QuestStep, QuestReflection } from '@/types';
import { cn, formatDuration } from '@/lib/utils';
import { playMilestoneChime, playCelebrationChime } from '@/lib/sound';
import { useQuestSession } from '../hooks/useQuestSession';

interface ActiveQuestViewProps {
  quest: Quest;
  onFinish: () => void;
  onExit: () => void;
}

export function ActiveQuestView({ quest: initialQuest, onFinish, onExit }: ActiveQuestViewProps) {
  const {
    quest,
    sessionState,
    currentStepIndex,
    setCurrentStepIndex,
    elapsedSeconds,
    isPaused,
    isFinishing,
    toggleStep,
    goToNextStep,
    goToPrevStep,
    pauseSession,
    resumeSession,
    submitReflectionAndComplete,
    exitSession,
  } = useQuestSession(initialQuest);

  // Mode: 'active' or 'reflection'
  const [isReflecting, setIsReflecting] = useState<boolean>(false);

  // Reflection form fields
  const [noticed, setNoticed] = useState<string>('');
  const [feltAfter, setFeltAfter] = useState<string>('');
  const [favoritePart, setFavoritePart] = useState<string>('');
  const [wouldRepeat, setWouldRepeat] = useState<boolean>(true);
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  // Completed steps calculation
  const stepsCompletedMap = sessionState?.stepsCompleted || {};
  const completedCount = quest.steps.filter((s) => stepsCompletedMap[s.id]).length;
  const progressPercent = Math.round((completedCount / quest.steps.length) * 100);

  // Timer formatting (MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTargetSeconds = quest.durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - elapsedSeconds);

  const currentStep: QuestStep | undefined = quest.steps[currentStepIndex];
  const isCurrentStepDone = currentStep ? !!stepsCompletedMap[currentStep.id] : false;

  const getSensoryIcon = (focus?: QuestStep['sensoryFocus']) => {
    switch (focus) {
      case 'sight':
        return <Eye className="w-3.5 h-3.5 text-earth-forest" />;
      case 'sound':
        return <Volume2 className="w-3.5 h-3.5 text-earth-accent" />;
      case 'touch':
        return <Hand className="w-3.5 h-3.5 text-earth-forest" />;
      case 'smell':
        return <Sparkles className="w-3.5 h-3.5 text-earth-accent" />;
      case 'curiosity':
      default:
        return <Footprints className="w-3.5 h-3.5 text-earth-forest" />;
    }
  };

  const handleExit = async () => {
    if (confirm('Leave this active trail? Your current progress will be paused.')) {
      await exitSession();
      onExit();
    }
  };

  const handleToggleStep = (stepId: string) => {
    const isCurrentlyDone = !!stepsCompletedMap[stepId];
    if (!isCurrentlyDone) {
      playMilestoneChime();
    }
    toggleStep(stepId);
  };

  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReflectionError(null);

    if (!noticed.trim()) {
      setReflectionError('Please share at least one observation you noticed.');
      return;
    }
    if (!feltAfter.trim()) {
      setReflectionError('Please share how you felt after the walk.');
      return;
    }
    if (!favoritePart.trim()) {
      setReflectionError('Please share your favorite part of the trail.');
      return;
    }

    const reflection: QuestReflection = {
      noticed: noticed.trim(),
      feltAfter: feltAfter.trim(),
      favoritePart: favoritePart.trim(),
      wouldRepeat,
      notes: reflectionNotes.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    try {
      await submitReflectionAndComplete(reflection);
      playCelebrationChime();
      onFinish();
    } catch {
      setReflectionError('Failed to save reflection to your local journal.');
    }
  };

  // ----------------------------------------------------
  // REFLECTION / COMPLETION SCREEN
  // ----------------------------------------------------
  if (isReflecting) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-earth-sage-light text-earth-forest mx-auto flex items-center justify-center">
            <Award className="w-7 h-7 text-earth-accent" />
          </div>
          <Badge variant="forest" className="py-1 px-3 text-xs">
            Mission Complete
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-earth-forest">
            Record Your Nature Reflection
          </h2>
          <p className="text-xs sm:text-sm text-earth-muted max-w-md mx-auto">
            You spent <strong>{formatTimer(elapsedSeconds)}</strong> outdoors touching grass. Take 60 seconds to record your physical sensations into your private local journal.
          </p>
        </div>

        <Card variant="sand" className="border-earth-border shadow-md">
          <CardContent className="p-6">
            <form onSubmit={handleReflectionSubmit} className="space-y-5">
              {reflectionError && (
                <div role="alert" className="p-3 rounded-lg bg-red-100 text-red-800 text-xs font-medium">
                  {reflectionError}
                </div>
              )}

              {/* 1. What did you notice? */}
              <div>
                <label htmlFor="refNotice" className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-1.5">
                  1. What did you notice? *
                </label>
                <textarea
                  id="refNotice"
                  rows={2}
                  required
                  value={noticed}
                  onChange={(e) => setNoticed(e.target.value)}
                  placeholder="e.g. Cool breeze shifting from the north; two scrub jays in the pine needles..."
                  className="w-full p-3 rounded-lg border border-earth-border bg-white text-xs sm:text-sm text-earth-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] uppercase font-bold text-earth-muted mr-1">Quick ideas:</span>
                  {['Cool breeze in trees', 'Bird songs in canopy', 'Sunlight through branches', 'Fragrant damp earth'].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setNoticed((prev) => prev ? `${prev}; ${idea}` : idea)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-earth-sand-light hover:bg-earth-sand border border-earth-border/80 text-earth-charcoal transition-all shadow-2xs hover:scale-102 active:scale-98"
                    >
                      + {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. How did you feel afterward? */}
              <div>
                <label htmlFor="refFelt" className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-1.5">
                  2. How did you feel afterward? *
                </label>
                <textarea
                  id="refFelt"
                  rows={2}
                  required
                  value={feltAfter}
                  onChange={(e) => setFeltAfter(e.target.value)}
                  placeholder="e.g. Calmer nervous system, shoulders relaxed, clear head..."
                  className="w-full p-3 rounded-lg border border-earth-border bg-white text-xs sm:text-sm text-earth-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] uppercase font-bold text-earth-muted mr-1">Quick feelings:</span>
                  {['Calm nervous system', 'Relaxed shoulders', 'Mentally unhurried & clear', 'Deeply energized'].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setFeltAfter((prev) => prev ? `${prev}; ${idea}` : idea)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-earth-sand-light hover:bg-earth-sand border border-earth-border/80 text-earth-charcoal transition-all shadow-2xs hover:scale-102 active:scale-98"
                    >
                      + {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. What was your favorite part? */}
              <div>
                <label htmlFor="refFav" className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-1.5">
                  3. What was your favorite part? *
                </label>
                <input
                  id="refFav"
                  type="text"
                  required
                  value={favoritePart}
                  onChange={(e) => setFavoritePart(e.target.value)}
                  placeholder="e.g. Standing beneath the old cedar in quiet silence."
                  className="w-full p-3 rounded-lg border border-earth-border bg-white text-xs sm:text-sm text-earth-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] uppercase font-bold text-earth-muted mr-1">Favorite moments:</span>
                  {['Walking without screen distraction', 'Listening to singing birds', 'Breathing fresh outdoor air', 'Standing under tall trees'].map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setFavoritePart(idea)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-earth-sand-light hover:bg-earth-sand border border-earth-border/80 text-earth-charcoal transition-all shadow-2xs hover:scale-102 active:scale-98"
                    >
                      + {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Would you do this again? */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2">
                  4. Would you do this again?
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setWouldRepeat(true)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-xs font-semibold transition-all',
                      wouldRepeat
                        ? 'border-earth-forest bg-earth-forest text-white'
                        : 'border-earth-border bg-white text-earth-charcoal hover:bg-earth-sand-light'
                    )}
                  >
                    ✓ Yes, definitely
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldRepeat(false)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-xs font-semibold transition-all',
                      !wouldRepeat
                        ? 'border-earth-forest bg-earth-forest text-white'
                        : 'border-earth-border bg-white text-earth-charcoal hover:bg-earth-sand-light'
                    )}
                  >
                    Probably not
                  </button>
                </div>
              </div>

              {/* Optional Field Note */}
              <div>
                <label htmlFor="refNotes" className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-1.5">
                  Optional Field Notes / Sketches description
                </label>
                <textarea
                  id="refNotes"
                  rows={2}
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="Any other thoughts to preserve in your local IndexedDB log..."
                  className="w-full p-3 rounded-lg border border-earth-border bg-white text-xs sm:text-sm text-earth-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1 font-semibold"
                  isLoading={isFinishing}
                  leftIcon={<BookOpen className="w-4 h-4" />}
                >
                  Save to My Nature Journal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setIsReflecting(false)}
                >
                  Back to Trail View
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE SESSION INTERFACE
  // ----------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Phone Away / Screen-Free Reminder Banner */}
      <div className="p-3.5 rounded-xl bg-earth-forest text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-earth-forest-hover flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-earth-sage" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm block leading-tight">
              Phone away. Adventure on.
            </span>
            <span className="text-[11px] text-earth-sage-light leading-tight">
              Keep your device pocketed between steps. Your timer is running automatically.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isPaused ? (
            <Button
              variant="accent"
              size="sm"
              onClick={resumeSession}
              leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
              className="h-8 text-xs font-semibold"
            >
              Resume
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={pauseSession}
              leftIcon={<Pause className="w-3.5 h-3.5" />}
              className="h-8 text-xs border-earth-sage text-white hover:bg-earth-forest-hover"
            >
              Pause
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            className="h-8 text-xs text-earth-sage hover:text-white"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Main Active Trail Card */}
      <Card variant="sand" className="border-earth-forest/30 shadow-md overflow-hidden">
        {/* Header with Title & Live Timers */}
        <CardHeader className="bg-white border-b border-earth-border/80 p-5 md:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <Badge variant="forest" className="gap-1.5 py-1 px-3">
              <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse motion-reduce:animate-none'}`} />
              <span>{isPaused ? 'Paused' : 'Active Exploration'}</span>
            </Badge>

            {/* Timer Display */}
            <div className="flex items-center gap-3 bg-earth-sand-light px-3 py-1.5 rounded-lg border border-earth-border text-xs font-mono">
              <div className="flex items-center gap-1.5 text-earth-forest font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Elapsed: {formatTimer(elapsedSeconds)}</span>
              </div>
              <span className="text-earth-muted">|</span>
              <div className="text-earth-muted">
                <span>Remaining: {formatTimer(remainingSeconds)}</span>
              </div>
            </div>
          </div>

          <CardTitle className="text-xl md:text-2xl text-earth-forest">
            {quest.title}
          </CardTitle>
          <p className="text-xs text-earth-muted mt-1 leading-relaxed">
            {quest.summary}
          </p>

          {/* Progress Bar */}
          <div className="mt-4 pt-1">
            <ProgressBar
              value={progressPercent}
              label={`Milestones Completed: ${completedCount} of ${quest.steps.length}`}
              variant="forest"
            />
          </div>
        </CardHeader>

        {/* Current Step Focus Mode */}
        {currentStep && (
          <CardContent className="p-5 md:p-7 space-y-6">
            <div className="p-5 md:p-6 rounded-xl bg-white border border-earth-forest/40 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-earth-forest text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {currentStep.order}
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-earth-muted block">
                      Step {currentStep.order} of {quest.steps.length}
                    </span>
                    <h3 className="font-bold text-base md:text-lg text-earth-charcoal leading-tight">
                      {currentStep.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-earth-sand-light text-earth-charcoal">
                    {currentStep.durationMinutes} min
                  </Badge>
                  {currentStep.sensoryFocus && (
                    <Badge variant="outline" className="text-xs gap-1 bg-earth-sage-light text-earth-forest capitalize">
                      {getSensoryIcon(currentStep.sensoryFocus)}
                      <span>{currentStep.sensoryFocus}</span>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg bg-earth-sand-light/50 border border-earth-border/60">
                <p className="text-sm md:text-base text-earth-charcoal leading-relaxed font-medium">
                  {currentStep.instruction}
                </p>
                {currentStep.observationPrompt && (
                  <p className="text-xs text-earth-forest font-semibold mt-2.5 pt-2 border-t border-earth-border/60">
                    💡 Observation Prompt: {currentStep.observationPrompt}
                  </p>
                )}
              </div>

              {/* Complete Step Toggle */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleStep(currentStep.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                    isCurrentStepDone
                      ? 'border-earth-forest bg-earth-sage-light text-earth-forest'
                      : 'border-earth-border bg-white text-earth-charcoal hover:bg-earth-sand-light'
                  )}
                >
                  {isCurrentStepDone ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-earth-forest fill-earth-forest text-white" />
                      <span>Step Completed ✓</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-5 h-5 text-earth-border" />
                      <span>Mark Step Completed</span>
                    </>
                  )}
                </button>

                {/* Step navigation buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStepIndex === 0}
                    onClick={goToPrevStep}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    className="h-9 px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={currentStepIndex === quest.steps.length - 1}
                    onClick={goToNextStep}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    className="h-9 px-3 text-xs"
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            </div>

            {/* Checklist Overview of All Steps */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-earth-forest">
                Complete Trail Sequence
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {quest.steps.map((step, idx) => {
                  const done = !!stepsCompletedMap[step.id];
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setCurrentStepIndex(idx)}
                      className={cn(
                        'p-3 rounded-lg border text-left flex items-center justify-between transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                        isCurrent
                          ? 'border-earth-forest bg-white ring-1 ring-earth-forest/40'
                          : done
                          ? 'border-earth-border/60 bg-earth-sage-light/30 opacity-75'
                          : 'border-earth-border/80 bg-white/70 hover:bg-white'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                            done
                              ? 'bg-earth-forest text-white'
                              : isCurrent
                              ? 'bg-earth-sand text-earth-forest'
                              : 'bg-earth-sand-light text-earth-muted'
                          )}
                        >
                          {done ? '✓' : step.order}
                        </span>
                        <span
                          className={cn(
                            'text-xs truncate font-medium',
                            done ? 'line-through text-earth-muted' : 'text-earth-charcoal'
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-earth-muted shrink-0 pl-2">
                        {step.durationMinutes}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        )}

        {/* Footer / Finish Call to Action */}
        <CardFooter className="bg-white border-t border-earth-border/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-earth-muted text-center sm:text-left">
            <span>
              {completedCount === quest.steps.length
                ? 'All milestones reached! Ready for field reflection.'
                : `${quest.steps.length - completedCount} milestone(s) remaining.`}
            </span>
          </div>

          <Button
            variant="accent"
            size="md"
            onClick={() => setIsReflecting(true)}
            leftIcon={<Award className="w-4 h-4" />}
            className="w-full sm:w-auto font-semibold shadow-xs"
          >
            Finish & Log Nature Journal
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
