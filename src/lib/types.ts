// Content Factory Types
export interface VideoTemplate {
  id: string;
  name: string;
  category: 'listicle' | 'storytime' | 'reaction' | 'tutorial' | 'comparison' | 'review' | 'challenge';
  description: string;
  structure: string[];
  hooks: string[];
  example_title: string;
}

export interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
  script: string;
  hook: string;
  cta: string;
}

// Thumbnail A/B Testing Types
export interface ThumbnailScore {
  filename: string;
  url: string;
  scores: {
    visual_contrast: number;
    emotional_trigger: number;
    text_readability: number;
    curiosity_gap: number;
    overall_ctr: number;
  };
  isWinner?: boolean;
  reasoning?: string;
}

// Video Generator Types
export interface VideoScene {
  id: number;
  description: string;
  imagePrompt: string;
  duration: number;
  imageUrl: string | null;
  status: 'pending' | 'generating' | 'approved' | 'rejected';
  transition: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface VideoProject {
  id: string;
  title: string;
  sceneCount: number;
  style: 'cinematic' | 'educational' | 'vlog' | 'minimal';
  aspectRatio: '16:9' | '9:16' | '1:1';
  scenes: VideoScene[];
  voiceover: boolean;
  music: boolean;
  currentSceneIndex: number;
  status: 'draft' | 'generating' | 'ready' | 'rendering' | 'complete';
}

// Trend Reaction Types
export interface TrendingTopic {
  id: string;
  title: string;
  description: string;
  category: string;
  trending_score: number;
  source: string;
  created_at: string;
}

export interface ReactionScript {
  topic: string;
  script: string;
  hooks: string[];
  timestamps: Array<{
    time: string;
    action: string;
    text: string;
  }>;
  cta: string;
}

// Analytics Types
export interface ChannelAnalytics {
  total_views: number;
  total_subscribers: number;
  avg_ctr: number;
  avg_retention: number;
  top_performing_content: string[];
  growth_projection: {
    subscribers_30d: number;
    views_30d: number;
  };
}

export interface VideoAnalytics {
  video_id: string;
  title: string;
  views: number;
  ctr: number;
  retention_curve: number[];
  engagement_rate: number;
  published_at: string;
}