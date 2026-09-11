import { ModelCreditsConfig } from '../types/magnific';

export const DEFAULT_CREDITS_CONFIG: ModelCreditsConfig = {
  // --- IMÁGENES ---
  'mystic': { '1k': 25, '2k': 50, '4k': 100, 'default': 50 },
  'flux-kontext-pro': { 'default': 35 },
  'flux-2-pro': { 'default': 40 },
  'flux-2-turbo': { 'default': 15 },
  'flux-2-klein': { 'default': 30 },
  'flux-pro-1-1': { 'default': 40 },
  'flux-dev': { 'default': 20 },
  'hyperflux': { 'default': 10 },
  'seedream-4': { 'default': 20 },
  'seedream-4-5': { 'default': 25 },
  'seedream-4-5-edit': { 'default': 30 },
  'z-image-turbo': { 'default': 10 },
  'runway-t2i': { 'default': 35 },

  // --- VIDEO ---
  'kling-2-1-pro': { '5s': 250, '10s': 500, 'default': 250 },
  'kling-2-5-pro': { '5s': 300, '10s': 600, 'default': 300 },
  'kling-2-6-pro': { '5s': 350, '10s': 700, 'default': 350 },
  'kling-2-6-motion': { '5s': 400, '10s': 800, 'default': 400 },
  'kling-o1': { '5s': 450, '10s': 900, 'default': 450 },
  'minimax-hailuo-02': { '5s': 280, '10s': 560, 'default': 280 },
  'minimax-hailuo-2-3': { '5s': 300, '10s': 600, 'default': 300 },
  'minimax-video-01': { '5s': 260, '10s': 520, 'default': 260 },
  'wan-2-5-t2v': { '5s': 250, '10s': 500, 'default': 250 },
  'wan-2-5-i2v': { '5s': 270, '10s': 540, 'default': 270 },
  'wan-2-6': { '5s': 320, '10s': 640, 'default': 320 },
  'runway-gen4': { '5s': 400, '10s': 800, 'default': 400 },
  'runway-act-two': { '5s': 450, '10s': 900, 'default': 450 },
  'ltx-2-0-pro': { '5s': 220, '10s': 440, 'default': 220 },
  'seedance-pro': { '5s': 260, '10s': 520, 'default': 260 },
  'pixverse-v5': { '5s': 280, '10s': 560, 'default': 280 },
  'omnihuman-1-5': { '5s': 350, '10s': 700, 'default': 350 },
  'vfx-effects': { 'default': 200 },

  // --- EDICIÓN ---
  'upscaler-creative': { '2k': 90, '4k': 300, '8k': 600, 'default': 90 },
  'upscaler-precision': { '2k': 60, '4k': 180, '8k': 400, 'default': 60 },
  'relight': { 'default': 75 },
  'style-transfer': { 'default': 80 },
  'remove-background': { 'default': 15 },
  'image-expand': { 'default': 70 },

  // --- AUDIO ---
  'music-elevenlabs': { '30s': 50, '60s': 100, 'default': 50 },
  'sound-effects': { 'default': 25 },
  'audio-isolation': { 'default': 40 }
};

export function calculateEstimatedCredits(
  engineId: string,
  params: { resolution?: string; durationSeconds?: number; scaleFactor?: number },
  config: ModelCreditsConfig = DEFAULT_CREDITS_CONFIG
): number {
  const modelRates = config[engineId] || { default: 50 };

  // Check scaleFactor for upscalers
  if (params.scaleFactor) {
    const scaleKey = `${params.scaleFactor}x`;
    if (modelRates[scaleKey] !== undefined) {
      return modelRates[scaleKey]!;
    }
  }

  // Check duration first if provided
  if (params.durationSeconds) {
    const durKey = `${params.durationSeconds}s`;
    if (modelRates[durKey] !== undefined) {
      return modelRates[durKey]!;
    }
  }

  // Check resolution if provided
  if (params.resolution) {
    const resKey = params.resolution.toLowerCase();
    if (modelRates[resKey] !== undefined) {
      return modelRates[resKey]!;
    }
  }

  return modelRates.default || 50;
}

