import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, HardDrive, Cpu, EyeOff, Lock, AlertCircle, Trash2, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Privacy & Data Transparency | OutsideQuest AI',
  description: 'Understand how OutsideQuest AI protects your privacy through local-first storage, on-device compute, and zero tracking.',
};

export default function PrivacyPage() {
  const privacyPillars = [
    {
      icon: HardDrive,
      title: 'Local Storage Exclusivity',
      description:
        'All quest configurations, journal reflections, completed milestones, and timestamps are stored exclusively in your browser’s IndexedDB sandbox. We maintain no remote database, no Supabase instance, and no cloud user profiles.',
    },
    {
      icon: Cpu,
      title: 'Browser-Native Open-Weight AI Inference',
      description:
        'Open-weight models execute directly on your personal device (via WebGPU / WebAssembly). Your quest prompts, observations, and notes are never dispatched to a paid remote AI API or cloud server.',
    },
    {
      icon: Download,
      title: 'Public Model Repository Download',
      description:
        'Before the AI model can run in your browser, its quantized weights must be downloaded to your device from a public model repository (Hugging Face CDN). While inference is 100% private and on-device, this initial download involves a standard HTTP GET to Hugging Face, making your IP address visible to their CDN during the asset transfer.',
    },
    {
      icon: EyeOff,
      title: 'Zero Telemetry & Tracking',
      description:
        'We do not inject analytics packages, session trackers, advertising pixels, or telemetry beacons. We do not track page paths, dwell time, or device identifiers.',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="border-b border-earth-border/80 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="forest" className="gap-1 py-1 px-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-earth-sage" />
            <span>Privacy & AI Transparency</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-forest tracking-tight">
          Privacy by Architecture
        </h1>
        <p className="text-xs sm:text-sm text-earth-muted leading-relaxed mt-2">
          OutsideQuest AI is engineered so that we cannot see what you explore, where you walk, or what you record in your journal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {privacyPillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Card key={pillar.title} className="border-earth-border/80 bg-white/70">
              <CardHeader className="p-5 pb-2">
                <div className="w-9 h-9 rounded-lg bg-earth-sage-light text-earth-forest flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-base text-earth-charcoal">
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-xs text-earth-muted leading-relaxed">
                  {pillar.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Management & Erasure */}
      <Card variant="sand" className="border-earth-border">
        <CardHeader className="p-5 pb-2">
          <div className="flex items-center gap-2 text-earth-forest">
            <Trash2 className="w-5 h-5 text-earth-forest" />
            <CardTitle className="text-base">Managing and Clearing Your Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-3">
          <p className="text-xs text-earth-charcoal/90 leading-relaxed">
            Because all application data is stored on your device, you have complete sovereignty over your information:
          </p>
          <ul className="space-y-1.5 text-xs text-earth-muted list-disc list-inside">
            <li>
              <strong>Delete Individual Entries:</strong> Use the trash icon next to any entry in &ldquo;My Journal&rdquo;.
            </li>
            <li>
              <strong>Clear Entire Journal:</strong> Use the &ldquo;Clear All Journal Data&rdquo; button in &ldquo;My Journal&rdquo; to empty the IndexedDB database.
            </li>
            <li>
              <strong>Browser Data Clearing:</strong> Clearing your browser&apos;s website cache or site cookies for this domain will permanently delete all locally saved journal records and any cached model weights.
            </li>
          </ul>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-earth-sand border border-earth-border text-xs text-earth-charcoal mt-2">
            <AlertCircle className="w-4 h-4 text-earth-forest shrink-0 mt-0.5" />
            <span>
              <strong>Note on backups:</strong> Since we do not maintain a remote database, entries cleared from your device cannot be restored by us.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
