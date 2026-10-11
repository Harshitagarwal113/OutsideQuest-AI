import { z } from 'zod';

export const questParamsSchema = z.object({
  durationMinutes: z.union([
    z.literal(15),
    z.literal(30),
    z.literal(45),
    z.literal(60),
  ]),
  environment: z.enum([
    'park',
    'garden',
    'neighborhood',
    'campus',
    'other',
  ]),
  mood: z.enum([
    'curious',
    'calm',
    'energetic',
    'social',
  ]),
  intensity: z.enum([
    'gentle',
    'moderate',
    'active',
  ]),
  experienceType: z.enum([
    'solo',
    'friends',
    'family',
    'group',
  ]),
  interests: z
    .array(
      z.enum([
        'birds',
        'plants',
        'photography',
        'walking',
        'mindfulness',
        'exploration',
      ])
    )
    .min(1, 'Select at least one interest to personalize your trail'),
  localContext: z
    .string()
    .max(300, 'Keep local context under 300 characters')
    .optional()
    .or(z.literal('')),
  accessibilityRequirements: z
    .string()
    .max(300, 'Keep accessibility notes under 300 characters')
    .optional()
    .or(z.literal('')),
});

export type QuestParams = z.infer<typeof questParamsSchema>;
