import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff, Compass, Trees, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Offline Explorer Mode | OutsideQuest AI',
  description: 'How OutsideQuest AI continues functioning seamlessly when you walk outside without internet access.',
};

export default function OfflinePage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-earth-sage-light border border-earth-sage flex items-center justify-center text-earth-forest mx-auto">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <Badge variant="sage" className="py-1 px-3 text-xs">
          Offline Resilient Architecture
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-forest">
          Ready for Trail Exploration
        </h1>
        <p className="text-xs sm:text-sm text-earth-muted max-w-md mx-auto leading-relaxed">
          OutsideQuest AI is engineered as a progressive web application with local-first data caching. You can step away into forests, hills, or parks with zero cell reception.
        </p>
      </div>

      <Card variant="sand" className="border-earth-border text-left">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base text-earth-forest flex items-center gap-2">
            <Trees className="w-4 h-4 text-earth-forest" />
            <span>Outdoor Walking Protocol</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-2.5 text-xs text-earth-charcoal leading-relaxed">
          <p>
            1. <strong>Pre-cache your quest:</strong> Generate your micro-adventure while still connected or use previously saved templates.
          </p>
          <p>
            2. <strong>Pocket your device:</strong> Focus on sensory details—listen for bird calls, notice wind shifts, feel bark and stone textures.
          </p>
          <p>
            3. <strong>Record reflections:</strong> When you pause to rest, mark milestones and log notes. Everything is stored reliably in your browser’s IndexedDB.
          </p>
        </CardContent>
      </Card>

      <div className="pt-2">
        <Link href="/">
          <Button variant="primary" size="lg" leftIcon={<Compass className="w-4 h-4" />}>
            Return to Quest Builder
          </Button>
        </Link>
      </div>
    </div>
  );
}
