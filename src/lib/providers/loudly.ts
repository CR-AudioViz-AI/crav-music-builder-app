import ky from 'ky';
import type { MusicProvider, Brief } from '../types';

const BASE = import.meta.env.VITE_LOUDLY_BASE_URL || 'https://api.loudly.com/v1';
const KEY = import.meta.env.VITE_LOUDLY_API_KEY || '';

export const loudlyProvider: MusicProvider = {
  async generatePreview(brief: Brief) {
    if (!KEY) {
      throw new Error('Loudly API key not configured');
    }

    const body = {
      prompt: `${brief.genre} ${brief.mood || ''} instrumental`,
      duration: Math.min(brief.durationSec, 30),
      exact: true,
    };

    const resp = await ky
      .post(`${BASE}/generate`, {
        json: body,
        headers: { Authorization: `Bearer ${KEY}` },
      })
      .json<any>();

    return { taskId: resp.taskId };
  },

  async poll(taskId: string) {
    if (!KEY) {
      throw new Error('Loudly API key not configured');
    }

    const r = await ky
      .get(`${BASE}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${KEY}` },
      })
      .json<any>();

    if (r.state === 'done') {
      return { state: 'done' as const, previewUrl: r.previewUrl, meta: r };
    }
    if (r.state === 'failed') {
      return { state: 'failed' as const };
    }
    return { state: 'running' as const };
  },

  async generateFull(brief: Brief, seedMeta?: any) {
    if (!KEY) {
      throw new Error('Loudly API key not configured');
    }

    const body = {
      prompt: `${brief.genre} ${brief.mood || ''} instrumental`,
      duration: brief.durationSec,
      exact: true,
      seed: seedMeta?.seed,
    };

    const resp = await ky
      .post(`${BASE}/generate`, {
        json: body,
        headers: { Authorization: `Bearer ${KEY}` },
      })
      .json<any>();

    return { taskId: resp.taskId };
  },

  async fetchAsset(taskId: string) {
    if (!KEY) {
      throw new Error('Loudly API key not configured');
    }

    const r = await ky
      .get(`${BASE}/assets/${taskId}`, {
        headers: { Authorization: `Bearer ${KEY}` },
      })
      .json<any>();

    return { url: r.fullUrl, stems: r.stems };
  },
};
