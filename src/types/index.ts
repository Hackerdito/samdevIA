export type MediaType = 'image' | 'video' | 'editing' | 'audio';

export type EngineId = string;

export interface AIEngine {
  id: EngineId;
  name: string;
  provider: string;
  type: MediaType;
  badge: string;
  description: string;
  speed?: 'Ultra Fast' | 'Fast' | 'Standard' | 'Cinematic Deep';
  quality?: string;
  maxResolution?: string;
  supportedAspectRatios?: string[];
  features: string[];
  isFlagship?: boolean;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';

export interface GenerationItem {
  id: string;
  userId: string;
  userEmail: string;
  type: MediaType;
  category?: 'images' | 'video' | 'editing' | 'audio';
  engine: EngineId;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  inputImageUrl?: string;
  seed?: number;
  isFavorite: boolean;
  durationSeconds?: number;
  estimatedCredits?: number;
  provider?: string;
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
  magnificApiKey?: string;
  freepikApiKey?: string;
  creditsSummary?: any;
  createdAt: string;
  updatedAt?: string;
}

export interface GenerationRequestParams {
  type: MediaType;
  category?: 'images' | 'video' | 'editing' | 'audio';
  engine: EngineId;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: AspectRatio;
  resolution: string;
  durationSeconds?: number;
  creativity?: number; // For Magnific upscale/enhancer
  motionStrength?: number; // For video engines
  inputImageBase64?: string;
  styleReferenceBase64?: string;
  structureReferenceBase64?: string;
  extraReferences?: string[];
  hdr?: number;
  adherence?: number;
  creativeDetailing?: number;
  scaleFactor?: number;
  cameraMovement?: string;
  genre?: string;
  tempo?: string;
  seed?: number;
  estimatedCredits?: number;
  apiKey?: string;
}
