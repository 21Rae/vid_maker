export interface VideoConfig {
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  model: 'veo-3.1-fast-generate-preview' | 'veo-3.1-generate-preview';
}

export interface GenerationRequest {
  prompt: string;
  image?: {
    data: string; // Base64
    mimeType: string;
  };
  config: VideoConfig;
}

export interface GeneratedVideo {
  uri: string;
  expiryTime?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

// Window interface for AI Studio extensions
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}