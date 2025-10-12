import { moderateBrief, moderatePrompt, moderateLyrics } from './moderation';
import { calculateCredits, selectProvider } from './pricing';
import type { Brief } from './types';

export interface SmokeTestResult {
  test: string;
  passed: boolean;
  message?: string;
  expected?: any;
  actual?: any;
}

export async function runSmokeTests(): Promise<SmokeTestResult[]> {
  const results: SmokeTestResult[] = [];

  results.push(testGuardrailArtistStyle());
  results.push(testGuardrailProfanity());
  results.push(testGuardrailCopyrightedArtist());
  results.push(testPricingJingle15s());
  results.push(testPricingJingle30s());
  results.push(testPricingInstrumental180s());
  results.push(testPricingSongWithVocals());
  results.push(testProviderSelectionInstrumental());
  results.push(testProviderSelectionJingle());
  results.push(testProviderSelectionSongVocals());
  results.push(testValidBriefAccepted());

  return results;
}

function testGuardrailArtistStyle(): SmokeTestResult {
  const result = moderatePrompt('Make it sound like Taylor Swift');
  return {
    test: 'Guardrail: Blocks "in the style of" prompts',
    passed: !result.allowed,
    message: result.reason,
    expected: 'blocked',
    actual: result.allowed ? 'allowed' : 'blocked',
  };
}

function testGuardrailProfanity(): SmokeTestResult {
  const result = moderateLyrics('This is a fucking song', false);
  return {
    test: 'Guardrail: Blocks profanity when explicit disabled',
    passed: !result.allowed,
    message: result.reason,
    expected: 'blocked',
    actual: result.allowed ? 'allowed' : 'blocked',
  };
}

function testGuardrailCopyrightedArtist(): SmokeTestResult {
  const result = moderatePrompt('Create a song featuring Drake');
  return {
    test: 'Guardrail: Blocks copyrighted artist names',
    passed: !result.allowed,
    message: result.reason,
    expected: 'blocked',
    actual: result.allowed ? 'allowed' : 'blocked',
  };
}

function testPricingJingle15s(): SmokeTestResult {
  const credits = calculateCredits('JINGLE', 15, false, false);
  const passed = credits === 1;
  return {
    test: 'Pricing: 15s jingle costs 1 credit (2 * 0.25 multiplier, rounded up)',
    passed,
    expected: 1,
    actual: credits,
  };
}

function testPricingJingle30s(): SmokeTestResult {
  const credits = calculateCredits('JINGLE', 30, false, false);
  const passed = credits === 1;
  return {
    test: 'Pricing: 30s jingle costs 1 credit (2 * 0.5 multiplier)',
    passed,
    expected: 1,
    actual: credits,
  };
}

function testPricingInstrumental180s(): SmokeTestResult {
  const credits = calculateCredits('INSTRUMENTAL', 180, false, false);
  const passed = credits === 4;
  return {
    test: 'Pricing: 3min instrumental costs 4 credits',
    passed,
    expected: 4,
    actual: credits,
  };
}

function testPricingSongWithVocals(): SmokeTestResult {
  const credits = calculateCredits('SONG', 180, false, false);
  const passed = credits === 8;
  return {
    test: 'Pricing: 3min song with vocals costs 8 credits',
    passed,
    expected: 8,
    actual: credits,
  };
}

function testProviderSelectionInstrumental(): SmokeTestResult {
  const provider = selectProvider('INSTRUMENTAL', 'NONE');
  const passed = provider === 'loudly';
  return {
    test: 'Provider: Instrumental with no vocals routes to Loudly',
    passed,
    expected: 'loudly',
    actual: provider,
  };
}

function testProviderSelectionJingle(): SmokeTestResult {
  const provider = selectProvider('JINGLE', 'NONE');
  const passed = provider === 'beatoven';
  return {
    test: 'Provider: Jingle routes to Beatoven',
    passed,
    expected: 'beatoven',
    actual: provider,
  };
}

function testProviderSelectionSongVocals(): SmokeTestResult {
  const provider = selectProvider('SONG', 'MALE');
  const passed = provider === 'eleven';
  return {
    test: 'Provider: Song with vocals routes to Eleven Music',
    passed,
    expected: 'eleven',
    actual: provider,
  };
}

function testValidBriefAccepted(): SmokeTestResult {
  const brief: Brief = {
    title: 'Upbeat Country Jingle',
    genre: 'Country',
    mood: 'upbeat',
    durationSec: 30,
    vocals: 'NONE',
    language: 'en',
  };

  const result = moderateBrief(brief);
  return {
    test: 'Valid brief: Clean prompt is accepted',
    passed: result.allowed,
    message: result.reason,
    expected: 'allowed',
    actual: result.allowed ? 'allowed' : 'blocked',
  };
}

export function generateTestPrompts() {
  return {
    validJingle30s: {
      type: 'JINGLE',
      brief: {
        title: 'Ad-Safe Jingle',
        genre: 'Country',
        mood: 'upbeat',
        durationSec: 30,
        vocals: 'NONE',
        language: 'en',
      },
    },
    validInstrumental60s: {
      type: 'INSTRUMENTAL',
      brief: {
        title: 'Cinematic Background',
        genre: 'Classical',
        mood: 'inspiring',
        durationSec: 60,
        vocals: 'NONE',
        language: 'en',
      },
    },
    blockedArtistStyle: {
      type: 'INSTRUMENTAL',
      brief: {
        genre: 'Pop',
        mood: 'in the style of Ariana Grande',
        durationSec: 30,
        vocals: 'NONE',
      },
    },
    blockedProfanity: {
      type: 'SONG',
      brief: {
        genre: 'Rock',
        mood: 'angry',
        durationSec: 30,
        vocals: 'MALE',
        lyrics: 'This song has fucking profanity in it',
      },
    },
  };
}
