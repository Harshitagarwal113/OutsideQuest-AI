import { describe, it, expect } from 'vitest';
import {
  workerRequestSchema,
  workerResponseSchema,
  type WorkerRequest,
  type WorkerResponse,
} from '@/features/ai/schemas/ai-message-schema';

describe('Worker Message Protocol Schemas', () => {
  it('validates INIT request schema', () => {
    const validInit: WorkerRequest = {
      type: 'INIT',
      modelId: 'onnx-community/gemma-3-270m-it-ONNX',
      preferredDevice: 'webgpu',
      dtype: 'q4',
    };
    expect(() => workerRequestSchema.parse(validInit)).not.toThrow();
  });

  it('validates GENERATE request schema', () => {
    const validGen: WorkerRequest = {
      type: 'GENERATE',
      requestId: 'req_123',
      prompt: 'Hello',
      systemPrompt: 'System',
      maxNewTokens: 256,
      temperature: 0.5,
    };
    expect(() => workerRequestSchema.parse(validGen)).not.toThrow();
  });

  it('validates ABORT and CHECK_STATUS requests', () => {
    expect(() => workerRequestSchema.parse({ type: 'ABORT' })).not.toThrow();
    expect(() => workerRequestSchema.parse({ type: 'CHECK_STATUS' })).not.toThrow();
  });

  it('validates LOADING_PROGRESS response schema', () => {
    const progressResp: WorkerResponse = {
      type: 'LOADING_PROGRESS',
      status: 'progress',
      file: 'model_q4.onnx',
      progress: 45.5,
      loadedBytes: 150000000,
      totalBytes: 350000000,
      message: 'Downloading model_q4.onnx',
    };
    expect(() => workerResponseSchema.parse(progressResp)).not.toThrow();
  });

  it('validates INIT_SUCCESS and INIT_ERROR responses', () => {
    const success: WorkerResponse = {
      type: 'INIT_SUCCESS',
      device: 'webgpu',
      modelId: 'onnx-community/gemma-3-270m-it-ONNX',
    };
    expect(() => workerResponseSchema.parse(success)).not.toThrow();

    const error: WorkerResponse = {
      type: 'INIT_ERROR',
      error: 'Shader compilation failed',
      fallbackAllowed: true,
    };
    expect(() => workerResponseSchema.parse(error)).not.toThrow();
  });

  it('validates GENERATION_SUCCESS and GENERATION_ERROR responses', () => {
    const genSuccess: WorkerResponse = {
      type: 'GENERATION_SUCCESS',
      requestId: 'req_123',
      rawText: '{"title":"Test"}',
      durationMs: 1250,
    };
    expect(() => workerResponseSchema.parse(genSuccess)).not.toThrow();

    const genError: WorkerResponse = {
      type: 'GENERATION_ERROR',
      requestId: 'req_123',
      error: 'Out of memory',
    };
    expect(() => workerResponseSchema.parse(genError)).not.toThrow();
  });

  it('rejects invalid request types or negative durations', () => {
    expect(() =>
      workerRequestSchema.parse({
        type: 'INVALID_TYPE',
      })
    ).toThrow();

    expect(() =>
      workerResponseSchema.parse({
        type: 'GENERATION_SUCCESS',
        requestId: '123',
        rawText: 'hi',
        durationMs: -50,
      })
    ).toThrow();
  });
});
