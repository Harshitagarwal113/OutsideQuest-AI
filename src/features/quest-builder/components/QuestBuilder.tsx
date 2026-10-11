'use client';

import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Trees,
  Flower2,
  Home,
  Building2,
  Search,
  CloudSun,
  Zap,
  Users,
  User,
  Smile,
  HeartHandshake,
  Feather,
  Leaf,
  Camera,
  Footprints,
  Wind,
  ShieldCheck,
  Clock,
  Activity,
  Accessibility,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  DURATION_OPTIONS,
  ENVIRONMENT_OPTIONS,
  MOOD_OPTIONS,
  INTENSITY_OPTIONS,
  EXPERIENCE_TYPE_OPTIONS,
  INTEREST_OPTIONS,
} from '@/lib/constants';
import { useQuestBuilder } from '../hooks/useQuestBuilder';
import { QuestPreview } from './QuestPreview';
import { ModelLoadDialog } from '@/features/ai/components/ModelLoadDialog';
import type {
  Quest,
  QuestEnvironment,
  QuestDuration,
  QuestMood,
  QuestIntensity,
  QuestExperienceType,
  QuestInterest,
} from '@/types';
import { cn } from '@/lib/utils';

interface QuestBuilderProps {
  onStartQuest: (quest: Quest) => void;
}

interface AdventurePreset {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
  durationMinutes: QuestDuration;
  environment: QuestEnvironment;
  mood: QuestMood;
  intensity: QuestIntensity;
  experienceType: QuestExperienceType;
  interests: QuestInterest[];
}

const ADVENTURE_PRESETS: AdventurePreset[] = [
  {
    id: 'mindful-reset',
    emoji: '🌿',
    title: '15m Mindful Reset',
    subtitle: 'Gentle plant & breathing focus',
    tag: 'Quick & Calm',
    durationMinutes: 15,
    environment: 'park',
    mood: 'calm',
    intensity: 'gentle',
    experienceType: 'solo',
    interests: ['plants', 'mindfulness'],
  },
  {
    id: 'sensory-detective',
    emoji: '🔍',
    title: '30m Sensory Explorer',
    subtitle: 'Birds, scents & micro-botany',
    tag: 'Most Popular',
    durationMinutes: 30,
    environment: 'garden',
    mood: 'curious',
    intensity: 'moderate',
    experienceType: 'solo',
    interests: ['birds', 'plants', 'exploration'],
  },
  {
    id: 'active-trek',
    emoji: '⚡',
    title: '45m Neighborhood Trek',
    subtitle: 'Brisk pace & wide curiosity',
    tag: 'Energizing',
    durationMinutes: 45,
    environment: 'neighborhood',
    mood: 'energetic',
    intensity: 'active',
    experienceType: 'solo',
    interests: ['walking', 'exploration'],
  },
  {
    id: 'family-nature',
    emoji: '👨‍👩‍👧',
    title: '30m Family Green Walk',
    subtitle: 'Shared discovery for all ages',
    tag: 'Family & Friends',
    durationMinutes: 30,
    environment: 'park',
    mood: 'curious',
    intensity: 'gentle',
    experienceType: 'family',
    interests: ['birds', 'plants', 'photography'],
  },
];

export function QuestBuilder({ onStartQuest }: QuestBuilderProps) {
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const {
    params,
    isGenerating,
    generatedQuest,
    error,
    updateParam,
    toggleInterest,
    generateQuest,
    resetBuilder,
  } = useQuestBuilder();

  const handleApplyPreset = (preset: AdventurePreset) => {
    setActivePresetId(preset.id);
    updateParam('durationMinutes', preset.durationMinutes);
    updateParam('environment', preset.environment);
    updateParam('mood', preset.mood);
    updateParam('intensity', preset.intensity);
    updateParam('experienceType', preset.experienceType);
    updateParam('interests', preset.interests);
  };

  if (generatedQuest) {
    return (
      <QuestPreview
        quest={generatedQuest}
        onStartQuest={onStartQuest}
        onReset={() => {
          setActivePresetId(null);
          resetBuilder();
        }}
      />
    );
  }

  const getEnvIcon = (env: QuestEnvironment) => {
    switch (env) {
      case 'park':
        return <Trees className="w-5 h-5" />;
      case 'garden':
        return <Flower2 className="w-5 h-5" />;
      case 'neighborhood':
        return <Home className="w-5 h-5" />;
      case 'campus':
        return <Building2 className="w-5 h-5" />;
      case 'other':
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  const getMoodIcon = (mood: QuestMood) => {
    switch (mood) {
      case 'curious':
        return <Search className="w-4 h-4" />;
      case 'calm':
        return <CloudSun className="w-4 h-4" />;
      case 'energetic':
        return <Zap className="w-4 h-4" />;
      case 'social':
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getExperienceIcon = (exp: QuestExperienceType) => {
    switch (exp) {
      case 'solo':
        return <User className="w-4 h-4" />;
      case 'friends':
        return <Users className="w-4 h-4" />;
      case 'family':
        return <Smile className="w-4 h-4" />;
      case 'group':
      default:
        return <HeartHandshake className="w-4 h-4" />;
    }
  };

  const getInterestIcon = (interest: QuestInterest) => {
    switch (interest) {
      case 'birds':
        return <Feather className="w-4 h-4" />;
      case 'plants':
        return <Leaf className="w-4 h-4" />;
      case 'photography':
        return <Camera className="w-4 h-4" />;
      case 'walking':
        return <Footprints className="w-4 h-4" />;
      case 'mindfulness':
        return <Wind className="w-4 h-4" />;
      case 'exploration':
      default:
        return <Compass className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-earth-border/90 shadow-sm overflow-hidden" id="builder-card">
      <CardHeader className="bg-gradient-to-r from-earth-sand-light/90 to-[#EFECE1]/60 border-b border-earth-border/70 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 text-earth-accent">
            <Compass className="w-4 h-4 text-earth-forest" />
            <span className="text-xs font-bold uppercase tracking-wider text-earth-forest">
              Personalized Trailhead
            </span>
          </div>
          <Badge variant="outline" className="text-[11px] gap-1 bg-white/90 text-earth-forest border-earth-border shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-earth-forest" />
            <span>Zero GPS / Private Local Design</span>
          </Badge>
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-bold text-earth-forest tracking-tight">
          Craft Your Outdoor Micro-Adventure
        </CardTitle>
        <CardDescription className="text-earth-muted text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          Pick a 1-click preset below or fine-tune your expedition. We generate verified sensory milestones with zero account registration and complete on-device privacy.
        </CardDescription>

        {/* 1-Click Adventure Presets for Instant Ease */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-earth-forest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-earth-accent" />
              <span>1-Click Adventure Presets (Instant Setup)</span>
            </span>
            {activePresetId && (
              <span className="text-[11px] text-earth-accent font-semibold flex items-center gap-1 animate-pulse motion-reduce:animate-none">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Preset Active</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {ADVENTURE_PRESETS.map((preset) => {
              const isCurrent = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={cn(
                    'p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest shadow-2xs hover:shadow-xs',
                    isCurrent
                      ? 'border-earth-forest bg-earth-forest text-white ring-2 ring-earth-forest/30'
                      : 'border-earth-border/90 bg-white hover:bg-earth-sand-light hover:border-earth-forest/60 text-earth-charcoal'
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">{preset.emoji}</span>
                    <span
                      className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : 'bg-earth-sand text-earth-forest'
                      )}
                    >
                      {preset.tag}
                    </span>
                  </div>
                  <div>
                    <span className={cn('text-xs font-bold block', isCurrent ? 'text-white' : 'text-earth-forest')}>
                      {preset.title}
                    </span>
                    <span className={cn('text-[11px] block mt-0.5 leading-snug', isCurrent ? 'text-earth-sage-light' : 'text-earth-muted')}>
                      {preset.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-7 pt-6">
        {error && (
          <ErrorMessage
            message={error}
            onRetry={generateQuest}
            retryText="Retry Crafting"
          />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateQuest();
          }}
          className="space-y-6"
        >
          {/* GROUP 1: Time & Setting */}
          <div className="p-4 sm:p-5 rounded-xl border border-earth-border/80 bg-earth-sand-light/40 space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-earth-border/50">
              <span className="w-5 h-5 rounded-full bg-earth-forest text-white text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-earth-forest">
                Time & Setting
              </h3>
            </div>

            {/* 1. Available Time */}
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Available Time</span>
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((dur) => {
                  const isSelected = params.durationMinutes === dur.value;
                  return (
                    <button
                      key={dur.value}
                      type="button"
                      onClick={() => updateParam('durationMinutes', dur.value as QuestDuration)}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                        isSelected
                          ? 'border-earth-forest bg-earth-forest text-white shadow-xs'
                          : 'border-earth-border/80 bg-white hover:bg-earth-sand-light text-earth-charcoal'
                      )}
                      aria-pressed={isSelected}
                    >
                      <span className="block font-bold text-sm leading-tight">
                        {dur.label}
                      </span>
                      <span
                        className={cn(
                          'block text-[11px] mt-1 leading-tight',
                          isSelected ? 'text-earth-sage' : 'text-earth-muted'
                        )}
                      >
                        {dur.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* 2. Environment Selection */}
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2.5 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5" />
                <span>Environment</span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {ENVIRONMENT_OPTIONS.map((env) => {
                  const isSelected = params.environment === env.value;
                  return (
                    <button
                      key={env.value}
                      type="button"
                      onClick={() => updateParam('environment', env.value)}
                      className={cn(
                        'flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                        isSelected
                          ? 'border-earth-forest bg-earth-sage-light text-earth-forest shadow-xs font-medium'
                          : 'border-earth-border/80 bg-white hover:bg-earth-sand-light text-earth-charcoal'
                      )}
                      aria-pressed={isSelected}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-md shrink-0',
                          isSelected
                            ? 'bg-earth-forest text-white'
                            : 'bg-earth-sand-light text-earth-forest'
                        )}
                      >
                        {getEnvIcon(env.value)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold block leading-tight">
                          {env.label}
                        </span>
                        <span className="text-xs text-earth-muted mt-0.5 block leading-tight">
                          {env.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* GROUP 2: Vibe & Pace */}
          <div className="p-4 sm:p-5 rounded-xl border border-earth-border/80 bg-earth-sand-light/40 space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-earth-border/50">
              <span className="w-5 h-5 rounded-full bg-earth-forest text-white text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-earth-forest">
                Mood, Pace & Companions
              </h3>
            </div>

            {/* 3. Mood & 4. Activity Intensity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Mood */}
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2.5 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>3. Desired Mood</span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {MOOD_OPTIONS.map((m) => {
                    const isSelected = params.mood === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => updateParam('mood', m.value as QuestMood)}
                        className={cn(
                          'p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                          isSelected
                            ? 'border-earth-forest bg-earth-sage-light text-earth-forest font-semibold'
                            : 'border-earth-border/80 bg-white hover:bg-earth-sand-light text-earth-charcoal'
                        )}
                        aria-pressed={isSelected}
                      >
                        <div
                          className={cn(
                            'p-1.5 rounded-md shrink-0',
                            isSelected ? 'bg-earth-forest text-white' : 'bg-earth-sand-light text-earth-forest'
                          )}
                        >
                          {getMoodIcon(m.value)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block">{m.label}</span>
                          <span className="text-[10px] text-earth-muted block truncate">{m.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Activity Intensity */}
              <fieldset>
                <legend className="text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2.5 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>4. Activity Intensity</span>
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {INTENSITY_OPTIONS.map((int) => {
                    const isSelected = params.intensity === int.value;
                    return (
                      <button
                        key={int.value}
                        type="button"
                        onClick={() => updateParam('intensity', int.value as QuestIntensity)}
                        className={cn(
                          'p-2.5 rounded-lg border text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                          isSelected
                            ? 'border-earth-forest bg-earth-sage-light text-earth-forest font-semibold'
                            : 'border-earth-border/80 bg-white hover:bg-earth-sand-light text-earth-charcoal'
                        )}
                        aria-pressed={isSelected}
                      >
                        <span className="text-xs font-bold block">{int.label}</span>
                        <span className="text-[10px] text-earth-muted block mt-0.5 leading-tight">{int.description}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            {/* 5. Experience Type */}
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>5. Experience Type</span>
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPERIENCE_TYPE_OPTIONS.map((exp) => {
                  const isSelected = params.experienceType === exp.value;
                  return (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() => updateParam('experienceType', exp.value as QuestExperienceType)}
                      className={cn(
                        'p-2.5 rounded-lg border text-left transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                        isSelected
                          ? 'border-earth-forest bg-earth-sage-light text-earth-forest font-semibold'
                          : 'border-earth-border/80 bg-white hover:bg-earth-sand-light text-earth-charcoal'
                      )}
                      aria-pressed={isSelected}
                    >
                      <div
                        className={cn(
                          'p-1.5 rounded-md shrink-0',
                          isSelected ? 'bg-earth-forest text-white' : 'bg-earth-sand-light text-earth-forest'
                        )}
                      >
                        {getExperienceIcon(exp.value)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block">{exp.label}</span>
                        <span className="text-[10px] text-earth-muted block truncate">{exp.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* GROUP 3: Sensory Focus & Details */}
          <div className="p-4 sm:p-5 rounded-xl border border-earth-border/80 bg-earth-sand-light/40 space-y-5">
            <div className="flex items-center gap-2 pb-1 border-b border-earth-border/50">
              <span className="w-5 h-5 rounded-full bg-earth-forest text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-earth-forest">
                Sensory Focus & Custom Details
              </h3>
            </div>

            {/* 6. Interests / Senses */}
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-earth-forest mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-earth-accent" />
                <span>6. Sensory Focus & Curiosity</span>
                <span className="text-[11px] text-earth-muted font-normal lowercase">(pick any)</span>
              </legend>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = params.interests.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleInterest(item.value)}
                      className={cn(
                        'p-2.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest',
                        isSelected
                          ? 'border-earth-forest bg-earth-forest text-white font-semibold shadow-xs'
                          : 'border-earth-border/80 bg-white hover:bg-earth-sand-light text-earth-charcoal'
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className={isSelected ? 'text-white' : 'text-earth-forest'}>
                        {getInterestIcon(item.value)}
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* 7. Local Context & 8. Accessibility Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* 7. Local Context */}
              <div>
                <label
                  htmlFor="localContext"
                  className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-1.5"
                >
                  7. Optional Local Context / Landmarks
                </label>
                <input
                  id="localContext"
                  type="text"
                  value={params.localContext || ''}
                  onChange={(e) => updateParam('localContext', e.target.value)}
                  placeholder="e.g. Near old oak grove, quiet duck pond..."
                  maxLength={300}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-earth-border bg-white text-earth-charcoal text-xs sm:text-sm placeholder:text-earth-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
                />
              </div>

              {/* 8. Accessibility Requirements */}
              <div>
                <label
                  htmlFor="accessibilityRequirements"
                  className="block text-xs font-semibold uppercase tracking-wider text-earth-forest mb-1.5 flex items-center gap-1"
                >
                  <Accessibility className="w-3.5 h-3.5 text-earth-forest" />
                  <span>8. Optional Accessibility / Limitations</span>
                </label>
                <input
                  id="accessibilityRequirements"
                  type="text"
                  value={params.accessibilityRequirements || ''}
                  onChange={(e) => updateParam('accessibilityRequirements', e.target.value)}
                  placeholder="e.g. Paved, step-free paths only, bench rests needed..."
                  maxLength={300}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-earth-border bg-white text-earth-charcoal text-xs sm:text-sm placeholder:text-earth-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
                />
              </div>
            </div>
          </div>

          {/* Live Configuration Summary & Big Submit Action */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-earth-forest/30 shadow-xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
                <span className="text-xs font-semibold uppercase tracking-wider text-earth-forest">
                  Expedition Configuration:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-earth-forest font-medium">
                <span className="bg-earth-sand-light px-2 py-0.5 rounded border border-earth-border/80">
                  {params.durationMinutes} min
                </span>
                <span className="capitalize bg-earth-sand-light px-2 py-0.5 rounded border border-earth-border/80">
                  {params.environment}
                </span>
                <span className="capitalize bg-earth-sand-light px-2 py-0.5 rounded border border-earth-border/80">
                  {params.mood} mood
                </span>
                <span className="capitalize bg-earth-sand-light px-2 py-0.5 rounded border border-earth-border/80">
                  {params.intensity} pace
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1 text-base font-semibold py-4 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-5 h-5 text-earth-accent" />}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                {isGenerating ? 'Crafting Outdoor Micro-Adventure...' : 'Generate Personalized Outdoor Quest'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => generateQuest({ forceFallback: true })}
                disabled={isGenerating}
                className="text-xs sm:text-sm font-medium py-4 bg-earth-sand-light/60 border-earth-border hover:bg-earth-sand text-earth-charcoal"
                leftIcon={<Compass className="w-4 h-4 text-earth-forest" />}
              >
                Instant Curated Quest (0 MB)
              </Button>
            </div>
            <p className="text-[11px] text-center text-earth-muted">
              Runs 100% locally on your device. Never requires exact GPS coordinates, account sign-in, or internet connection.
            </p>
          </div>
        </form>
      </CardContent>

      <ModelLoadDialog
        isOpen={modelDialogOpen}
        onClose={() => setModelDialogOpen(false)}
        onProceedWithFallback={() => {
          setModelDialogOpen(false);
          generateQuest({ forceFallback: true });
        }}
        onSuccess={() => {
          setModelDialogOpen(false);
          generateQuest({ preferLocalAi: true });
        }}
      />
    </Card>
  );
}
