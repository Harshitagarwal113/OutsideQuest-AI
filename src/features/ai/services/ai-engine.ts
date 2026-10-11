import { RECOMMENDED_AI_MODEL } from '@/lib/constants';
import type { AiModelStatus } from '@/types';
import type { QuestParams } from '@/features/quest-builder/schemas/quest-params';
import { QuestGeneratorService } from '@/features/quest-builder/services/generator';
import type { Quest } from '@/types';

class LocalAiEngine {
  private status: AiModelStatus = {
    state: 'idle',
    progress: 0,
    deviceBackend: 'wasm',
    modelId: RECOMMENDED_AI_MODEL.id,
    isModelCachedLocally: false,
    activeEngine: 'curated-fallback',
  };
  private statusListeners: Array<(status: AiModelStatus) => void> = [];

  constructor() {
    // Avoid running in SSR
    if (typeof window !== 'undefined') {
      this.detectCapabilities();
    }
  }

  public subscribe(listener: (status: AiModelStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.statusListeners.forEach((listener) => listener({ ...this.status }));
  }

  public getStatus(): AiModelStatus {
    return { ...this.status };
  }

  public async detectCapabilities(): Promise<'webgpu' | 'wasm' | 'cpu'> {
    if (typeof window === 'undefined') return 'cpu';

    let backend: 'webgpu' | 'wasm' | 'cpu' = 'wasm';

    if ('gpu' in navigator) {
      try {
        const gpuNav = navigator as unknown as { gpu?: { requestAdapter: () => Promise<unknown> } };
        const adapter = await gpuNav.gpu?.requestAdapter();
        if (adapter) {
          backend = 'webgpu';
        }
      } catch {
        backend = 'wasm';
      }
    } else if (typeof WebAssembly !== 'undefined') {
      backend = 'wasm';
    } else {
      backend = 'cpu';
    }

    this.status = {
      ...this.status,
      state: 'standby',
      deviceBackend: backend,
      activeEngine: 'curated-fallback',
    };
    this.notify();
    return backend;
  }

  public async generateQuest(params: QuestParams): Promise<Quest> {
    return QuestGeneratorService.generate(params);
  }
}

export const aiEngine = new LocalAiEngine();
