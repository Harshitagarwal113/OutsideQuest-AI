import { pipeline, env, type TextGenerationPipeline } from '@huggingface/transformers';
import type { WorkerRequest, WorkerResponse } from '../schemas/ai-message-schema';

// Configure transformers environment for browser execution
env.allowLocalModels = false;
env.useBrowserCache = true;

class PipelineSingleton {
  static modelId = 'onnx-community/Qwen2.5-0.5B-Instruct';
  static instance: TextGenerationPipeline | null = null;
  static activeDevice: 'webgpu' | 'wasm' | 'cpu' = 'wasm';

  static async getInstance(
    modelId: string,
    preferredDevice?: 'webgpu' | 'wasm' | 'cpu',
    dtype: 'q4' | 'q8' | 'fp32' = 'q4',
    progressCallback?: (data: Record<string, unknown>) => void
  ): Promise<{ pipeline: TextGenerationPipeline; device: 'webgpu' | 'wasm' | 'cpu'; modelId: string }> {
    if (this.instance && this.modelId === modelId) {
      return { pipeline: this.instance, device: this.activeDevice, modelId: this.modelId };
    }

    this.modelId = modelId;

    // Check WebGPU availability
    let device: 'webgpu' | 'wasm' | 'cpu' = preferredDevice || 'wasm';
    if (device === 'webgpu') {
      const hasGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
      if (!hasGpu) {
        device = 'wasm';
      }
    }

    const loadPipeline = pipeline as unknown as (
      task: string,
      model: string,
      options?: Record<string, unknown>
    ) => Promise<TextGenerationPipeline>;

    try {
      this.instance = await loadPipeline('text-generation', modelId, {
        device,
        dtype,
        progress_callback: progressCallback,
      });
      this.activeDevice = device;
      return { pipeline: this.instance, device, modelId: this.modelId };
    } catch (err) {
      // If WebGPU failed, attempt WASM fallback
      if (device === 'webgpu') {
        if (progressCallback) {
          progressCallback({
            status: 'compiling',
            message: 'WebGPU unavailable, falling back to WebAssembly...',
          });
        }
        device = 'wasm';
        this.instance = await loadPipeline('text-generation', modelId, {
          device: 'wasm',
          dtype,
          progress_callback: progressCallback,
        });
        this.activeDevice = device;
        return { pipeline: this.instance, device, modelId: this.modelId };
      }
      throw err;
    }
  }
}

// Worker message listener
self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  switch (request.type) {
    case 'CHECK_STATUS': {
      self.postMessage({
        type: 'INIT_SUCCESS',
        device: PipelineSingleton.activeDevice,
        modelId: PipelineSingleton.modelId,
      } as WorkerResponse);
      break;
    }

    case 'INIT': {
      try {
        const { device, modelId } = await PipelineSingleton.getInstance(
          request.modelId,
          request.preferredDevice,
          request.dtype,
          (progressData) => {
            const status = (progressData['status'] as string) || 'downloading';
            const progress = typeof progressData['progress'] === 'number' ? progressData['progress'] : undefined;
            const loadedBytes = typeof progressData['loaded'] === 'number' ? progressData['loaded'] : undefined;
            const totalBytes = typeof progressData['total'] === 'number' ? progressData['total'] : undefined;
            const file = typeof progressData['file'] === 'string' ? progressData['file'] : undefined;
            const message = typeof progressData['message'] === 'string' ? progressData['message'] : undefined;

            self.postMessage({
              type: 'LOADING_PROGRESS',
              status: status === 'done' ? 'done' : status === 'ready' ? 'ready' : 'progress',
              file,
              progress,
              loadedBytes,
              totalBytes,
              message,
            } as WorkerResponse);
          }
        );

        self.postMessage({
          type: 'INIT_SUCCESS',
          device,
          modelId,
        } as WorkerResponse);
      } catch (err) {
        self.postMessage({
          type: 'INIT_ERROR',
          error: err instanceof Error ? err.message : String(err),
          fallbackAllowed: true,
        } as WorkerResponse);
      }
      break;
    }

    case 'GENERATE': {
      const startTime = performance.now();
      try {
        const { pipeline: generator } = await PipelineSingleton.getInstance(
          PipelineSingleton.modelId
        );

        const messages = [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.prompt },
        ];

        const output = await generator(messages, {
          max_new_tokens: request.maxNewTokens || 512,
          temperature: request.temperature || 0.4,
          do_sample: true,
          top_p: 0.9,
          return_full_text: false,
        });

        const rawText = Array.isArray(output) && output[0] && typeof output[0] === 'object'
          ? (output[0] as { generated_text?: string | Array<{ content?: string }> }).generated_text || ''
          : String(output);

        // Normalize text if array of chat turns was returned
        let finalContent = '';
        if (typeof rawText === 'string') {
          finalContent = rawText;
        } else if (Array.isArray(rawText)) {
          const lastTurn = rawText[rawText.length - 1];
          finalContent = (lastTurn && typeof lastTurn === 'object' && 'content' in lastTurn ? lastTurn.content : '') as string;
        }

        const durationMs = Math.round(performance.now() - startTime);

        self.postMessage({
          type: 'GENERATION_SUCCESS',
          requestId: request.requestId,
          rawText: finalContent,
          durationMs,
        } as WorkerResponse);
      } catch (err) {
        self.postMessage({
          type: 'GENERATION_ERROR',
          requestId: request.requestId,
          error: err instanceof Error ? err.message : String(err),
        } as WorkerResponse);
      }
      break;
    }

    case 'ABORT': {
      // Handled at worker lifecycle level
      break;
    }
  }
});

export {};
