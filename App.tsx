import React, { useState, useRef } from 'react';
import { 
  Moon, 
  Settings, 
  Sparkles, 
  User, 
  CheckCircle, 
  XCircle,
  Globe,
  Mic,
  Square,
  Loader
} from 'lucide-react';

import { Story, StoryType, StoryDuration, UserState, GenerationConfig } from './types';
import { INITIAL_STORIES, MOCK_CHILD_PROFILE } from './constants';
import { generateBedtimeStory, transcribeUserAudio } from './services/geminiService';
import { translations } from './translations';

// Components
import { AudioPlayer } from './components/AudioPlayer';
import { StoryCard } from './components/StoryCard';
import { Button } from './components/Button';
import { ParentalGate } from './components/ParentalGate';
import { VoiceProfileManager } from './components/VoiceProfileManager';

type ViewMode = 'LIBRARY' | 'CREATE_MODE_SELECTION' | 'CREATE_THEME' | 'CREATE_DAY' | 'APPROVAL' | 'SETTINGS';
type Language = 'en' | 'ru';

const App: React.FC = () => {
  // State
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [currentView, setCurrentView] = useState<ViewMode>('LIBRARY');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [pendingParentAction, setPendingParentAction] = useState<(() => void) | null>(null);
  const [lang, setLang] = useState<Language>('en');
  
  const t = translations[lang];

  // Generation State
  const [generatedDraft, setGeneratedDraft] = useState<{title: string, content: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [creationConfig, setCreationConfig] = useState<GenerationConfig>({
    duration: StoryDuration.SHORT,
    restrictions: MOCK_CHILD_PROFILE.tabooTopics.join(', '),
    childName: MOCK_CHILD_PROFILE.name,
    language: 'en'
  });
  const [dayInput, setDayInput] = useState('');
  const [themeInput, setThemeInput] = useState('');
  
  // Recording State for Day Input
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // User State
  const [userState, setUserState] = useState<UserState>({
    isParentMode: false,
    hasSubscription: true,
    subscriptionTier: 'medium'
  });

  // Actions
  const handlePlayStory = (story: Story) => {
    setActiveStory(story);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ru' : 'en');
  };

  const requestParentAccess = (action: () => void) => {
    if (userState.isParentMode) {
      action();
    } else {
      setPendingParentAction(() => action);
      setIsParentGateOpen(true);
    }
  };

  const handleParentUnlock = () => {
    setIsParentGateOpen(false);
    setUserState(prev => ({ ...prev, isParentMode: true }));
    if (pendingParentAction) {
      pendingParentAction();
      setPendingParentAction(null);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or error occurred.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Default for many browsers
        
        try {
            const base64 = await blobToBase64(audioBlob);
            const text = await transcribeUserAudio(base64, audioBlob.type || 'audio/webm');
            if (text) {
                setDayInput(prev => prev ? prev + ' ' + text : text);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsTranscribing(false);
            // Cleanup stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
      };
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleGenerate = async (type: 'THEME' | 'DAY') => {
    setIsGenerating(true);
    const config = { 
      ...creationConfig, 
      theme: type === 'THEME' ? themeInput : undefined,
      dayEvents: type === 'DAY' ? dayInput : undefined,
      language: lang
    };

    const result = await generateBedtimeStory(config);
    setGeneratedDraft(result);
    setIsGenerating(false);
    setCurrentView('APPROVAL');
  };

  const handleApproveStory = () => {
    if (!generatedDraft) return;

    const newStory: Story = {
      id: Date.now().toString(),
      title: generatedDraft.title,
      content: generatedDraft.content,
      previewText: generatedDraft.content.substring(0, 100) + '...',
      type: currentView === 'CREATE_DAY' ? StoryType.GENERATED_DAY : StoryType.GENERATED_THEME,
      durationLabel: creationConfig.duration,
      isPremium: false,
      tags: ['Generated', 'Personalized'],
      imageUrl: 'https://picsum.photos/400/400?grayscale&blur=2', // Placeholder
      createdAt: Date.now()
    };

    setStories([newStory, ...stories]);
    setCurrentView('LIBRARY');
    handlePlayStory(newStory);
    setGeneratedDraft(null);
  };

  // Views
  const renderLibrary = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
      {stories.map(story => (
        <StoryCard 
          key={story.id} 
          story={story} 
          onPlay={handlePlayStory} 
          isLocked={story.isPremium && userState.subscriptionTier === 'free'}
          lang={lang}
        />
      ))}
    </div>
  );

  const renderCreateSelection = () => (
    <div className="flex flex-col gap-6 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center text-white">{t.create.title}</h2>
      
      <button 
        onClick={() => setCurrentView('CREATE_DAY')}
        className="group bg-night-800 border border-night-700 hover:border-purple-500/50 p-6 rounded-2xl text-left transition-all hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-purple-500/20 p-3 rounded-full text-purple-400">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">{t.create.dayTitle}</h3>
        </div>
        <p className="text-slate-400 text-sm">{t.create.dayDesc}</p>
      </button>

      <button 
        onClick={() => requestParentAccess(() => setCurrentView('CREATE_THEME'))}
        className="group bg-night-800 border border-night-700 hover:border-warm-500/50 p-6 rounded-2xl text-left transition-all hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-warm-500/20 p-3 rounded-full text-warm-500">
            <Settings size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">{t.create.themeTitle}</h3>
        </div>
        <p className="text-slate-400 text-sm">{t.create.themeDesc}</p>
      </button>
    </div>
  );

  const renderCreateForm = (mode: 'DAY' | 'THEME') => (
    <div className="max-w-xl mx-auto mt-8 bg-night-800 rounded-3xl p-6 border border-night-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {mode === 'DAY' ? t.create.dayQuestion : t.create.title}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setCurrentView('CREATE_MODE_SELECTION')}>{t.create.cancel}</Button>
      </div>

      <div className="space-y-6">
        {mode === 'DAY' ? (
          <div>
            <label className="block text-slate-400 text-sm mb-2">{t.create.keyEvents}</label>
            <div className="relative">
                <textarea 
                className="w-full bg-night-900 border border-night-700 rounded-xl p-4 text-white focus:border-warm-500 focus:ring-1 focus:ring-warm-500 outline-none h-32 resize-none"
                placeholder={t.create.keyEventsPlaceholder}
                value={dayInput}
                onChange={(e) => setDayInput(e.target.value)}
                />
            </div>
            
            {/* Audio Recording Controls */}
            <div className="mt-4 flex items-center justify-between bg-night-900/50 p-3 rounded-xl border border-night-700 border-dashed">
                <div className="text-sm text-slate-400">
                    {isTranscribing ? (
                        <span className="flex items-center gap-2 text-warm-500">
                             <Loader size={16} className="animate-spin" />
                             {t.create.transcribing}
                        </span>
                    ) : (
                        <span>{t.create.orRecord}</span>
                    )}
                </div>
                
                {!isRecording ? (
                     <button
                        onClick={startRecording}
                        disabled={isTranscribing}
                        className="flex items-center gap-2 px-4 py-2 bg-night-800 hover:bg-night-700 border border-night-600 rounded-lg text-slate-200 transition-colors disabled:opacity-50"
                     >
                         <Mic size={18} className="text-warm-500" />
                         {t.create.startRecord}
                     </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-200 transition-colors animate-pulse"
                    >
                        <Square size={18} fill="currentColor" />
                        {t.create.stopRecord}
                    </button>
                )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-slate-400 text-sm mb-2">{t.create.themeLabel}</label>
            <input 
              type="text"
              className="w-full bg-night-900 border border-night-700 rounded-xl p-4 text-white focus:border-warm-500 outline-none"
              placeholder={t.create.themePlaceholder}
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
            />
          </div>
        )}

        {mode === 'THEME' && (
           <div>
             <label className="block text-slate-400 text-sm mb-2">{t.create.duration}</label>
             <div className="flex gap-4">
               {Object.values(StoryDuration).map(d => (
                 <button 
                   key={d}
                   onClick={() => setCreationConfig({...creationConfig, duration: d})}
                   className={`flex-1 p-3 rounded-xl border transition-all ${creationConfig.duration === d ? 'border-warm-500 bg-warm-500/10 text-warm-500' : 'border-night-700 bg-night-900 text-slate-400'}`}
                 >
                   {d}
                 </button>
               ))}
             </div>
           </div>
        )}

        <Button 
          className="w-full mt-4" 
          onClick={() => handleGenerate(mode)}
          disabled={isGenerating || isTranscribing || (mode === 'DAY' ? !dayInput : !themeInput)}
          isLoading={isGenerating}
        >
          {isGenerating ? t.create.processing : t.create.generateBtn}
        </Button>
      </div>
    </div>
  );

  const renderApproval = () => (
    <div className="max-w-2xl mx-auto mt-4 bg-night-800 rounded-3xl p-6 border border-night-700 shadow-2xl relative">
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-warm-500 to-transparent opacity-50" />
      
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="text-green-500" /> 
          {t.approval.title}
        </h2>
        {userState.isParentMode ? (
          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">{t.approval.active}</span>
        ) : (
          <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">{t.approval.locked}</span>
        )}
      </div>

      <div className="bg-night-900 p-4 rounded-xl mb-6 max-h-[50vh] overflow-y-auto border border-night-700">
        <h3 className="font-bold text-warm-500 mb-2">{generatedDraft?.title}</h3>
        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{generatedDraft?.content}</p>
      </div>

      <div className="flex flex-col gap-3">
        {!userState.isParentMode && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-300 mb-2 text-center">
             {t.approval.verification}
          </div>
        )}
        
        <div className="flex gap-4">
          <Button 
             variant="secondary" 
             className="flex-1"
             onClick={() => {
               setGeneratedDraft(null);
               setCurrentView('CREATE_MODE_SELECTION');
             }}
          >
            <XCircle size={18} className="mr-2" />
            {t.approval.discard}
          </Button>
          
          <Button 
            className="flex-1"
            onClick={() => requestParentAccess(handleApproveStory)}
          >
            <CheckCircle size={18} className="mr-2" />
            {t.approval.approve}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night-900 font-sans text-slate-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-night-900/80 backdrop-blur-md border-b border-night-700">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-warm-400 to-warm-600 rounded-full flex items-center justify-center shadow-lg shadow-warm-500/30">
              <Moon size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">{t.appTitle}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button
               onClick={toggleLanguage}
               className="flex items-center gap-1 px-3 py-1 rounded-full bg-night-800 text-xs font-bold text-slate-400 border border-night-700 hover:text-white transition-colors"
             >
               <Globe size={14} />
               {lang.toUpperCase()}
             </button>

            <button 
              onClick={() => requestParentAccess(() => setCurrentView('SETTINGS'))}
              className="p-2 rounded-full hover:bg-night-800 text-slate-400 hover:text-white transition-colors"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Simple Tab Navigation */}
        {currentView !== 'APPROVAL' && (
          <div className="flex justify-center mb-8">
            <div className="bg-night-800 p-1 rounded-2xl flex gap-1 border border-night-700">
              <button 
                onClick={() => setCurrentView('LIBRARY')}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${currentView === 'LIBRARY' ? 'bg-night-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {t.nav.library}
              </button>
              <button 
                onClick={() => setCurrentView('CREATE_MODE_SELECTION')}
                className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${currentView.startsWith('CREATE') ? 'bg-night-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {t.nav.create}
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        <div className="animate-in fade-in duration-500">
          {currentView === 'LIBRARY' && renderLibrary()}
          {currentView === 'CREATE_MODE_SELECTION' && renderCreateSelection()}
          {currentView === 'CREATE_DAY' && renderCreateForm('DAY')}
          {currentView === 'CREATE_THEME' && renderCreateForm('THEME')}
          {currentView === 'APPROVAL' && renderApproval()}
          {currentView === 'SETTINGS' && (
            <div className="max-w-2xl mx-auto pb-20">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="secondary" size="sm" onClick={() => setCurrentView('LIBRARY')}>
                  ← {t.nav.back}
                </Button>
                <h2 className="text-2xl font-bold text-white">{t.settings.title}</h2>
              </div>
              
              <div className="space-y-8">
                <VoiceProfileManager lang={lang} />
                
                {/* Placeholder for other settings */}
                <div className="bg-night-800 rounded-3xl p-6 border border-night-700 opacity-50 pointer-events-none">
                    <h3 className="text-xl font-bold text-white">Subscription</h3>
                    <p className="text-slate-400">Manage your subscription plan (Coming Soon)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Player */}
      <AudioPlayer 
        story={activeStory} 
        onClose={() => setActiveStory(null)} 
        voiceName="Dad (Cloned Profile)" 
        lang={lang}
      />

      {/* Security Gate Modal */}
      {isParentGateOpen && (
        <ParentalGate 
          onUnlock={handleParentUnlock} 
          onCancel={() => {
            setIsParentGateOpen(false);
            setPendingParentAction(null);
          }} 
          lang={lang}
        />
      )}
    </div>
  );
};

export default App;