import { z } from 'zod';

export const workerRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('INIT'),
    modelId: z.string().default('onnx-community/gemma-3-270m-it-ONNX'),
    preferredDevice: z.enum(['webgpu', 'wasm', 'cpu']).optional(),
    dtype: z.enum(['q4', 'q8', 'fp32']).default('q4'),
  }),
  z.object({
    type: z.literal('GENERATE'),
    requestId: z.string(),
    prompt: z.string(),
    systemPrompt: z.string(),
    maxNewTokens: z.number().int().positive().default(512),
    temperature: z.number().positive().default(0.4),
  }),
  z.object({
    type: z.literal('ABORT'),
    requestId: z.string().optional(),
  }),
  z.object({
    type: z.literal('CHECK_STATUS'),
  }),
]);

export type WorkerRequest = z.infer<typeof workerRequestSchema>;

export const workerResponseSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('LOADING_PROGRESS'),
    status: z.enum(['initiate', 'downloading', 'progress', 'done', 'compiling', 'ready']),
    file: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    loadedBytes: z.number().nonnegative().optional(),
    totalBytes: z.number().nonnegative().optional(),
    message: z.string().optional(),
  }),
  z.object({
    type: z.literal('INIT_SUCCESS'),
    device: z.enum(['webgpu', 'wasm', 'cpu']),
    modelId: z.string(),
  }),
  z.object({
    type: z.literal('INIT_ERROR'),
    error: z.string(),
    fallbackAllowed: z.boolean().default(true),
    canRetryWasm: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('GENERATION_PROGRESS'),
    requestId: z.string(),
    generatedTokens: z.number().nonnegative().optional(),
  }),
  z.object({
    type: z.literal('GENERATION_SUCCESS'),
    requestId: z.string(),
    rawText: z.string(),
    durationMs: z.number().nonnegative(),
  }),
  z.object({
    type: z.literal('GENERATION_ERROR'),
    requestId: z.string(),
    error: z.string(),
  }),
]);

export type WorkerResponse = z.infer<typeof workerResponseSchema>;
