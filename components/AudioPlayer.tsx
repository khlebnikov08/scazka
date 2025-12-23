import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Volume2 } from 'lucide-react';
import { Story } from '../types';
import { translations } from '../translations';

interface AudioPlayerProps {
  story: Story | null;
  onClose: () => void;
  voiceName: string; // To simulate parent voice selection
  lang?: 'en' | 'ru';
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ story, onClose, voiceName, lang = 'en' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const t = translations[lang];
  
  // Mock duration for progress bar visual
  const [currentTime, setCurrentTime] = useState(0);
  const totalDuration = 300; // Mock 5 minutes in seconds

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (story && synthRef.current) {
      // Cancel previous
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(story.content);
      utterance.rate = 0.85; // Slow down for bedtime
      utterance.pitch = 1.0;
      
      // Try to find a soothing voice if possible, else default
      // In a real app, this would use the cloned voice buffer
      
      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
      };

      utteranceRef.current = utterance;
      
      // Auto play on load
      synthRef.current.speak(utterance);
      setIsPlaying(true);
    }
  }, [story]);

  // Handle Play/Pause logic interacting with SpeechSynthesis
  useEffect(() => {
    if (!synthRef.current) return;

    if (isPlaying) {
      if (synthRef.current.paused) synthRef.current.resume();
    } else {
      if (synthRef.current.speaking) synthRef.current.pause();
    }
  }, [isPlaying]);

  // Simulate progress bar since SpeechSynthesis API doesn't give precise timing
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 1;
          setProgress((next / totalDuration) * 100);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!story) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-night-800 border-t border-night-700 p-4 pb-8 md:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-50">
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="w-full bg-night-700 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-warm-500 h-full transition-all duration-1000 ease-linear" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium truncate">{story.title}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Volume2 size={14} className="text-warm-500" />
              <span>{t.player.voice}: {voiceName}</span>
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setCurrentTime(Math.max(0, currentTime - 15));
                // Note: TTS doesn't support seek easily, this is UI only for demo
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack size={24} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-warm-500 hover:bg-warm-400 text-white p-3 rounded-full shadow-lg shadow-warm-500/20 transition-all transform hover:scale-105"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" ml-1 />}
            </button>

            <button 
              onClick={() => setCurrentTime(currentTime + 15)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={24} />
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            <button onClick={onClose} className="text-slate-500 hover:text-red-400 transition-colors p-2">
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};