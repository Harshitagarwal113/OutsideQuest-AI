import {
  QuestEnvironment,
  QuestDuration,
  QuestMood,
  QuestIntensity,
  QuestExperienceType,
  QuestInterest,
  UserSettings,
} from '@/types';

export const APP_NAME = 'OutsideQuest AI';
export const APP_TAGLINE = 'Personalized outdoor micro-adventures powered by private, on-device AI.';

export const DB_NAME = 'outsidequest_local_db';
export const DB_VERSION = 2;
export const DB_STORES = {
  QUESTS: 'quests',
  SETTINGS: 'settings',
  ACHIEVEMENTS: 'achievements',
} as const;

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'current_user',
  hasAcceptedPrivacyNotice: true,
  preferredEnvironment: 'park',
  preferredDuration: 15,
  soundEffectsEnabled: false,
  hapticFeedbackEnabled: true,
  offlineStorageQuotaWarningDismissed: false,
  updatedAt: new Date().toISOString(),
};

export const DURATION_OPTIONS: Array<{
  value: QuestDuration;
  label: string;
  subtitle: string;
}> = [
  { value: 15, label: '15 Minutes', subtitle: 'Quick mental reset' },
  { value: 30, label: '30 Minutes', subtitle: 'Balanced exploration' },
  { value: 45, label: '45 Minutes', subtitle: 'Extended adventure' },
  { value: 60, label: '60 Minutes', subtitle: 'Deep nature immersion' },
];

export const ENVIRONMENT_OPTIONS: Array<{
  value: QuestEnvironment;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'park',
    label: 'Park',
    description: 'Public parks, community lawns, open recreation grounds',
    icon: 'Trees',
  },
  {
    value: 'garden',
    label: 'Garden',
    description: 'Botanical displays, flower beds, community allotments',
    icon: 'Flower2',
  },
  {
    value: 'neighborhood',
    label: 'Neighborhood',
    description: 'Tree-lined sidewalks, local blocks, quiet residential streets',
    icon: 'Home',
  },
  {
    value: 'campus',
    label: 'Campus',
    description: 'University quads, corporate grounds, school courtyards',
    icon: 'Building2',
  },
  {
    value: 'other',
    label: 'Somewhere Else',
    description: 'Waterfronts, forest trails, rooftops or mixed landscapes',
    icon: 'Compass',
  },
];

export const MOOD_OPTIONS: Array<{
  value: QuestMood;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'curious',
    label: 'Curious',
    description: 'Ready to notice small mysteries and hidden patterns',
    icon: 'Search',
  },
  {
    value: 'calm',
    label: 'Calm',
    description: 'Seeking restoration, gentle breathing and quiet space',
    icon: 'CloudSun',
  },
  {
    value: 'energetic',
    label: 'Energetic',
    description: 'Vigorous stride, brisk pacing and dynamic movement',
    icon: 'Zap',
  },
  {
    value: 'social',
    label: 'Social',
    description: 'Interactive observations and shared discoveries',
    icon: 'Users',
  },
];

export const INTENSITY_OPTIONS: Array<{
  value: QuestIntensity;
  label: string;
  description: string;
}> = [
  {
    value: 'gentle',
    label: 'Gentle',
    description: 'Easy stroll, accessible pace, frequent resting spots',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Steady walking pace with active sensory engagement',
  },
  {
    value: 'active',
    label: 'Active',
    description: 'Brisk stride, elevation changes or agility challenges',
  },
];

export const EXPERIENCE_TYPE_OPTIONS: Array<{
  value: QuestExperienceType;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'solo',
    label: 'Solo',
    description: 'Individual contemplative focus away from digital notifications',
    icon: 'User',
  },
  {
    value: 'friends',
    label: 'Friends',
    description: 'Shared exploration with friendly observation prompts',
    icon: 'Users',
  },
  {
    value: 'family',
    label: 'Family',
    description: 'Engaging discoveries suitable for all generations',
    icon: 'Smile',
  },
  {
    value: 'group',
    label: 'Group',
    description: 'Coordinated trail moments and collective check-ins',
    icon: 'HeartHandshake',
  },
];

export const INTEREST_OPTIONS: Array<{
  value: QuestInterest;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'birds',
    label: 'Birds',
    description: 'Perches, song calls, wing patterns, foraging behavior',
    icon: 'Feather',
  },
  {
    value: 'plants',
    label: 'Plants',
    description: 'Bark textures, leaf veins, seed pods, wild flora',
    icon: 'Leaf',
  },
  {
    value: 'photography',
    label: 'Photography',
    description: 'Natural light framing, organic shadows, micro textures',
    icon: 'Camera',
  },
  {
    value: 'walking',
    label: 'Walking',
    description: 'Rhythmic steps, cadence changes, trail pathways',
    icon: 'Footprints',
  },
  {
    value: 'mindfulness',
    label: 'Mindfulness',
    description: 'Sensory grounding, fresh air inhalations, stillness',
    icon: 'Wind',
  },
  {
    value: 'exploration',
    label: 'Exploration',
    description: 'Unfamiliar path choices, spatial landmarks, architecture',
    icon: 'Compass',
  },
];

export const RECOMMENDED_AI_MODEL = {
  id: 'onnx-community/gemma-3-270m-it-ONNX',
  displayName: 'Google Gemma 3 (270M Instruct)',
  approxDownloadMb: 200,
  sizeEstimate: '~200 MB',
  description: 'Ultra-lightweight Google Gemma instruction model optimized for on-device browser execution via WebGPU/WASM.',
};

export const SCREEN_FREE_REMINDER = 'Phone away. Adventure on.';

export const GENERAL_SAFETY_GUIDANCE: string[] = [
  'Stay on designated public pathways and respect private property boundaries.',
  'Observe all wildlife from a respectful distance; never approach or touch unknown animals.',
  'Do not harvest, touch, or ingest wild plants, berries, or fungi.',
  'Remain aware of your footing, vehicular traffic, and changing weather conditions.',
  'If physical conditions feel unsafe, modify or end your mission immediately.',
];

export const STANDARD_EQUIPMENT_SUGGESTIONS: string[] = [
  'Comfortable walking shoes with steady traction',
  'Water bottle for hydration',
  'Weather-appropriate jacket or layers',
  'Optional pocket notebook or pencil for field sketches',
];
