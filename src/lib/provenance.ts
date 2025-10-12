import type { Brief } from './types';

export function generatePromptHash(brief: Brief): string {
  const promptString = JSON.stringify({
    genre: brief.genre,
    mood: brief.mood,
    tempo: brief.tempo,
    lyrics: brief.lyrics,
    structure: brief.structure,
    vocals: brief.vocals,
    language: brief.language,
  });

  return hashString(promptString);
}

async function hashString(str: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  return simpleHash(str);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export function generateLicenseMetadata(
  trackId: string,
  brief: Brief,
  provider: string,
  providerTaskId: string,
  promptHash: string
): any {
  return {
    version: '1.0',
    trackId,
    provider,
    providerTaskId,
    promptHash,
    generatedAt: new Date().toISOString(),
    brief: {
      genre: brief.genre,
      mood: brief.mood,
      duration: brief.durationSec,
      vocals: brief.vocals,
      language: brief.language,
    },
    license: {
      type: 'commercial',
      terms: 'Full commercial rights granted to purchaser',
      restrictions: 'Cannot resell as music library content or AI training data',
      attribution: 'Attribution not required but appreciated',
    },
    provenance: {
      model: provider,
      taskId: providerTaskId,
      contentHash: promptHash,
      watermark: 'embedded',
    },
  };
}
