'use client';

import React, { useState } from 'react';
import { Compass, Sparkles, Footprints, ShieldCheck, WifiOff, Trees, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LocalAiStatus } from '@/features/ai/components/LocalAiStatus';
import { QuestBuilder } from '@/features/quest-builder/components/QuestBuilder';
import { ActiveQuestView } from '@/features/quest-session/components/ActiveQuestView';
import { RecentActivitySection } from '@/features/history/components/RecentActivitySection';
import type { Quest } from '@/types';

export default function HomePage() {
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);

  const handleStartQuest = (quest: Quest) => {
    setActiveQuest(quest);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishQuest = () => {
    setActiveQuest(null);
  };

  const handleExitQuest = () => {
    setActiveQuest(null);
  };

  if (activeQuest) {
    return (
      <ActiveQuestView
        quest={activeQuest}
        onFinish={handleFinishQuest}
        onExit={handleExitQuest}
      />
    );
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Hero Section - Restrained, Focused, Nature-Oriented */}
      <section
        aria-labelledby="hero-heading"
        className="relative rounded-2xl bg-gradient-to-b from-[#EFECE1] to-[#F7F6EF] border border-earth-border p-6 sm:p-8 md:p-10 shadow-xs"
      >
        <div className="max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="forest" className="gap-1.5 py-1 px-3">
              <Compass className="w-3.5 h-3.5 text-earth-sage" />
              <span>Touch Grass Challenge 2026</span>
            </Badge>
            <Badge variant="outline" className="gap-1 bg-white/80 text-earth-forest border-earth-border">
              <ShieldCheck className="w-3.5 h-3.5 text-earth-forest" />
              <span>Zero-Cloud Transmission</span>
            </Badge>
          </div>

          <h1
            id="hero-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-earth-forest leading-tight"
          >
            Turn Routine Neighborhood Walks Into Sensory Micro-Adventures.
          </h1>

          <p className="text-sm sm:text-base text-earth-charcoal/80 leading-relaxed max-w-xl">
            OutsideQuest AI uses an open-weight language model running directly in your browser to craft mindful, screen-free expeditions. No cloud logins, no tracking, and complete offline freedom.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <a
              href="#builder-card"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-earth-forest text-white text-xs sm:text-sm font-semibold hover:bg-earth-forest-hover transition-all shadow-xs hover:scale-101 active:scale-99"
            >
              <Sparkles className="w-4 h-4 text-earth-accent" />
              <span>Create A Quest</span>
            </a>
            <a
              href="/history"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/90 border border-earth-border text-earth-charcoal text-xs sm:text-sm font-medium hover:bg-earth-sand-light transition-all shadow-xs"
            >
              <Trees className="w-4 h-4 text-earth-forest" />
              <span>View My Journal</span>
            </a>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-earth-muted">
            <div className="flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-earth-forest" />
              <span>Sensory grounding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-earth-forest" />
              <span>Runs 100% offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-earth-accent" />
              <span>Private to your device</span>
            </div>
          </div>
        </div>
      </section>

      {/* Local AI Status Monitor */}
      <section aria-label="AI Engine Status">
        <LocalAiStatus />
      </section>

      {/* Interactive Quest Builder Area */}
      <section id="builder-area" aria-label="Micro-Adventure Generator">
        <QuestBuilder onStartQuest={handleStartQuest} />
      </section>

      {/* Recent Activity Section */}
      <section aria-label="Recent Adventures">
        <RecentActivitySection onSelectQuest={handleStartQuest} />
      </section>

      {/* Screen-Free Invitation Banner */}
      <section
        aria-labelledby="cta-heading"
        className="rounded-xl border border-earth-border bg-earth-sand-light/70 p-6 sm:p-8 text-center space-y-3"
      >
        <div className="w-10 h-10 rounded-full bg-earth-forest text-white mx-auto flex items-center justify-center">
          <Footprints className="w-5 h-5" />
        </div>
        <h2 id="cta-heading" className="text-lg sm:text-xl font-bold text-earth-forest">
          Ready to Step Away From Your Desk?
        </h2>
        <p className="text-xs sm:text-sm text-earth-muted max-w-md mx-auto leading-relaxed">
          Put your phone on &ldquo;Do Not Disturb,&rdquo; step through your front door, and let your senses reset. Nature is waiting right outside your doorstep.
        </p>
        <div className="pt-2">
          <a
            href="#builder-area"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-earth-forest text-white text-xs sm:text-sm font-semibold hover:bg-earth-forest-hover transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
          >
            <span>Design a Trail Above</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
