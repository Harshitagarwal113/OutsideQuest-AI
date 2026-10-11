import type { AiModelStatus } from '@/types';

export type { AiModelStatus };

export interface HardwareCapabilities {
  deviceBackend: 'webgpu' | 'wasm' | 'cpu';
  webGpuSupported: boolean;
  threadsSupported: boolean;
  estimatedMemoryMb?: number;
}
