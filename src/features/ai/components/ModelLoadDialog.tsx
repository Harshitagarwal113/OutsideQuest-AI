'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  Cpu,
  ShieldCheck,
  RotateCcw,
  Compass,
  HardDrive,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { localModelService, type ModelServiceStatus } from '../services/local-model-service';
import { formatBytes } from '@/lib/utils';
import { RECOMMENDED_AI_MODEL } from '@/lib/constants';

interface ModelLoadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithFallback: () => void;
  onSuccess?: () => void;
}

export function ModelLoadDialog({
  isOpen,
  onClose,
  onProceedWithFallback,
  onSuccess,
}: ModelLoadDialogProps) {
  const [status, setStatus] = useState<ModelServiceStatus>(localModelService.getStatus());
  const [isStartingDownload, setIsStartingDownload] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = localModelService.subscribe((currentStatus) => {
      setStatus(currentStatus);
      if (currentStatus.state === 'ready') {
        setIsStartingDownload(false);
        if (onSuccess) {
          onSuccess();
        }
      } else if (currentStatus.state === 'error') {
        setIsStartingDownload(false);
      }
    });

    return unsubscribe;
  }, [isOpen, onSuccess]);

  if (!isOpen) return null;

  const handleStartDownload = async () => {
    setIsStartingDownload(true);
    try {
      await localModelService.initializeModel();
    } catch {
      // Error will be reflected in status.errorMessage via worker listener
    } finally {
      setIsStartingDownload(false);
    }
  };

  const handleCancel = () => {
    localModelService.abort();
    setIsStartingDownload(false);
    onClose();
  };

  const handleUseCuratedFallback = () => {
    localModelService.abort();
    setIsStartingDownload(false);
    onProceedWithFallback();
    onClose();
  };

  const isDownloading = status.state === 'downloading';
  const isCompiling = status.state === 'compiling';
  const isReady = status.state === 'ready';
  const isError = status.state === 'error';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-charcoal/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-lg bg-white border-earth-border shadow-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-earth-sand-light/70 border-b border-earth-border/60 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-earth-forest/10 border border-earth-forest/20 flex items-center justify-center text-earth-forest">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle id="model-dialog-title" className="text-base sm:text-lg font-bold text-earth-charcoal">
                  On-Device AI Engine Setup
                </CardTitle>
                <CardDescription className="text-xs text-earth-muted">
                  Private, browser-native intelligence with zero server calls
                </CardDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 rounded-md text-earth-muted hover:text-earth-charcoal hover:bg-earth-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-earth-forest"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-5 sm:p-6 space-y-4">
          {/* Hardware & Privacy Callout */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-earth-sand-light border border-earth-border/60">
              <Cpu className="w-4 h-4 text-earth-forest shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-muted block">Hardware</span>
                <span className="font-semibold text-earth-charcoal uppercase">
                  {status.device === 'webgpu' ? 'WebGPU Accelerated' : 'WASM CPU Fallback'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-earth-sand-light border border-earth-border/60">
              <ShieldCheck className="w-4 h-4 text-earth-forest shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-earth-muted block">Privacy</span>
                <span className="font-semibold text-earth-forest">100% Client-Side</span>
              </div>
            </div>
          </div>

          {/* Initial State: Explanation before downloading */}
          {(status.state === 'not_initialized' || status.state === 'ready_to_download') && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-earth-sand-light/50 border border-earth-border text-xs text-earth-charcoal space-y-2 leading-relaxed">
                <p>
                  OutsideQuest AI uses <strong>{RECOMMENDED_AI_MODEL.displayName}</strong> ({RECOMMENDED_AI_MODEL.sizeEstimate}), an open-weight model running entirely inside your browser sandbox.
                </p>
                <div className="flex items-start gap-2 pt-1 text-earth-muted">
                  <HardDrive className="w-4 h-4 text-earth-accent shrink-0 mt-0.5" />
                  <span>
                    Initial setup downloads quantized weights (~350MB) and stores them in your browser cache. Subsequent quest generations run locally with no internet access needed.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  On a metered or slow connection? You can skip the download and instantly generate quests using verified <strong>Curated Offline Templates</strong> (0 MB download).
                </span>
              </div>
            </div>
          )}

          {/* Downloading & Compiling State */}
          {(isDownloading || isCompiling) && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-earth-charcoal flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-earth-forest animate-bounce" />
                  {isCompiling ? 'Compiling Shaders & Runtime...' : 'Downloading Model Weights...'}
                </span>
                {status.progress !== undefined && (
                  <span className="font-mono text-earth-forest font-bold">
                    {Math.round(status.progress)}%
                  </span>
                )}
              </div>

              {/* Real Progress or Honest Indeterminate */}
              {status.progress !== undefined ? (
                <ProgressBar
                  value={status.progress}
                  variant="forest"
                  className="h-3"
                />
              ) : (
                <div className="w-full bg-earth-sand h-3 rounded-full overflow-hidden relative" role="progressbar" aria-label="Loading model weights">
                  <div className="h-full bg-earth-forest rounded-full w-1/3 animate-pulse" />
                </div>
              )}

              {/* Bytes & File Information */}
              <div className="space-y-1 text-[11px] text-earth-muted">
                {status.downloadedBytes !== undefined && status.totalBytes !== undefined && (
                  <div className="flex justify-between">
                    <span>Transferred:</span>
                    <span className="font-mono text-earth-charcoal font-medium">
                      {formatBytes(status.downloadedBytes)} / {formatBytes(status.totalBytes)}
                    </span>
                  </div>
                )}
                {status.currentFile && (
                  <div className="flex justify-between truncate">
                    <span>File:</span>
                    <span className="font-mono text-earth-charcoal truncate max-w-[240px]">
                      {status.currentFile}
                    </span>
                  </div>
                )}
                {status.statusMessage && (
                  <p className="text-center italic text-earth-muted/80 pt-1">
                    {status.statusMessage}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Ready State */}
          {isReady && (
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-sm text-emerald-950">Model Weights Ready!</h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                The open-weight SLM is initialized in memory. You are ready to generate completely private, unmetered outdoor adventures.
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Model Initialization Failed</span>
                </div>
                <p className="leading-relaxed">
                  {status.errorMessage || 'Network connection interrupted or device memory limited.'}
                </p>
              </div>
              <p className="text-xs text-earth-muted leading-relaxed">
                You can retry the download, or continue immediately with our zero-data <strong>Curated Offline Fallback</strong> engine.
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="bg-earth-sand-light/40 border-t border-earth-border/60 p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Action 1: Fallback option */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUseCuratedFallback}
            className="text-xs text-earth-charcoal hover:bg-earth-sand justify-center order-2 sm:order-1"
            leftIcon={<Compass className="w-3.5 h-3.5 text-earth-forest" />}
          >
            Use Curated Quest (No Download)
          </Button>

          {/* Action 2: Main Contextual CTA */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            {(status.state === 'not_initialized' || status.state === 'ready_to_download') && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleStartDownload}
                isLoading={isStartingDownload}
                className="w-full sm:w-auto text-xs font-semibold"
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download Model (~350MB)
              </Button>
            )}

            {(isDownloading || isCompiling) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="w-full sm:w-auto text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
              >
                Cancel Download
              </Button>
            )}

            {isReady && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onClose}
                className="w-full sm:w-auto text-xs font-semibold"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Continue to Quest
              </Button>
            )}

            {isError && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleStartDownload}
                className="w-full sm:w-auto text-xs font-semibold"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Retry Download
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
