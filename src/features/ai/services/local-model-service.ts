import type { WorkerRequest, WorkerResponse } from '../schemas/ai-message-schema';
import { workerResponseSchema } from '../schemas/ai-message-schema';
import { RECOMMENDED_AI_MODEL } from '@/lib/constants';

export type ModelLifecycleState =
  | 'not_initialized'
  | 'ready_to_download'
  | 'downloading'
  | 'compiling'
  | 'ready'
  | 'generating'
  | 'error';

export interface ModelServiceStatus {
  state: ModelLifecycleState;
  modelId: string;
  device: 'webgpu' | 'wasm' | 'cpu';
  progress?: number; // 0 to 100
  downloadedBytes?: number;
  totalBytes?: number;
  currentFile?: string;
  statusMessage?: string;
  errorMessage?: string;
}

export class LocalModelService {
  private static instance: LocalModelService | null = null;
  private worker: Worker | null = null;
  private status: ModelServiceStatus = {
    state: 'not_initialized',
    modelId: RECOMMENDED_AI_MODEL.id,
    device: 'wasm',
  };
  private listeners: Array<(status: ModelServiceStatus) => void> = [];
  private activeRequestResolvers = new Map<
    string,
    { resolve: (text: string) => void; reject: (err: Error) => void; timeout: NodeJS.Timeout }
  >();
  private initResolvers: Array<{ resolve: () => void; reject: (err: Error) => void }> = [];

  private constructor() {
    // Detect hardware on client side
    if (typeof window !== 'undefined') {
      this.detectHardware();
    }
  }

  public static getInstance(): LocalModelService {
    if (!LocalModelService.instance) {
      LocalModelService.instance = new LocalModelService();
    }
    return LocalModelService.instance;
  }

  public static resetInstance(): void {
    if (LocalModelService.instance?.worker) {
      try {
        LocalModelService.instance.worker.terminate();
      } catch {
        // noop
      }
    }
    LocalModelService.instance = null;
  }

  public setMockWorker(mockWorker: Worker | null): void {
    this.worker = mockWorker;
    if (mockWorker) {
      mockWorker.addEventListener('message', (event: MessageEvent<unknown>) => {
        this.handleWorkerMessage(event.data);
      });
    }
  }

  public getStatus(): ModelServiceStatus {
    return { ...this.status };
  }

  public subscribe(listener: (status: ModelServiceStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const current = this.getStatus();
    this.listeners.forEach((l) => l(current));
  }

  public async detectHardware(): Promise<'webgpu' | 'wasm' | 'cpu'> {
    if (typeof window === 'undefined') return 'wasm';
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
    }
    this.status = {
      ...this.status,
      device: backend,
    };
    this.notify();
    return backend;
  }

  private getWorker(): Worker {
    if (typeof window === 'undefined') {
      throw new Error('Web Workers cannot be instantiated during server-side rendering');
    }

    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/model.worker.ts', import.meta.url), {
        type: 'module',
      });

      this.worker.addEventListener('message', (event: MessageEvent<unknown>) => {
        this.handleWorkerMessage(event.data);
      });

      this.worker.addEventListener('error', (err) => {
        this.status = {
          ...this.status,
          state: 'error',
          errorMessage: err.message || 'Worker runtime error',
        };
        this.notify();
      });
    }

    return this.worker;
  }

  public handleWorkerMessage(data: unknown): void {
    const parseResult = workerResponseSchema.safeParse(data);
    if (!parseResult.success) {
      console.warn('Unknown worker message format:', data);
      return;
    }

    const response = parseResult.data;

    switch (response.type) {
      case 'LOADING_PROGRESS': {
        this.status = {
          ...this.status,
          state: response.status === 'compiling' ? 'compiling' : 'downloading',
          progress: response.progress,
          downloadedBytes: response.loadedBytes,
          totalBytes: response.totalBytes,
          currentFile: response.file,
          statusMessage: response.message || (response.status === 'compiling' ? 'Compiling shaders...' : 'Downloading weights...'),
        };
        this.notify();
        break;
      }

      case 'INIT_SUCCESS': {
        this.status = {
          ...this.status,
          state: 'ready',
          device: response.device,
          modelId: response.modelId,
          progress: 100,
          statusMessage: 'Model ready for on-device inference.',
          errorMessage: undefined,
        };
        this.notify();

        const pendingInits = [...this.initResolvers];
        this.initResolvers = [];
        pendingInits.forEach((r) => r.resolve());
        break;
      }

      case 'INIT_ERROR': {
        this.status = {
          ...this.status,
          state: 'error',
          errorMessage: response.error,
          statusMessage: 'Model initialization failed.',
        };
        this.notify();

        const pendingInits = [...this.initResolvers];
        this.initResolvers = [];
        pendingInits.forEach((r) => r.reject(new Error(response.error)));
        break;
      }

      case 'GENERATION_SUCCESS': {
        this.status = {
          ...this.status,
          state: 'ready',
          statusMessage: 'Generation completed.',
        };
        this.notify();

        const pending = this.activeRequestResolvers.get(response.requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          this.activeRequestResolvers.delete(response.requestId);
          pending.resolve(response.rawText);
        }
        break;
      }

      case 'GENERATION_ERROR': {
        this.status = {
          ...this.status,
          state: 'error',
          errorMessage: response.error,
          statusMessage: 'Inference encountered an error.',
        };
        this.notify();

        const pending = this.activeRequestResolvers.get(response.requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          this.activeRequestResolvers.delete(response.requestId);
          pending.reject(new Error(response.error));
        }
        break;
      }
    }
  }

  public async initializeModel(): Promise<void> {
    if (this.status.state === 'ready') return;
    if (this.status.state === 'downloading' || this.status.state === 'compiling') {
      return new Promise<void>((resolve, reject) => {
        this.initResolvers.push({ resolve, reject });
      });
    }

    this.status = {
      ...this.status,
      state: 'downloading',
      progress: undefined,
      errorMessage: undefined,
      statusMessage: 'Connecting to model repository...',
    };
    this.notify();

    const worker = this.getWorker();
    const req: WorkerRequest = {
      type: 'INIT',
      modelId: this.status.modelId,
      preferredDevice: this.status.device,
      dtype: 'q4',
    };

    return new Promise<void>((resolve, reject) => {
      this.initResolvers.push({ resolve, reject });
      worker.postMessage(req);
    });
  }

  public async generateText(
    prompt: string,
    systemPrompt: string,
    timeoutMs = 45000
  ): Promise<string> {
    if (this.status.state !== 'ready') {
      await this.initializeModel();
    }

    const worker = this.getWorker();
    const requestId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    this.status = {
      ...this.status,
      state: 'generating',
      statusMessage: 'Running on-device neural inference...',
    };
    this.notify();

    return new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.activeRequestResolvers.delete(requestId);
        this.status = {
          ...this.status,
          state: 'error',
          errorMessage: 'Inference timed out after 45 seconds.',
        };
        this.notify();
        reject(new Error('Generation timed out.'));
      }, timeoutMs);

      this.activeRequestResolvers.set(requestId, { resolve, reject, timeout });

      const req: WorkerRequest = {
        type: 'GENERATE',
        requestId,
        prompt,
        systemPrompt,
        maxNewTokens: 512,
        temperature: 0.4,
      };
      worker.postMessage(req);
    });
  }

  public abort(): void {
    if (this.worker) {
      try {
        this.worker.postMessage({ type: 'ABORT' });
      } catch {
        // noop
      }
    }
    this.activeRequestResolvers.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Generation cancelled by user.'));
    });
    this.activeRequestResolvers.clear();

    this.initResolvers.forEach(({ reject }) => {
      reject(new Error('Model loading cancelled by user.'));
    });
    this.initResolvers = [];

    this.status = {
      ...this.status,
      state: this.status.state === 'generating' ? 'ready' : 'not_initialized',
      statusMessage: 'Operation cancelled.',
    };
    this.notify();
  }

  public terminate(): void {
    this.abort();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.status = {
      ...this.status,
      state: 'not_initialized',
      progress: undefined,
    };
    this.notify();
  }
}

export const localModelService = LocalModelService.getInstance();
