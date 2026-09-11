export type MagnificCategory = 'images' | 'video' | 'editing' | 'audio';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';
export type Resolution = '1k' | '2k' | '4k' | '8k' | '720p' | '1080p';

export interface MagnificEngine {
  id: string;
  name: string;
  category: MagnificCategory;
  provider: string;
  badge: string;
  description: string;
  endpoint: string;
  isFlagship?: boolean;
  requiresInputImage?: boolean;
  optionalInputImage?: boolean;
  supportsMultiReference?: boolean;
  maxReferences?: number;
  supportedAspectRatios?: AspectRatio[];
  supportedResolutions?: Resolution[];
  supportedDurations?: number[]; // in seconds e.g. [5, 10]
  supportsNegativePrompt?: boolean;
  supportsCreativeDetailing?: boolean;
  supportsHdr?: boolean;
  supportsAdherence?: boolean;
  supportsMotionControl?: boolean;
  supportsScaleFactor?: boolean;
  supportsAudioGenre?: boolean;
  features: string[];
  defaultParams: Record<string, any>;
  creditKey: string;
}

export interface ModelCreditsConfig {
  [engineId: string]: {
    default?: number;
    [variant: string]: number | undefined;
  };
}

export interface GenerationTaskPayload {
  engineId: string;
  category: MagnificCategory;
  prompt?: string;
  negativePrompt?: string;
  aspectRatio?: AspectRatio;
  resolution?: Resolution;
  durationSeconds?: number;
  inputImageBase64?: string;
  styleReferenceBase64?: string;
  structureReferenceBase64?: string;
  extraReferences?: string[];
  hdr?: number;
  adherence?: number;
  creativeDetailing?: number;
  scaleFactor?: number;
  motionControl?: string;
  cameraMovement?: string;
  genre?: string;
  tempo?: string;
  creativity?: number;
  apiKey?: string;
}

export interface GenerationResult {
  id: string;
  userId: string;
  userEmail: string;
  category: MagnificCategory;
  engineId: string;
  engineName: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  resolution?: string;
  durationSeconds?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  thumbnailUrl?: string;
  inputImageUrl?: string;
  estimatedCredits: number;
  isFavorite: boolean;
  error?: string;
  createdAt: string;
  updatedAt: string;
  provider?: string;
}

export interface CreditsSummary {
  monthlyUsed: number;
  billingResetDay: number;
  lastResetIso: string;
  isEnterpriseMode: boolean;
  officialTeamUsage?: {
    totalCredits?: number;
    usedCredits?: number;
    remainingCredits?: number;
    plan?: string;
  };
}
