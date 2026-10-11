import type { Quest } from '@/types';

export interface HistoryFilter {
  environment?: string;
  status?: Quest['status'];
}

export type { Quest };
