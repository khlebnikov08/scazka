export enum StoryType {
  BASIC = 'BASIC',
  GENERATED_DAY = 'GENERATED_DAY',
  GENERATED_THEME = 'GENERATED_THEME'
}

export enum StoryDuration {
  SHORT = 'Short (3-5 min)',
  LONG = 'Long (10-15 min)'
}

export interface Story {
  id: string;
  title: string;
  previewText: string;
  content: string;
  type: StoryType;
  durationLabel: string;
  isPremium: boolean;
  tags: string[];
  imageUrl: string;
  createdAt: number;
}

export interface ChildProfile {
  name: string;
  age: number;
  tabooTopics: string[];
}

export interface VoiceProfile {
  id: string;
  name: string;
  status: 'ready' | 'processing' | 'recording';
  metrics: {
    clarity: number; // 0-100 score
    stability: number; // 0-100 score
    noiseLevel: 'Low' | 'Medium' | 'High';
  };
  lastUpdated: number;
}

export interface GenerationConfig {
  theme?: string;
  dayEvents?: string;
  duration: StoryDuration;
  restrictions: string;
  childName: string;
  language: 'en' | 'ru';
}

export interface UserState {
  isParentMode: boolean;
  hasSubscription: boolean;
  subscriptionTier: 'free' | 'basic' | 'medium' | 'max';
}