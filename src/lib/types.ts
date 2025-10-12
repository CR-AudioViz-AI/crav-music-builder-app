export type TrackType = 'SONG' | 'INSTRUMENTAL' | 'JINGLE';
export type Vocals = 'MALE' | 'FEMALE' | 'DUET' | 'NONE';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';
export type TrackStatus = 'queued' | 'rendering' | 'ready' | 'error';
export type JobState = 'queued' | 'running' | 'done' | 'failed';

export interface Brief {
  title?: string;
  genre: string;
  mood?: string;
  tempo?: number;
  durationSec: number;
  vocals: Vocals;
  language?: Language;
  lyrics?: string;
  structure?: Array<{ name: string; bars?: number }>;
}

export interface ProviderResultMeta {
  [k: string]: any;
}

export interface MusicProvider {
  generatePreview(brief: Brief): Promise<{ taskId: string }>;
  poll(taskId: string): Promise<{
    state: 'running' | 'done' | 'failed';
    previewUrl?: string;
    meta?: ProviderResultMeta;
  }>;
  generateFull(brief: Brief, seedMeta?: ProviderResultMeta): Promise<{ taskId: string }>;
  fetchAsset(taskId: string): Promise<{
    url: string;
    stems?: string[];
    license?: any;
  }>;
}

export interface Track {
  id: string;
  user_id: string;
  title: string;
  brief: Brief;
  duration_sec: number;
  type: TrackType;
  provider: string;
  status: TrackStatus;
  preview_url?: string;
  full_url?: string;
  stems_zip_url?: string;
  license_json?: any;
  cost_credits: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  track_id: string;
  provider: string;
  payload: any;
  provider_task_id?: string;
  state: JobState;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  delta: number;
  reason: string;
  meta?: any;
  created_at: string;
}
