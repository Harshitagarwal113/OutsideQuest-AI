import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LocalModelService } from '@/features/ai/services/local-model-service';
import type { WorkerResponse } from '@/features/ai/schemas/ai-message-schema';

describe('LocalModelService Lifecycle & Transitions', () => {
  let service: LocalModelService;
  let mockWorker: {
    postMessage: ReturnType<typeof vi.fn>;
    terminate: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };
  let messageCallback: ((event: { data: unknown }) => void) | null = null;

  beforeEach(() => {
    LocalModelService.resetInstance();
    service = LocalModelService.getInstance();

    messageCallback = null;
    mockWorker = {
      postMessage: vi.fn(),
      terminate: vi.fn(),
      addEventListener: vi.fn((event: string, cb: (e: { data: unknown }) => void) => {
        if (event === 'message') {
          messageCallback = cb;
        }
      }),
      removeEventListener: vi.fn(),
    };

    service.setMockWorker(mockWorker as unknown as Worker);
  });

  afterEach(() => {
    service.terminate();
    LocalModelService.resetInstance();
    vi.restoreAllMocks();
  });

  it('initializes in not_initialized state with default model and device', () => {
    const status = service.getStatus();
    expect(status.state).toBe('not_initialized');
    expect(status.modelId).toBe('onnx-community/Qwen2.5-0.5B-Instruct');
    expect(['webgpu', 'wasm', 'cpu']).toContain(status.device);
  });

  it('notifies subscribers upon status change', () => {
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);

    // Called initially
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ state: 'not_initialized' }));

    // Send a mock LOADING_PROGRESS message
    service.handleWorkerMessage({
      type: 'LOADING_PROGRESS',
      status: 'downloading',
      progress: 50,
      loadedBytes: 175000000,
      totalBytes: 350000000,
      file: 'model_q4.onnx',
    } as WorkerResponse);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        state: 'downloading',
        progress: 50,
        downloadedBytes: 175000000,
        totalBytes: 350000000,
      })
    );

    unsubscribe();
  });

  it('transitions from downloading to ready upon INIT_SUCCESS', async () => {
    const initPromise = service.initializeModel();

    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'INIT' })
    );
    expect(service.getStatus().state).toBe('downloading');

    // Worker signals INIT_SUCCESS
    service.handleWorkerMessage({
      type: 'INIT_SUCCESS',
      device: 'webgpu',
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
    } as WorkerResponse);

    await initPromise;

    const finalStatus = service.getStatus();
    expect(finalStatus.state).toBe('ready');
    expect(finalStatus.device).toBe('webgpu');
    expect(finalStatus.progress).toBe(100);
  });

  it('transitions to error upon INIT_ERROR and rejects init promise', async () => {
    const initPromise = service.initializeModel();

    service.handleWorkerMessage({
      type: 'INIT_ERROR',
      error: 'WebGPU Out of Memory',
      fallbackAllowed: true,
    } as WorkerResponse);

    await expect(initPromise).rejects.toThrow('WebGPU Out of Memory');

    const status = service.getStatus();
    expect(status.state).toBe('error');
    expect(status.errorMessage).toBe('WebGPU Out of Memory');
  });

  it('performs text generation and resolves with rawText upon GENERATION_SUCCESS', async () => {
    // First set to ready
    service.handleWorkerMessage({
      type: 'INIT_SUCCESS',
      device: 'wasm',
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
    } as WorkerResponse);

    const genPromise = service.generateText('user prompt', 'system prompt');

    expect(service.getStatus().state).toBe('generating');
    expect(mockWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GENERATE',
        prompt: 'user prompt',
        systemPrompt: 'system prompt',
      })
    );

    // Get the requestId that was dispatched
    const calls = mockWorker.postMessage.mock.calls;
    const lastCall = calls[calls.length - 1]!;
    const dispatchedReq = lastCall[0];

    service.handleWorkerMessage({
      type: 'GENERATION_SUCCESS',
      requestId: dispatchedReq.requestId,
      rawText: '{"title": "Forest Trail"}',
      durationMs: 400,
    } as WorkerResponse);

    const result = await genPromise;
    expect(result).toBe('{"title": "Forest Trail"}');
    expect(service.getStatus().state).toBe('ready');
  });

  it('handles generation error and sets state to error', async () => {
    service.handleWorkerMessage({
      type: 'INIT_SUCCESS',
      device: 'wasm',
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
    } as WorkerResponse);

    const genPromise = service.generateText('prompt', 'system');
    const calls = mockWorker.postMessage.mock.calls;
    const lastCall = calls[calls.length - 1]!;
    const dispatchedReq = lastCall[0];

    service.handleWorkerMessage({
      type: 'GENERATION_ERROR',
      requestId: dispatchedReq.requestId,
      error: 'Inference kernel failure',
    } as WorkerResponse);

    await expect(genPromise).rejects.toThrow('Inference kernel failure');
    expect(service.getStatus().state).toBe('error');
  });

  it('aborts active generation and rejects pending promise on user cancellation', async () => {
    service.handleWorkerMessage({
      type: 'INIT_SUCCESS',
      device: 'wasm',
      modelId: 'onnx-community/Qwen2.5-0.5B-Instruct',
    } as WorkerResponse);

    const genPromise = service.generateText('prompt', 'system');
    expect(service.getStatus().state).toBe('generating');

    service.abort();

    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: 'ABORT' });
    await expect(genPromise).rejects.toThrow('Generation cancelled by user');
    expect(service.getStatus().state).toBe('ready');
  });
});
