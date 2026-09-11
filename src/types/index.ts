export type MediaType = 'image' | 'video';

export type EngineId = 
  // Image Engines
  | 'mystic'
  | 'flux-pro'
  | 'flux-schnell'
  | 'recraft-v3'
  | 'imagen-3'
  | 'seedream'
  | 'magnific-upscale'
  // Video Engines
  | 'kling-1-5'
  | 'minimax-hailuo'
  | 'runway-gen3'
  | 'luma-dream'
  | 'cogvideox';

export interface AIEngine {
  id: EngineId;
  name: string;
  provider: 'Freepik' | 'Magnific' | 'Black Forest Labs' | 'Kuaishou' | 'MiniMax' | 'Runway' | 'Luma' | 'Google';
  type: MediaType;
  badge: string;
  description: string;
  speed: 'Ultra Fast' | 'Fast' | 'Standard' | 'Cinematic Deep';
  quality: '8K Ultra Photoreal' | 'Pro Cinema' | 'High Dynamic' | 'Vector & Design' | 'Hallucination Precision';
  maxResolution: string;
  supportedAspectRatios: string[];
  features: string[];
  isFlagship?: boolean;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';

export interface GenerationItem {
  id: string;
  userId: string;
  userEmail: string;
  type: MediaType;
  engine: EngineId;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  seed?: number;
  isFavorite: boolean;
  durationSeconds?: number;
  error?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  defaultEngine?: EngineId;
  freepikApiKey?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GenerationRequestParams {
  type: MediaType;
  engine: EngineId;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: string;
  durationSeconds?: number;
  creativity?: number; // For Magnific upscale/enhancer
  motionStrength?: number; // For video engines
  seed?: number;
  apiKey?: string;
}
