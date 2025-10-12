export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  intervalSec?: number;
  volume?: number;
}

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  enabled: true,
  text: 'Preview',
  intervalSec: 8,
  volume: 0.3,
};

export function shouldWatermark(assetType: 'preview' | 'full'): boolean {
  return assetType === 'preview';
}

export interface WatermarkMetadata {
  applied: boolean;
  method: 'audible' | 'inaudible' | 'none';
  timestamp: string;
  config?: WatermarkConfig;
}

export function generateWatermarkMetadata(
  assetType: 'preview' | 'full',
  config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG
): WatermarkMetadata {
  if (assetType === 'full') {
    return {
      applied: false,
      method: 'none',
      timestamp: new Date().toISOString(),
    };
  }

  return {
    applied: true,
    method: 'audible',
    timestamp: new Date().toISOString(),
    config,
  };
}

export function getWatermarkInstructions(config: WatermarkConfig = DEFAULT_WATERMARK_CONFIG): {
  type: 'tts' | 'tone';
  text?: string;
  intervalSec: number;
  volume: number;
} {
  return {
    type: 'tts',
    text: config.text || 'Preview',
    intervalSec: config.intervalSec || 8,
    volume: config.volume || 0.3,
  };
}

export function embedProvenanceInMetadata(audioMeta: any, provenance: any): any {
  return {
    ...audioMeta,
    comment: JSON.stringify({
      provider: provenance.provider,
      model: provenance.model || 'unknown',
      jobId: provenance.jobId,
      promptHash: provenance.promptHash,
      createdAt: provenance.createdAt || new Date().toISOString(),
      licensedTo: provenance.licensedTo,
    }),
  };
}
