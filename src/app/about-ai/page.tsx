import React from 'react';
import type { Metadata } from 'next';
import {
  Sparkles,
  Cpu,
  Zap,
  CloudOff,
  Download,
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  Code2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RECOMMENDED_AI_MODEL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About the AI & Open Innovation | OutsideQuest AI',
  description: 'Learn how OutsideQuest AI runs open-weight models in your browser with zero remote servers, absolute privacy, and verified offline safety.',
};

export default function AboutAiPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-earth-border/80 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="forest" className="gap-1 py-1 px-2.5">
            <Sparkles className="w-3.5 h-3.5 text-earth-accent" />
            <span>Open-Weight Innovation & Privacy</span>
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-earth-forest tracking-tight">
          How OutsideQuest AI Operates On-Device
        </h1>
        <p className="text-xs sm:text-sm text-earth-muted leading-relaxed mt-2">
          Most modern AI applications send every keystroke, query, and context to cloud server farms. OutsideQuest AI takes an honest, privacy-first approach using open-weight models that execute directly on your device silicon.
        </p>
      </div>

      <div className="space-y-5">
        {/* Model Attribution & Open Weights */}
        <Card variant="sand" className="border-earth-forest/40">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-earth-forest">
                <Cpu className="w-5 h-5 text-earth-forest" />
                <CardTitle className="text-lg">Open-Weight Architecture: Google Gemma 3</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] bg-white border-earth-forest text-earth-forest font-semibold">
                Gemma Open Weights
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-xs sm:text-sm text-earth-charcoal leading-relaxed">
            <p>
              OutsideQuest AI integrates <strong>{RECOMMENDED_AI_MODEL.displayName}</strong>, an open-weight instruction model built by Google and packaged for high-efficiency browser ONNX runtime execution by the Hugging Face ONNX Community.
            </p>
            <div className="p-3 bg-white/80 rounded-lg border border-earth-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-earth-muted">Repository:</span>
                <a
                  href={`https://huggingface.co/${RECOMMENDED_AI_MODEL.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-earth-forest font-semibold hover:underline flex items-center gap-1"
                >
                  {RECOMMENDED_AI_MODEL.id} <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-muted">Quantization:</span>
                <span className="font-mono text-earth-charcoal font-medium">INT4 (q4) {RECOMMENDED_AI_MODEL.sizeEstimate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-muted">License:</span>
                <a
                  href="https://ai.google.dev/gemma/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-earth-forest hover:underline flex items-center gap-1"
                >
                  Gemma Terms of Use <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Open Weights Matter */}
        <Card className="border-earth-border/80">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-earth-forest">
              <Code2 className="w-5 h-5 text-earth-forest" />
              <CardTitle className="text-lg">Why Browser-Native Open Weights Matter</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3 text-xs sm:text-sm text-earth-charcoal leading-relaxed">
            <p>
              Choosing browser-native open weights is a deliberate design philosophy:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-earth-sand-light border border-earth-border/60">
                <div className="flex items-center gap-1.5 font-semibold text-earth-forest text-xs mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero Data Transmission</span>
                </div>
                <p className="text-[11px] text-earth-muted leading-relaxed">
                  Your time constraints, local landmarks, physical limitations, and sensory observations never leave your device.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-earth-sand-light border border-earth-border/60">
                <div className="flex items-center gap-1.5 font-semibold text-earth-forest text-xs mb-1">
                  <CloudOff className="w-4 h-4" />
                  <span>No Subscriptions or API Keys</span>
                </div>
                <p className="text-[11px] text-earth-muted leading-relaxed">
                  No monthly credits, token costs, or paywalls. Adventure creation is completely democratized and unmetered.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-earth-sand-light border border-earth-border/60">
                <div className="flex items-center gap-1.5 font-semibold text-earth-forest text-xs mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Silicon Hardware Acceleration</span>
                </div>
                <p className="text-[11px] text-earth-muted leading-relaxed">
                  Inference runs on your GPU via <strong>WebGPU</strong> or your CPU via <strong>WebAssembly</strong> inside a dedicated Web Worker.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-earth-sand-light border border-earth-border/60">
                <div className="flex items-center gap-1.5 font-semibold text-earth-forest text-xs mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Open & Auditable</span>
                </div>
                <p className="text-[11px] text-earth-muted leading-relaxed">
                  The model, validation schemas, and prompts are open and inspectable. No closed-source black box algorithms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clear Distinctions */}
        <Card className="border-earth-border/80">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base text-earth-charcoal">
              Key Distinctions: Open Weights vs. Open Source vs. Browser Runtime
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs text-earth-muted leading-relaxed">
            <p>
              <strong className="text-earth-charcoal font-semibold">Open Weights:</strong> Refers to the pre-trained neural network parameters (tensors). They are distributed as static files under permissive licenses (Apache 2.0).
            </p>
            <p>
              <strong className="text-earth-charcoal font-semibold">Open-Source Software:</strong> Refers to the OutsideQuest application code, the Web Worker orchestration, prompt generators, and Zod validation parsers.
            </p>
            <p>
              <strong className="text-earth-charcoal font-semibold">Browser Runtime:</strong> Refers to the sandboxed execution environment (WebGPU and WASM) provided by your browser that executes the ONNX runtime safely without system-level privileges.
            </p>
          </CardContent>
        </Card>

        {/* Honest Limitations & Offline Reality */}
        <Card variant="sand" className="border-earth-border">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-earth-forest">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <CardTitle className="text-lg">Honest Limitations & Offline Expectations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2 text-xs sm:text-sm text-earth-charcoal leading-relaxed">
            <p>
              We believe in honest engineering without hype:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-earth-muted text-xs pl-1">
              <li>
                <strong>Not Offline on First Use:</strong> The AI model weights ({RECOMMENDED_AI_MODEL.sizeEstimate}) must be downloaded once over an active internet connection. Once saved to your browser&apos;s Cache Storage, it works offline.
              </li>
              <li>
                <strong>Instant Offline Fallback:</strong> If you are offline without the model downloaded, or wish to conserve battery and data, our verified <strong>Curated Offline Engine</strong> works instantly with zero downloads.
              </li>
              <li>
                <strong>Model Scope vs. Giant Cloud LLMs:</strong> A 270M parameter quantized model is tuned specifically for structured micro-adventure formatting. It is not equivalent to a multi-billion-parameter cloud cluster.
              </li>
              <li>
                <strong>Guaranteed Safety Filters:</strong> Because generative models can occasionally make unsupported suggestions, our strict programmatic parser automatically verifies safety rules (no eating plants, no approaching animals, staying on public paths).
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
