import { GenerationTaskPayload, MagnificCategory } from '../types/magnific';
import { getEngineById } from '../constants/magnificEngines';
import { calculateEstimatedCredits } from '../constants/defaultCredits';

export interface AdapterRequest {
  endpoint: string;
  method: 'POST';
  headers: Record<string, string>;
  body: Record<string, any>;
}

export interface AdapterExecutionResult {
  status: 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  estimatedCredits: number;
  provider: string;
  error?: string;
}

const MAGNIFIC_BASE_URL = 'https://api.magnific.com';

/**
 * Model-Specific Adapters
 * Each adapter knows how to translate standard UI inputs into the specific schema
 * expected by that Magnific engine endpoint.
 */
export const MODEL_ADAPTERS: Record<string, (payload: GenerationTaskPayload) => AdapterRequest> = {
  // 1. Mystic (Magnific Flagship)
  'mystic': (p) => ({
    endpoint: '/v1/ai/mystic',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      negative_prompt: p.negativePrompt || undefined,
      model: 'realism',
      resolution: p.resolution || '2k',
      aspect_ratio: p.aspectRatio === '16:9' ? 'widescreen_16_9' :
                    p.aspectRatio === '9:16' ? 'portrait_9_16' :
                    p.aspectRatio === '4:3' ? 'landscape_4_3' : 'square_1_1',
      hdr: (p.hdr ?? 35) / 100,
      adherence: (p.adherence ?? 80) / 100,
      creative_detailing: (p.creativeDetailing ?? 40) / 100,
      style_reference: p.styleReferenceBase64 || undefined,
      structure_reference: p.structureReferenceBase64 || undefined,
    }
  }),

  // 2. Flux Kontext Pro
  'flux-kontext-pro': (p) => ({
    endpoint: '/v1/ai/text-to-image/flux-kontext-pro',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      negative_prompt: p.negativePrompt || undefined,
      aspect_ratio: p.aspectRatio || '16:9',
      image_context: p.inputImageBase64 || undefined,
    }
  }),

  // 3. Flux 2 Klein (Up to 4 references)
  'flux-2-klein': (p) => ({
    endpoint: '/v1/ai/text-to-image/flux-2-klein',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      negative_prompt: p.negativePrompt || undefined,
      aspect_ratio: p.aspectRatio || '16:9',
      references: [
        ...(p.inputImageBase64 ? [p.inputImageBase64] : []),
        ...(p.styleReferenceBase64 ? [p.styleReferenceBase64] : []),
        ...(p.extraReferences || [])
      ].slice(0, 4)
    }
  }),

  // 4. Kling 2.6 Pro & Kling 2.6 Motion Control
  'kling-2-6-pro': (p) => ({
    endpoint: '/v1/ai/text-to-video/kling-v2-6',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      negative_prompt: p.negativePrompt || undefined,
      duration: p.durationSeconds || 5,
      aspect_ratio: p.aspectRatio || '16:9',
      image_start: p.inputImageBase64 || undefined,
    }
  }),

  'kling-2-6-motion': (p) => ({
    endpoint: '/v1/ai/text-to-video/kling-motion-control',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      camera_movement: p.cameraMovement || 'Pan Right',
      duration: p.durationSeconds || 5,
      image_start: p.inputImageBase64 || undefined,
    }
  }),

  // 5. MiniMax Hailuo
  'minimax-hailuo-02': (p) => ({
    endpoint: '/v1/ai/text-to-video/minimax-hailuo',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      duration: p.durationSeconds || 5,
      resolution: '1080p',
      image_prompt: p.inputImageBase64 || undefined,
    }
  }),

  // 6. WAN 2.5 I2V & T2V
  'wan-2-5-i2v': (p) => ({
    endpoint: '/v1/ai/image-to-video/wan-2-5-i2v',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      image: p.inputImageBase64,
      duration: p.durationSeconds || 5,
      aspect_ratio: p.aspectRatio || '16:9',
    }
  }),

  'wan-2-5-t2v': (p) => ({
    endpoint: '/v1/ai/text-to-video/wan-2-5-t2v',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || '',
      duration: p.durationSeconds || 5,
      aspect_ratio: p.aspectRatio || '16:9',
    }
  }),

  // 7. Upscaler Creative (Magnific Flagship Upscaler)
  'upscaler-creative': (p) => ({
    endpoint: '/v1/ai/image-upscaler/creative',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      image: p.inputImageBase64,
      prompt: p.prompt || 'ultra high definition photorealistic master quality',
      scale_factor: p.scaleFactor || 4,
      creativity: (p.creativeDetailing ?? 60) / 100,
      hdr: (p.hdr ?? 40) / 100,
      target_resolution: p.resolution || '4k'
    }
  }),

  // 8. Upscaler Precision
  'upscaler-precision': (p) => ({
    endpoint: '/v1/ai/image-upscaler/precision',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      image: p.inputImageBase64,
      scale_factor: p.scaleFactor || 2,
      target_resolution: p.resolution || '2k'
    }
  }),

  // 9. Relight
  'relight': (p) => ({
    endpoint: '/v1/ai/image-editing/relight',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      image: p.inputImageBase64,
      prompt: p.prompt || 'golden hour cinematic warm volumetric light',
    }
  }),

  // 10. Style Transfer
  'style-transfer': (p) => ({
    endpoint: '/v1/ai/image-editing/style-transfer',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      image: p.inputImageBase64,
      style_reference: p.styleReferenceBase64,
      prompt: p.prompt || '',
    }
  }),

  // 11. Remove Background
  'remove-background': (p) => ({
    endpoint: '/v1/ai/image-editing/remove-background',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      image: p.inputImageBase64
    }
  }),

  // 12. Image Expand
  'image-expand': (p) => ({
    endpoint: '/v1/ai/image-editing/image-expand',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      image: p.inputImageBase64,
      prompt: p.prompt || '',
      aspect_ratio: p.aspectRatio || '16:9'
    }
  }),

  // 13. Music Generation (ElevenLabs)
  'music-elevenlabs': (p) => ({
    endpoint: '/v1/ai/audio/music',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || 'Cinematic ambient uplifting score',
      duration_seconds: p.durationSeconds || 30,
      genre: p.genre || 'Cinematic Epic Orchestral',
      tempo: p.tempo || 'Medium'
    }
  }),

  // 14. Sound Effects
  'sound-effects': (p) => ({
    endpoint: '/v1/ai/audio/sound-effects',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || 'Cinematic explosion with debris',
      duration_seconds: p.durationSeconds || 5
    }
  }),

  // 15. Audio Isolation
  'audio-isolation': (p) => ({
    endpoint: '/v1/ai/audio/isolation',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      prompt: p.prompt || 'Isolate vocals',
      duration_seconds: p.durationSeconds || 30
    }
  })
};

/**
 * Fallback generic adapter for any engine not having a custom shape
 */
export function buildGenericAdapter(payload: GenerationTaskPayload): AdapterRequest {
  const engine = getEngineById(payload.engineId);
  const endpoint = engine?.endpoint || `/v1/ai/${payload.category}/${payload.engineId}`;

  const body: Record<string, any> = {
    prompt: payload.prompt || '',
    aspect_ratio: payload.aspectRatio || '16:9',
  };

  if (payload.negativePrompt) {
    body.negative_prompt = payload.negativePrompt;
  }
  if (payload.resolution) {
    body.resolution = payload.resolution;
  }
  if (payload.durationSeconds) {
    body.duration = payload.durationSeconds;
  }
  if (payload.inputImageBase64) {
    body.image = payload.inputImageBase64;
  }

  return {
    endpoint,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  };
}

/**
 * Get adapter request for any model
 */
export function getAdapterRequest(payload: GenerationTaskPayload): AdapterRequest {
  const adapterFn = MODEL_ADAPTERS[payload.engineId];
  if (adapterFn) {
    return adapterFn(payload);
  }
  return buildGenericAdapter(payload);
}
