import React from 'react';
import { Play, Lock, Clock } from 'lucide-react';
import { Story, StoryType } from '../types';
import { translations } from '../translations';

interface StoryCardProps {
  story: Story;
  onPlay: (story: Story) => void;
  isLocked: boolean;
  lang?: 'en' | 'ru';
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onPlay, isLocked, lang = 'en' }) => {
  const t = translations[lang];

  return (
    <div className="group relative bg-night-800 rounded-2xl overflow-hidden border border-night-700 hover:border-warm-500/50 transition-all hover:shadow-xl hover:shadow-warm-500/5 hover:-translate-y-1">
      {/* Image Cover */}
      <div className="aspect-square w-full overflow-hidden relative">
        <img 
          src={story.imageUrl} 
          alt={story.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isLocked ? 'grayscale opacity-50' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 to-transparent opacity-80" />
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          {story.isPremium && (
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full border border-amber-500/20 backdrop-blur-md">
              {t.library.premium}
            </span>
          )}
          {story.type === StoryType.GENERATED_DAY && (
            <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-full border border-purple-500/20 backdrop-blur-md">
              {t.library.fromDay}
            </span>
          )}
        </div>

        {/* Play Overlay */}
        {!isLocked && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => onPlay(story)}
              className="bg-warm-500 text-white p-4 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
            >
              <Play size={32} fill="currentColor" className="ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1 truncate">{story.title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2 mb-3 h-10">{story.previewText}</p>
        
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{story.durationLabel}</span>
          </div>
          {isLocked ? (
             <div className="flex items-center gap-1">
                <Lock size={14} />
                <span>{t.library.locked}</span>
             </div>
          ) : (
            <span className="text-warm-500 font-medium group-hover:underline cursor-pointer" onClick={() => onPlay(story)}>
              {t.library.playNow}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};