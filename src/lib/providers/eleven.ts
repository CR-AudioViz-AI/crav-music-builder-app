import type { MusicProvider, Brief } from '../types';

const ENABLED = import.meta.env.VITE_ELEVEN_MUSIC_ENABLED === '1';

export const elevenProvider: MusicProvider = {
  async generatePreview(brief: Brief) {
    if (!ENABLED) {
      throw new Error('Eleven Music API access not enabled');
    }
    throw new Error('TODO: implement when API access is granted');
  },

  async poll() {
    throw new Error('TODO: implement when API access is granted');
  },

  async generateFull() {
    throw new Error('TODO: implement when API access is granted');
  },

  async fetchAsset() {
    throw new Error('TODO: implement when API access is granted');
  },
};
