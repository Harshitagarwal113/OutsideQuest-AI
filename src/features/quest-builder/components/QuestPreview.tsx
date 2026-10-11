'use client';

import React from 'react';
import {
  Play,
  RotateCcw,
  Clock,
  MapPin,
  Eye,
  Volume2,
  Hand,
  Sparkles,
  Footprints,
  ShieldAlert,
  Backpack,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Quest, QuestStep } from '@/types';
import { formatDuration } from '@/lib/utils';

interface QuestPreviewProps {
  quest: Quest;
  onStartQuest: (quest: Quest) => void;
  onReset: () => void;
}

export function QuestPreview({ quest, onStartQuest, onReset }: QuestPreviewProps) {
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

  return (
    <Card variant="sand" className="border-earth-forest/30 shadow-md">
      <CardHeader>
        {/* Source Provenance Badge - Explicitly Transparent */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <Badge
            variant={quest.generationSource === 'on-device-model' ? 'forest' : 'sage'}
            className="text-xs py-1 px-2.5 gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-earth-forest" />
            <span>
              {quest.generationSource === 'on-device-model'
                ? 'Local AI Generated'
                : 'Curated Offline Fallback'}
            </span>
          </Badge>
          <span className="text-[11px] text-earth-muted">
            {quest.generationSource === 'curated-template' &&
              'Deterministic offline engine • No network call used'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="forest" className="gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(quest.durationMinutes)} Total
          </Badge>
          <Badge variant="outline" className="gap-1 bg-white text-earth-charcoal capitalize">
            <MapPin className="w-3 h-3 text-earth-forest" />
            {quest.environment}
          </Badge>
          <Badge variant="outline" className="text-xs bg-white text-earth-charcoal capitalize">
            {quest.mood} mood
          </Badge>
          <Badge variant="outline" className="text-xs bg-white text-earth-charcoal capitalize">
            {quest.intensity} pace
          </Badge>
          <Badge variant="accent" className="text-xs capitalize">
            {quest.experienceType}
          </Badge>
        </div>

        <CardTitle className="text-xl md:text-2xl text-earth-forest">
          {quest.title}
        </CardTitle>
        <CardDescription className="text-earth-charcoal font-normal text-sm leading-relaxed mt-1">
          {quest.introduction}
        </CardDescription>

        {/* Screen-Free Reminder Banner */}
        <div className="mt-3 p-3 rounded-lg bg-earth-forest text-white flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-earth-sage shrink-0" />
          <div>
            <span className="font-bold text-xs block leading-tight">
              {quest.screenFreeReminder}
            </span>
            <span className="text-[11px] text-earth-sage-light leading-tight">
              Review your steps below, then put your screen away during the journey.
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Step Sequence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-earth-forest">
              Actionable Trail Steps ({quest.steps.length} Steps)
            </h4>
            <span className="text-xs text-earth-muted">
              Combined: {quest.steps.reduce((sum, s) => sum + s.durationMinutes, 0)} minutes
            </span>
          </div>

          <div className="relative pl-3 border-l-2 border-earth-forest/30 space-y-3 ml-2">
            {quest.steps.map((step, index) => (
              <div
                key={step.id}
                className="relative p-4 rounded-xl bg-white border border-earth-border/80 flex items-start gap-3.5 shadow-xs hover:border-earth-forest/50 transition-colors"
              >
                {/* Step Node Dot on timeline */}
                <span className="absolute -left-[21px] top-5 w-3.5 h-3.5 rounded-full bg-earth-forest border-2 border-white shadow-xs" />
                
                <div className="w-8 h-8 rounded-full bg-earth-forest text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <h5 className="font-bold text-sm text-earth-charcoal">
                      {step.title}
                    </h5>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[11px] py-0 px-1.5 bg-earth-sand-light text-earth-charcoal font-semibold">
                        {step.durationMinutes} min
                      </Badge>
                      {step.sensoryFocus && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 gap-1 bg-white text-earth-forest capitalize font-medium">
                          {getSensoryIcon(step.sensoryFocus)}
                          <span>{step.sensoryFocus}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-earth-charcoal/90 leading-relaxed font-normal">
                    {step.instruction}
                  </p>
                  {step.observationPrompt && (
                    <p className="text-[11px] text-earth-forest font-semibold mt-2 bg-earth-sage-light/50 p-2 rounded-lg border border-earth-border/40">
                      💡 Sensory Focus: {step.observationPrompt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment & Safety Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Equipment */}
          <div className="p-3.5 rounded-lg bg-white/70 border border-earth-border text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-earth-forest font-semibold">
              <Backpack className="w-4 h-4 text-earth-accent" />
              <span>Recommended Equipment</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-earth-muted pl-1">
              {quest.equipmentSuggestions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Safety Guidance */}
          <div className="p-3.5 rounded-lg bg-white/70 border border-earth-border text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-earth-forest font-semibold">
              <ShieldAlert className="w-4 h-4 text-earth-accent" />
              <span>Sensible Safety Guidance</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-earth-muted pl-1">
              {quest.safetyGuidance.slice(0, 3).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:flex-1 gap-2 text-base font-semibold py-4 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
          onClick={() => onStartQuest(quest)}
          leftIcon={<Play className="w-4 h-4 fill-white" />}
        >
          Begin Adventure Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Adjust Options
        </Button>
      </CardFooter>
    </Card>
  );
}
