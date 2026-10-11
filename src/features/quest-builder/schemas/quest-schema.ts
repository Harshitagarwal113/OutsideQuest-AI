import { z } from 'zod';

export const questStepSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().positive(),
  title: z.string().min(2),
  instruction: z.string().min(5),
  durationMinutes: z.number().positive('Each step duration must be a positive number'),
  observationPrompt: z.string().optional(),
  sensoryFocus: z.enum(['sight', 'sound', 'touch', 'smell', 'curiosity']).optional(),
  isCompleted: z.boolean(),
  completedAt: z.string().datetime({ offset: true }).optional().or(z.string().datetime()),
  notes: z.string().optional(),
});

export const questReflectionSchema = z.object({
  noticed: z.string().min(1, 'Please note at least one observation'),
  feltAfter: z.string().min(1, 'Please describe how you felt afterward'),
  favoritePart: z.string().min(1, 'Please share your favorite part'),
  wouldRepeat: z.boolean(),
  notes: z.string().optional(),
  submittedAt: z.string(),
});

export const questSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(3),
    summary: z.string().min(10),
    durationMinutes: z.union([
      z.literal(15),
      z.literal(30),
      z.literal(45),
      z.literal(60),
    ]),
    theme: z.string().min(2),
    introduction: z.string().min(10),
    environment: z.enum(['park', 'garden', 'neighborhood', 'campus', 'other']),
    mood: z.enum(['curious', 'calm', 'energetic', 'social']),
    intensity: z.enum(['gentle', 'moderate', 'active']),
    experienceType: z.enum(['solo', 'friends', 'family', 'group']),
    interests: z.array(
      z.enum([
        'birds',
        'plants',
        'photography',
        'walking',
        'mindfulness',
        'exploration',
      ])
    ).min(1),
    localContext: z.string().optional(),
    accessibilityRequirements: z.string().optional(),
    steps: z
      .array(questStepSchema)
      .min(3, 'Quests must have between 3 and 5 actionable steps')
      .max(5, 'Quests must have between 3 and 5 actionable steps'),
    equipmentSuggestions: z.array(z.string()).min(1),
    safetyGuidance: z.array(z.string()).min(1),
    screenFreeReminder: z.string().min(5),
    reflectionQuestions: z.array(z.string()).min(2),
    generationSource: z.enum(['curated-template', 'on-device-model']),
    status: z.enum(['draft', 'active', 'completed', 'abandoned']),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    actualElapsedSeconds: z.number().nonnegative().optional(),
    reflection: questReflectionSchema.optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine((data, ctx) => {
    // Verify that all step durations sum up to the total requested duration within 0.5 min tolerance
    const totalStepDuration = data.steps.reduce((sum, s) => sum + s.durationMinutes, 0);
    const difference = Math.abs(totalStepDuration - data.durationMinutes);
    if (difference > 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Sum of step durations (${totalStepDuration}m) must equal total duration (${data.durationMinutes}m) within a 0.5m tolerance`,
        path: ['steps'],
      });
    }

    // Verify all steps have strictly positive durations
    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      if (step && step.durationMinutes <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Step ${i + 1} duration must be strictly positive`,
          path: ['steps', i, 'durationMinutes'],
        });
      }
    }
  });

export type ValidatedQuest = z.infer<typeof questSchema>;
