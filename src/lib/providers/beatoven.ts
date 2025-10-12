import ky from 'ky';
import type { MusicProvider, Brief } from '../types';

const BASE = import.meta.env.VITE_BEATOVEN_BASE_URL || 'https://api.beatoven.ai';
const KEY = import.meta.env.VITE_BEATOVEN_API_KEY || '';

export const beatovenProvider: MusicProvider = {
  async generatePreview(brief: Brief) {
    if (!KEY) {
      throw new Error('Beatoven API key not configured');
    }

    const body = {
      prompt: `${brief.genre} ${brief.mood || ''} jingle`,
      duration: Math.min(brief.durationSec, 30),
      stems: false,
    };

    const r = await ky
      .post(`${BASE}/v1/tracks`, {
        json: body,
        headers: { 'X-API-Key': KEY },
      })
      .json<any>();

    return { taskId: r.taskId };
  },

  async poll(taskId: string) {
    if (!KEY) {
      throw new Error('Beatoven API key not configured');
    }

    const r = await ky
      .get(`${BASE}/v1/tasks/${taskId}`, {
        headers: { 'X-API-Key': KEY },
      })
      .json<any>();

    if (r.status === 'completed') {
      return { state: 'done' as const, previewUrl: r.previewUrl, meta: r };
    }
    if (r.status === 'failed') {
      return { state: 'failed' as const };
    }
    return { state: 'running' as const };
  },

  async generateFull(brief: Brief) {
    if (!KEY) {
      throw new Error('Beatoven API key not configured');
    }

    const body = {
      prompt: `${brief.genre} ${brief.mood || ''} instrumental`,
      duration: brief.durationSec,
      stems: true,
    };

    const r = await ky
      .post(`${BASE}/v1/tracks`, {
        json: body,
        headers: { 'X-API-Key': KEY },
      })
      .json<any>();

    return { taskId: r.taskId };
  },

  async fetchAsset(taskId: string) {
    if (!KEY) {
      throw new Error('Beatoven API key not configured');
    }

    const r = await ky
      .get(`${BASE}/v1/assets/${taskId}`, {
        headers: { 'X-API-Key': KEY },
      })
      .json<any>();

    return { url: r.downloadUrl, stems: r.stemsUrls };
  },
};
