// Domain types for OutsideQuest AI

export type QuestDuration = 15 | 30 | 45 | 60;

export type QuestEnvironment =
  | 'park'
  | 'garden'
  | 'neighborhood'
  | 'campus'
  | 'other';

export type QuestMood =
  | 'curious'
  | 'calm'
  | 'energetic'
  | 'social';

export type QuestIntensity =
  | 'gentle'
  | 'moderate'
  | 'active';

export type QuestExperienceType =
  | 'solo'
  | 'friends'
  | 'family'
  | 'group';

export type QuestInterest =
  | 'birds'
  | 'plants'
  | 'photography'
  | 'walking'
  | 'mindfulness'
  | 'exploration';

export type SensoryFocus = 'sight' | 'sound' | 'touch' | 'smell' | 'curiosity';

export interface QuestStep {
  id: string;
  order: number;
  title: string;
  instruction: string;
  durationMinutes: number; // Must be positive and sum up to total quest duration
  observationPrompt?: string;
  sensoryFocus?: SensoryFocus;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export type QuestGenerationSource = 'curated-template' | 'on-device-model';

export interface QuestReflection {
  noticed: string;
  feltAfter: string;
  favoritePart: string;
  wouldRepeat: boolean;
  notes?: string;
  submittedAt: string;
}

export interface Quest {
  id: string;
  title: string;
  summary: string;
  durationMinutes: QuestDuration;
  theme: string;
  introduction: string;
  environment: QuestEnvironment;
  mood: QuestMood;
  intensity: QuestIntensity;
  experienceType: QuestExperienceType;
  interests: QuestInterest[];
  localContext?: string;
  accessibilityRequirements?: string;
  steps: QuestStep[];
  equipmentSuggestions: string[];
  safetyGuidance: string[];
  screenFreeReminder: string;
  reflectionQuestions: string[];
  generationSource: QuestGenerationSource;
  status: 'draft' | 'active' | 'completed' | 'abandoned';
  startedAt?: string;
  completedAt?: string;
  actualElapsedSeconds?: number;
  reflection?: QuestReflection;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSessionPersistedState {
  questId: string;
  startedAtTimestamp: number;
  elapsedPausedSeconds: number;
  isPaused: boolean;
  pausedAtTimestamp: number | null;
  currentStepIndex: number;
  stepsCompleted: Record<string, boolean>;
}

export interface AiModelStatus {
  state: 'idle' | 'checking' | 'standby' | 'ready' | 'downloading' | 'error' | 'unsupported';
  progress: number; // 0 to 100
  downloadedBytes?: number;
  totalBytes?: number;
  deviceBackend: 'webgpu' | 'wasm' | 'cpu';
  modelId: string;
  isModelCachedLocally: boolean;
  activeEngine: 'curated-fallback' | 'browser-slm';
  errorMessage?: string;
}

export interface UserSettings {
  id: 'current_user';
  hasAcceptedPrivacyNotice: boolean;
  preferredEnvironment: QuestEnvironment;
  preferredDuration: QuestDuration;
  soundEffectsEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  offlineStorageQuotaWarningDismissed: boolean;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}
