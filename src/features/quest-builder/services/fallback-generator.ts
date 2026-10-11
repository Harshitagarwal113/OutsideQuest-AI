import type { QuestGenerator } from './quest-generator.interface';
import type { QuestParams } from '../schemas/quest-params';
import { questSchema } from '../schemas/quest-schema';
import type { Quest, QuestStep, QuestDuration, SensoryFocus } from '@/types';
import { generateId } from '@/lib/utils';
import {
  SCREEN_FREE_REMINDER,
  GENERAL_SAFETY_GUIDANCE,
  STANDARD_EQUIPMENT_SUGGESTIONS,
} from '@/lib/constants';

interface TemplateMilestone {
  title: string;
  instruction: string;
  observationPrompt?: string;
  sensoryFocus: SensoryFocus;
}

export class CuratedFallbackGenerator implements QuestGenerator {
  /**
   * Distributes positive step durations so they exactly sum to total duration.
   */
  private computeStepDurations(duration: QuestDuration, stepCount: number): number[] {
    switch (duration) {
      case 15:
        return [5, 5, 5]; // 3 steps = 15m
      case 30:
        return [7, 8, 8, 7]; // 4 steps = 30m
      case 45:
        return [11, 12, 12, 10]; // 4 steps = 45m
      case 60:
      default:
        return [12, 12, 12, 12, 12]; // 5 steps = 60m
    }
  }

  /**
   * Builds curated milestones matching user environment, mood, and selected interests.
   */
  private selectMilestones(params: QuestParams): TemplateMilestone[] {
    const primaryInterest = params.interests[0] || 'mindfulness';

    const milestonesByInterest: Record<string, TemplateMilestone[]> = {
      birds: [
        {
          title: 'Acoustic Bird Call Detection',
          instruction: 'Stop under open sky. Close your eyes for 60 seconds and locate at least two distinct avian songs or chatter calls.',
          observationPrompt: 'Notice whether the bird call comes from high canopy, brush foliage, or utility wires.',
          sensoryFocus: 'sound',
        },
        {
          title: 'Flight Silhouette & Perch Scan',
          instruction: 'Observe tree perches and rooftops. Watch how birds alight and interact without disturbing them.',
          observationPrompt: 'Look for wing rhythm: gliding, undulating flapping, or quick darting.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Foraging Ground Trail',
          instruction: 'Scan grassy patches or fallen leaves for birds searching for seeds, insects, or earthworms.',
          observationPrompt: 'Observe their ground movement: hopping versus walking strides.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Canopy Shelter Mapping',
          instruction: 'Identify dense shrubbery or tree crowns where small birds take refuge from wind or traffic.',
          observationPrompt: 'Notice how micro-habitats protect smaller creatures in urban and suburban landscapes.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Feather & Nest Material Search',
          instruction: 'Look near path edges for fallen plumes, twigs, or natural grasses used in seasonal nest construction.',
          observationPrompt: 'Admire the architectural ingenuity of nature without touching or disturbing active nests.',
          sensoryFocus: 'curiosity',
        },
      ],
      plants: [
        {
          title: 'Bark Texture & Lichen Study',
          instruction: 'Approach a mature tree along your path. Run your fingertips gently along its bark ridges and lichens.',
          observationPrompt: 'Feel the difference between sun-warmed southern exposure bark and shadowed northern bark.',
          sensoryFocus: 'touch',
        },
        {
          title: 'Leaf Geometry & Venation',
          instruction: 'Find three distinct fallen leaves. Examine the intricate branching veins held up against natural light.',
          observationPrompt: 'Trace how fluid channels nourish the leaf tissue from stem to tip.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Aromatic Plant Rub',
          instruction: 'Gently crush a fallen needle or leaf between fingers. Inhale the clean botanical aroma released.',
          observationPrompt: 'Identify aromatic notes: cedar, eucalyptus, earthy humus, or sweet pollen.',
          sensoryFocus: 'smell',
        },
        {
          title: 'Micro-Flora in Pavement Cracks',
          instruction: 'Look down where stone or asphalt meets earth. Spot hardy wild moss, clover, or plantain pushing through.',
          observationPrompt: 'Reflect on botanical resilience thriving in harsh built environments.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Canopy Light Filtration',
          instruction: 'Pause directly beneath a leafy branch and look up into the dappled sunlight.',
          observationPrompt: 'Observe the pattern of chlorophyll capturing solar rays overhead.',
          sensoryFocus: 'sight',
        },
      ],
      photography: [
        {
          title: 'Natural Framing Composition',
          instruction: 'Frame a natural subject (a blossom, branch, or stone) using overarching branches or silhouettes as borders.',
          observationPrompt: 'Look for organic symmetry and depth of field in natural light.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Shadow Geometry & Texture Contrast',
          instruction: 'Locate contrasting shadows cast across soil, grass, or stone pathways by the prevailing sun angle.',
          observationPrompt: 'Notice how the texture changes as light shifts across rough surfaces.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Macro Pattern Hunt',
          instruction: 'Find an organic repeating pattern: pinecone spirals, fern fronds, or cracked mud patterns.',
          observationPrompt: 'Contemplate mathematical Fibonacci ratios occurring naturally in flora.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Reflective Surface Reflection',
          instruction: 'Spot moisture, puddle ripples, or polished river rocks that mirror the sky above.',
          observationPrompt: 'Capture how moving air distorts light reflections on water.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Color Gradient Transitions',
          instruction: 'Find seasonal leaves or petals showing a natural transition between green, amber, gold, or crimson.',
          observationPrompt: 'Trace the gradual cellular breakdown of chlorophyll.',
          sensoryFocus: 'sight',
        },
      ],
      walking: [
        {
          title: 'Cadence & Footstep Feedback',
          instruction: 'Walk 100 paces in deliberate silence. Focus on the physical transition from hard sidewalk to gravel or grass.',
          observationPrompt: 'Notice how your knees and posture adjust naturally to changing terrain.',
          sensoryFocus: 'touch',
        },
        {
          title: 'Stride Variation Interval',
          instruction: 'Alternate between 45 seconds of energetic power walking and 45 seconds of slow, mindful strolling.',
          observationPrompt: 'Feel the rhythm of your cardiovascular pulse adjusting to terrain.',
          sensoryFocus: 'touch',
        },
        {
          title: 'Peripheral Horizon Gaze',
          instruction: 'While walking, soften your central focus to take in a wide 180-degree peripheral field of vision.',
          observationPrompt: 'Notice movements of branches, clouds, and birds at the outer edges of your gaze.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Incline & Core Balance',
          instruction: 'Navigate a gentle rise, grassy mound, or park incline with an upright, grounded posture.',
          observationPrompt: 'Feel gravitational resistance activating your leg and core muscles.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Cool-Down Stride Alignment',
          instruction: 'Ease into a gentle, restorative walking pace for your final stretch.',
          observationPrompt: 'Take long, smooth breaths in synchronization with your step cadence.',
          sensoryFocus: 'touch',
        },
      ],
      mindfulness: [
        {
          title: 'Threshold Grounding Pause',
          instruction: 'Stand motionless for two full minutes with feet planted firmly on the earth. Inhale clean outdoor air deeply.',
          observationPrompt: 'Let the mental momentum of screen tasks dissolve with each exhale.',
          sensoryFocus: 'touch',
        },
        {
          title: 'Thermal & Wind Mapping',
          instruction: 'Turn in a slow circle. Identify the exact direction and coolness of the breeze on your face and neck.',
          observationPrompt: 'Feel the subtle temperature variations between direct sunlight and tree canopy shade.',
          sensoryFocus: 'touch',
        },
        {
          title: 'Acoustic Sphere Expansion',
          instruction: 'Close your eyes. Listen first to your breath, then sounds within 10 paces, then the furthest natural sound.',
          observationPrompt: 'Notice how your auditory awareness expands into the landscape.',
          sensoryFocus: 'sound',
        },
        {
          title: 'Dappled Sunlight Contemplation',
          instruction: 'Find a comfortable resting spot or bench. Gaze into moving canopy shadows for three peaceful minutes.',
          observationPrompt: 'Observe thoughts passing across your mind like wind blowing through branches.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Grateful Sensory Return',
          instruction: 'Place one hand on your chest and take three long, steady breaths before completing your trail.',
          observationPrompt: 'Acknowledge the physical renewal of stepping into living nature.',
          sensoryFocus: 'touch',
        },
      ],
      exploration: [
        {
          title: 'The Unchosen Path Choice',
          instruction: 'At the next path fork, intentionally choose the trail or sidewalk you travel least often.',
          observationPrompt: 'Notice unfamiliar architectural details, older trees, or hidden pocket gardens.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Micro-Landmark Navigation',
          instruction: 'Pick an prominent natural landmark 200 meters ahead (a tall oak, granite boulder, or garden gate) and walk toward it.',
          observationPrompt: 'Navigate without consulting a smartphone map or screen display.',
          sensoryFocus: 'sight',
        },
        {
          title: 'Ecology Detective Clue',
          instruction: 'Find evidence of seasonal change: ripening berries, decomposing logs, or animal seed caches.',
          observationPrompt: 'Decipher how this living space evolves across the calendar year.',
          sensoryFocus: 'curiosity',
        },
        {
          title: 'Boundary Line Transition',
          instruction: 'Cross from a paved, manicured area into a more wild, unmanaged patch of nature.',
          observationPrompt: 'Feel the shift in ambient temperature, moisture, and ground firmness.',
          sensoryFocus: 'touch',
        },
        {
          title: 'Summit / Open Vantage Point',
          instruction: 'Ascend to the highest accessible open vantage point nearby and survey the surrounding neighborhood.',
          observationPrompt: 'Gain spatial perspective on how human settlements coexist with natural geography.',
          sensoryFocus: 'sight',
        },
      ],
    };

    return milestonesByInterest[primaryInterest] || milestonesByInterest['mindfulness']!;
  }

  public async generate(params: QuestParams): Promise<Quest> {
    const rawMilestones = this.selectMilestones(params);
    const durations = this.computeStepDurations(params.durationMinutes, rawMilestones.length);
    const stepCount = durations.length;

    // Build steps with strictly positive durations summing to params.durationMinutes
    const steps: QuestStep[] = [];
    for (let i = 0; i < stepCount; i++) {
      const milestone = rawMilestones[i % rawMilestones.length]!;
      const stepDuration = durations[i]!;

      // Adapt step if accessibility requirements are specified
      let instruction = milestone.instruction;
      if (params.accessibilityRequirements && params.accessibilityRequirements.trim().length > 0) {
        instruction += ` (Adapted for your needs: choose smooth, step-free path routes and pause at resting benches as needed.)`;
      }

      steps.push({
        id: generateId('step'),
        order: i + 1,
        title: milestone.title,
        instruction,
        durationMinutes: stepDuration,
        observationPrompt: milestone.observationPrompt,
        sensoryFocus: milestone.sensoryFocus,
        isCompleted: false,
      });
    }

    // Adapt introduction and title to context
    const envLabel = params.environment === 'other' ? 'Outdoor Landscape' : params.environment;
    const moodTitleMap: Record<string, string> = {
      curious: 'Curiosity Trail',
      calm: 'Quiet Haven Journey',
      energetic: 'Dynamic Movement Trek',
      social: 'Shared Discovery Walk',
    };

    const title = `${moodTitleMap[params.mood] || 'Nature Venture'} in the ${envLabel}`;
    let introduction = `A restorative ${params.durationMinutes}-minute outdoor journey crafted to awaken your senses in your ${envLabel}.`;
    if (params.localContext && params.localContext.trim().length > 0) {
      introduction += ` Tailored for your surroundings: "${params.localContext.trim()}".`;
    }

    const summary = `Step away from screens for ${params.durationMinutes} minutes of mindful exploration with an emphasis on ${params.interests.join(', ')}.`;

    const now = new Date().toISOString();

    const questData: Quest = {
      id: generateId('quest'),
      title,
      summary,
      durationMinutes: params.durationMinutes,
      theme: `${params.mood.toUpperCase()} • ${params.interests.slice(0, 2).join(' & ').toUpperCase()}`,
      introduction,
      environment: params.environment,
      mood: params.mood,
      intensity: params.intensity,
      experienceType: params.experienceType,
      interests: params.interests,
      localContext: params.localContext,
      accessibilityRequirements: params.accessibilityRequirements,
      steps,
      equipmentSuggestions: [
        ...STANDARD_EQUIPMENT_SUGGESTIONS,
        params.interests.includes('photography') ? 'Camera or smartphone in airplane mode' : 'Pocket magnifier or sketchpad',
      ],
      safetyGuidance: [...GENERAL_SAFETY_GUIDANCE],
      screenFreeReminder: SCREEN_FREE_REMINDER,
      reflectionQuestions: [
        'What natural sound or scent was most distinct while walking?',
        'How did your mental focus or stress levels shift once away from your screen?',
        'What is one living detail you walked past today that you had never noticed before?',
        'Would you explore this route again at a different time of day or season?',
      ],
      generationSource: 'curated-template',
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    // Strict validation against Zod schema to guarantee contract integrity
    return questSchema.parse(questData);
  }
}
