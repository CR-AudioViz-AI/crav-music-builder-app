import type { TrackType, Vocals } from './types';

export interface PricingConfig {
  previewCredits: number;
  baseCredits: number;
  wavUpcharge: number;
  stemsUpcharge: number;
}

export const PRICING: Record<TrackType, PricingConfig> = {
  SONG: {
    previewCredits: 0,
    baseCredits: 8,
    wavUpcharge: 4,
    stemsUpcharge: 6,
  },
  INSTRUMENTAL: {
    previewCredits: 0,
    baseCredits: 4,
    wavUpcharge: 2,
    stemsUpcharge: 4,
  },
  JINGLE: {
    previewCredits: 0,
    baseCredits: 2,
    wavUpcharge: 1,
    stemsUpcharge: 2,
  },
};

export const DURATION_MULTIPLIERS: Record<number, number> = {
  15: 0.25,
  30: 0.5,
  60: 0.75,
  180: 1.0,
};

export function calculateCredits(
  type: TrackType,
  durationSec: number,
  includeWav: boolean = false,
  includeStems: boolean = false
): number {
  const config = PRICING[type];
  let credits = config.baseCredits;

  const multiplier =
    DURATION_MULTIPLIERS[durationSec] ||
    Math.max(0.25, Math.min(2.0, durationSec / 180));

  credits = Math.ceil(credits * multiplier);

  if (includeWav) {
    credits += config.wavUpcharge;
  }

  if (includeStems) {
    credits += config.stemsUpcharge;
  }

  return credits;
}

export function selectProvider(type: TrackType, vocals: Vocals): string {
  const standaloneMode = import.meta.env.VITE_STANDALONE_MODE === '1';
  const elevenEnabled = import.meta.env.VITE_ELEVEN_MUSIC_ENABLED === '1';

  if (type === 'SONG' && vocals !== 'NONE') {
    if (elevenEnabled) {
      return 'eleven';
    }
    throw new Error('Vocal songs require Eleven Music API (not yet enabled)');
  }

  if (standaloneMode && vocals === 'NONE') {
    return 'musicgen';
  }

  if (type === 'JINGLE') {
    return 'beatoven';
  }

  return 'loudly';
}

export const CREDIT_BUNDLES = [
  { name: 'Starter', credits: 100, price: 999, popular: false },
  { name: 'Pro', credits: 500, price: 3999, popular: true },
  { name: 'Team', credits: 2000, price: 12999, popular: false },
];
