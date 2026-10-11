'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { localModelService, type ModelServiceStatus } from '../services/local-model-service';
import { ModelLoadDialog } from './ModelLoadDialog';
import { RECOMMENDED_AI_MODEL } from '@/lib/constants';

export function LocalAiStatus() {
  const [status, setStatus] = useState<ModelServiceStatus>(localModelService.getStatus());
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = localModelService.subscribe((updatedStatus) => {
      setStatus(updatedStatus);
    });
    return unsubscribe;
  }, []);

  const getStatusBadge = () => {
    switch (status.state) {
      case 'ready':
        return (
          <Badge variant="forest" className="py-0.5 px-2 text-[10px] gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Local AI Ready</span>
          </Badge>
        );
      case 'generating':
        return (
          <Badge variant="forest" className="py-0.5 px-2 text-[10px] gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-earth-accent" />
            <span>Generating On-Device...</span>
          </Badge>
        );
      case 'downloading':
        return (
          <Badge variant="accent" className="py-0.5 px-2 text-[10px] gap-1">
            <Download className="w-3 h-3 animate-bounce" />
            <span>
              Downloading Model{status.progress !== undefined ? ` (${Math.round(status.progress)}%)` : ''}
            </span>
          </Badge>
        );
      case 'compiling':
        return (
          <Badge variant="sage" className="py-0.5 px-2 text-[10px] gap-1">
            <Loader2 className="w-3 h-3 animate-spin text-earth-forest" />
            <span>Compiling Shaders...</span>
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="py-0.5 px-2 text-[10px] gap-1 border-rose-300 text-rose-700 bg-rose-50">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Error / Fallback Active</span>
          </Badge>
        );
      case 'ready_to_download':
        return (
          <Badge variant="outline" className="py-0.5 px-2 text-[10px] gap-1 bg-white text-earth-forest border-earth-forest/40">
            <Download className="w-3 h-3" />
            <span>Ready to Download</span>
          </Badge>
        );
      case 'not_initialized':
      default:
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="sage" className="py-0.5 px-2 text-[10px] gap-1">
              <CheckCircle2 className="w-3 h-3 text-earth-forest" />
              <span>Curated Templates Active</span>
            </Badge>
            <Badge variant="outline" className="py-0.5 px-2 text-[10px] bg-white text-earth-muted">
              <Clock className="w-3 h-3 text-earth-muted" />
              <span>SLM: Standby</span>
            </Badge>
          </div>
        );
    }
  };

  const getStatusDescription = () => {
    switch (status.state) {
      case 'ready':
        return `Active provider: On-device ${RECOMMENDED_AI_MODEL.displayName}. Running 100% locally on your browser silicon with WebGPU/WASM acceleration.`;
      case 'generating':
        return 'Language model is processing prompt tokens directly on your device thread. No external servers involved.';
      case 'downloading':
      case 'compiling':
        return `Fetching open weights for ${RECOMMENDED_AI_MODEL.displayName} into browser cache. Initial setup requires data, subsequent runs are offline.`;
      case 'error':
        return `Model encountered an issue (${status.errorMessage || 'Unknown'}). OutsideQuest will safely use deterministic curated templates.`;
      case 'not_initialized':
      default:
        return `Active engine: Curated Offline Templates (0 MB download). You can optionally download the open-weight model (${RECOMMENDED_AI_MODEL.sizeEstimate}) for custom on-device synthesis.`;
    }
  };

  return (
    <>
      <Card variant="sand" className="border-earth-border/90 overflow-hidden" id="local-ai-status-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Status Header */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-earth-forest/10 border border-earth-forest/20 flex items-center justify-center text-earth-forest shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-earth-forest" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-sm text-earth-charcoal">
                    Local Generation Engine
                  </h4>
                  {getStatusBadge()}
                </div>
                <p className="text-xs text-earth-muted mt-1 leading-relaxed max-w-xl">
                  {getStatusDescription()}
                </p>
              </div>
            </div>

            {/* Actions & Hardware Badges */}
            <div className="flex items-center flex-wrap gap-2 text-xs shrink-0 self-end sm:self-center">
              {status.state !== 'ready' && status.state !== 'generating' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="text-xs py-1 px-2.5 h-8 bg-white border-earth-border text-earth-forest hover:bg-earth-sand-light font-medium"
                  leftIcon={status.state === 'error' ? <RotateCcw className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                >
                  {status.state === 'error' ? 'Retry AI Setup' : 'Enable On-Device AI'}
                </Button>
              )}

              <Badge variant="outline" className="gap-1 border-earth-border bg-white text-earth-charcoal">
                <Cpu className="w-3 h-3 text-earth-forest" />
                <span>Silicon: {status.device.toUpperCase()}</span>
              </Badge>

              <Badge variant="outline" className="gap-1 border-earth-border bg-white text-earth-forest font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-earth-forest" />
                <span>100% Private</span>
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <ModelLoadDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onProceedWithFallback={() => setDialogOpen(false)}
      />
    </>
  );
}
