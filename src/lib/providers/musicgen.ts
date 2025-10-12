import type { MusicProvider, Brief } from '../types';

const STANDALONE_MODE = import.meta.env.VITE_STANDALONE_MODE === '1';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const musicgenProvider: MusicProvider = {
  async generatePreview(brief: Brief) {
    if (!STANDALONE_MODE) {
      throw new Error('MusicGen provider requires standalone mode');
    }

    const response = await fetch(`${API_BASE}/musicgen/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: buildPrompt(brief),
        duration: Math.min(brief.durationSec, 30),
        mode: 'preview',
      }),
    });

    if (!response.ok) {
      throw new Error(`MusicGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { taskId: data.jobId };
  },

  async poll(taskId: string) {
    const response = await fetch(`${API_BASE}/musicgen/status/${taskId}`);

    if (!response.ok) {
      return { state: 'failed' as const };
    }

    const data = await response.json();

    if (data.state === 'done') {
      return { state: 'done' as const, previewUrl: data.previewUrl, meta: data };
    }

    if (data.state === 'failed') {
      return { state: 'failed' as const };
    }

    return { state: 'running' as const };
  },

  async generateFull(brief: Brief, seedMeta?: any) {
    const response = await fetch(`${API_BASE}/musicgen/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: buildPrompt(brief),
        duration: brief.durationSec,
        mode: 'full',
        seed: seedMeta?.seed,
      }),
    });

    if (!response.ok) {
      throw new Error(`MusicGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { taskId: data.jobId };
  },

  async fetchAsset(taskId: string) {
    const response = await fetch(`${API_BASE}/musicgen/asset/${taskId}`);

    if (!response.ok) {
      throw new Error('Asset not ready or not found');
    }

    const data = await response.json();
    return {
      url: data.downloadUrl,
      stems: data.stemsUrls,
      license: data.license,
    };
  },
};

function buildPrompt(brief: Brief): string {
  const parts: string[] = [];

  parts.push(brief.genre);

  if (brief.mood) {
    parts.push(brief.mood);
  }

  if (brief.tempo) {
    parts.push(`${brief.tempo} BPM`);
  }

  parts.push('instrumental');

  if (brief.structure && brief.structure.length > 0) {
    const structure = brief.structure.map((s) => s.name).join(', ');
    parts.push(`with structure: ${structure}`);
  }

  return parts.join(', ');
}
