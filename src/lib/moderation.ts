const BLOCKED_ARTISTS = [
  'taylor swift',
  'beyonce',
  'drake',
  'ed sheeran',
  'ariana grande',
  'the weeknd',
  'billie eilish',
  'post malone',
  'justin bieber',
  'rihanna',
  'kanye west',
  'eminem',
  'adele',
  'lady gaga',
  'bruno mars',
];

const BLOCKED_PHRASES = [
  'in the style of',
  'sounds like',
  'similar to',
  'copy',
  'clone',
  'imitate',
];

const HATE_SPEECH_PATTERNS = [
  /\b(hate|kill|destroy)\s+(jews|muslims|christians|blacks|whites|asians)\b/i,
  /\b(terrorist|terrorism)\b/i,
  /\b(nazi|hitler|holocaust\s+denial)\b/i,
];

const EXPLICIT_CONTENT_PATTERNS = [
  /\b(fuck|shit|bitch|ass|damn|hell)\b/i,
];

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

export function moderatePrompt(prompt: string): ModerationResult {
  const lowerPrompt = prompt.toLowerCase();

  for (const artist of BLOCKED_ARTISTS) {
    if (lowerPrompt.includes(artist)) {
      return {
        allowed: false,
        reason: `Artist-style prompts are not allowed. Cannot reference "${artist}".`,
        severity: 'high',
      };
    }
  }

  for (const phrase of BLOCKED_PHRASES) {
    if (lowerPrompt.includes(phrase)) {
      return {
        allowed: false,
        reason: `Style imitation phrases are not allowed: "${phrase}".`,
        severity: 'high',
      };
    }
  }

  for (const pattern of HATE_SPEECH_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        allowed: false,
        reason: 'Content contains prohibited hate speech or harmful language.',
        severity: 'high',
      };
    }
  }

  return { allowed: true };
}

export function moderateLyrics(
  lyrics: string,
  allowExplicit: boolean = false
): ModerationResult {
  const hateSpeechCheck = moderatePrompt(lyrics);
  if (!hateSpeechCheck.allowed) {
    return hateSpeechCheck;
  }

  if (!allowExplicit) {
    for (const pattern of EXPLICIT_CONTENT_PATTERNS) {
      if (pattern.test(lyrics)) {
        return {
          allowed: false,
          reason: 'Lyrics contain explicit language. Please modify or enable explicit content.',
          severity: 'low',
        };
      }
    }
  }

  return { allowed: true };
}

export function moderateBrief(brief: {
  genre?: string;
  mood?: string;
  lyrics?: string;
  title?: string;
}): ModerationResult {
  const combinedText = [brief.genre, brief.mood, brief.title].filter(Boolean).join(' ');

  const promptCheck = moderatePrompt(combinedText);
  if (!promptCheck.allowed) {
    return promptCheck;
  }

  if (brief.lyrics) {
    const lyricsCheck = moderateLyrics(brief.lyrics);
    if (!lyricsCheck.allowed) {
      return lyricsCheck;
    }
  }

  return { allowed: true };
}
