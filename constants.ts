import { Story, StoryType, StoryDuration, VoiceProfile } from './types';

export const INITIAL_STORIES: Story[] = [
  {
    id: '1',
    title: 'The Little Star That Could',
    previewText: 'A journey of a small star finding its brightness.',
    content: 'Once upon a time, in a galaxy far, far away, there lived a little star named Twinkle. Unlike the other stars, Twinkle was shy...',
    type: StoryType.BASIC,
    durationLabel: StoryDuration.SHORT,
    isPremium: false,
    tags: ['Space', 'Calm'],
    imageUrl: 'https://picsum.photos/400/400?grayscale',
    createdAt: Date.now()
  },
  {
    id: '2',
    title: 'The Sleepy Bear',
    previewText: 'Bear prepares for a long winter nap.',
    content: 'The leaves were falling, turning gold and red. Barnaby the Bear yawned a big, long yawn. It was time for hibernation...',
    type: StoryType.BASIC,
    durationLabel: StoryDuration.SHORT,
    isPremium: false,
    tags: ['Animals', 'Nature'],
    imageUrl: 'https://picsum.photos/401/401?grayscale',
    createdAt: Date.now()
  },
  {
    id: '3',
    title: 'Kingdom of Clouds',
    previewText: 'A magical adventure above the sky.',
    content: 'High above the tallest mountain lived the Cloud Keeper. Every evening, he painted the sunset with colors of orange and pink...',
    type: StoryType.BASIC,
    durationLabel: StoryDuration.LONG,
    isPremium: true,
    tags: ['Magic', 'Fantasy'],
    imageUrl: 'https://picsum.photos/402/402?grayscale',
    createdAt: Date.now()
  }
];

export const MOCK_CHILD_PROFILE = {
  name: 'Leo',
  age: 5,
  tabooTopics: ['spiders', 'monsters', 'darkness']
};

export const MOCK_VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'v1',
    name: 'Dad',
    status: 'ready',
    metrics: { clarity: 92, stability: 88, noiseLevel: 'Low' },
    lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
  },
  {
    id: 'v2',
    name: 'Mom',
    status: 'ready',
    metrics: { clarity: 95, stability: 90, noiseLevel: 'Low' },
    lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 10 // 10 days ago
  }
];

export const SYSTEM_INSTRUCTION = `
You are a gentle, therapeutic storyteller for children. 
Your goal is to create bedtime stories that induce calmness and sleep.
The tone should be soothing, warm, and safe.
Avoid any scary elements, loud noises (in text description), or complex conflicts.
Focus on sensory details that are relaxing (soft clouds, warm blankets, gentle breeze).
`;