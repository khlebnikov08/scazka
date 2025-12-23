import React, { useState } from 'react';
import { Mic, Activity, AudioWaveform, Plus, Info, AlertTriangle, Check, RotateCcw, User } from 'lucide-react';
import { VoiceProfile } from '../types';
import { MOCK_VOICE_PROFILES } from '../constants';
import { Button } from './Button';
import { translations } from '../translations';

interface VoiceProfileManagerProps {
  lang?: 'en' | 'ru';
}

export const VoiceProfileManager: React.FC<VoiceProfileManagerProps> = ({ lang = 'en' }) => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>(MOCK_VOICE_PROFILES);
  const t = translations[lang];
  
  // Recording Flow State
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null); // If null, we are creating new
  const [newProfileName, setNewProfileName] = useState('');
  const [recordingState, setRecordingState] = useState<'idle' | 'name-input' | 'instruction' | 'recording' | 'processing'>('idle');

  const startReRecord = (id: string) => {
    setActiveProfileId(id);
    setNewProfileName('');
    setRecordingState('instruction');
  };

  const startNewProfile = () => {
    setActiveProfileId(null);
    setNewProfileName('');
    setRecordingState('name-input');
  };

  const cancelRecording = () => {
    setActiveProfileId(null);
    setNewProfileName('');
    setRecordingState('idle');
  };

  const submitName = () => {
    if (newProfileName.trim()) {
      setRecordingState('instruction');
    }
  };

  const confirmRecording = () => {
    setRecordingState('recording');
    
    // Simulate 3 seconds of recording
    setTimeout(() => {
      setRecordingState('processing');
      
      // Simulate 2 seconds of processing then update/create
      setTimeout(() => {
        const randomMetrics = {
          clarity: Math.min(100, 85 + Math.floor(Math.random() * 15)),
          stability: Math.min(100, 80 + Math.floor(Math.random() * 20)),
          noiseLevel: 'Low' as const
        };

        if (activeProfileId) {
            // Update existing
            setProfiles(prev => prev.map(p => {
                if (p.id === activeProfileId) {
                return {
                    ...p,
                    status: 'ready',
                    lastUpdated: Date.now(),
                    metrics: randomMetrics
                };
                }
                return p;
            }));
        } else {
            // Create New
            const newProfile: VoiceProfile = {
                id: Date.now().toString(),
                name: newProfileName || 'New Voice',
                status: 'ready',
                metrics: randomMetrics,
                lastUpdated: Date.now()
            };
            setProfiles(prev => [...prev, newProfile]);
        }

        setRecordingState('idle');
        setActiveProfileId(null);
        setNewProfileName('');
      }, 2000);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500';
    if (score >= 70) return 'text-warm-400 bg-warm-500'; 
    return 'text-red-400 bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return t.settings.excellent;
    if (score >= 70) return t.settings.good;
    return t.settings.improve;
  };

  const getNoiseColor = (level: string) => {
    if (level === 'Low') return 'text-green-400';
    if (level === 'Medium') return 'text-warm-400';
    return 'text-red-400';
  };

  // Helper to map noise level string to translation
  const getNoiseLabel = (level: string) => {
    if (level === 'Low') return t.settings.low;
    if (level === 'Medium') return t.settings.med;
    return t.settings.high;
  };

  return (
    <div className="bg-night-800 rounded-3xl p-6 border border-night-700 animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Mic className="text-warm-500" size={24} />
          {t.settings.profiles}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={startNewProfile}
          className="text-warm-500 hover:text-warm-400"
        >
          <Plus size={18} className="mr-1" /> {t.settings.newProfile}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-6">
        {profiles.map(profile => (
          <div key={profile.id} className="bg-night-900 rounded-xl p-5 border border-night-700 flex flex-col gap-5 shadow-inner transition-all hover:border-night-600">
             {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-white flex items-center gap-2">
                  {profile.name}
                  {profile.status === 'ready' && <Check size={14} className="text-green-500" />}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {t.settings.lastUpdated}: {new Date(profile.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-2 py-1 bg-night-800 rounded-lg border border-night-800">
                    <span className={`w-2 h-2 rounded-full ${profile.status === 'ready' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{profile.status}</span>
                 </div>
                 
                 <button 
                   onClick={() => startReRecord(profile.id)}
                   className="p-2 bg-night-800 hover:bg-night-700 rounded-lg text-slate-400 hover:text-white transition-colors border border-night-700 group relative"
                   title={t.settings.reRecord}
                 >
                   <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" />
                 </button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Clarity Metric */}
              <div className="bg-night-800 p-3 rounded-lg border border-night-700/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><Activity size={14} /> {t.settings.clarity}</span>
                    <Info size={12} className="opacity-50" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div className={`text-2xl font-mono ${getScoreColor(profile.metrics.clarity).split(' ')[0]}`}>
                      {profile.metrics.clarity}%
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      {getScoreLabel(profile.metrics.clarity)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(profile.metrics.clarity).split(' ')[1]}`} 
                      style={{ width: `${profile.metrics.clarity}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Stability Metric */}
              <div className="bg-night-800 p-3 rounded-lg border border-night-700/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1"><AudioWaveform size={14} /> {t.settings.stability}</span>
                    <Info size={12} className="opacity-50" />
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <div className={`text-2xl font-mono ${getScoreColor(profile.metrics.stability).split(' ')[0]}`}>
                      {profile.metrics.stability}%
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                      {getScoreLabel(profile.metrics.stability)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(profile.metrics.stability).split(' ')[1]}`} 
                      style={{ width: `${profile.metrics.stability}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* Noise Metric */}
              <div className="bg-night-800 p-3 rounded-lg border border-night-700/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                     <span className="flex items-center gap-1"><Mic size={14} /> {t.settings.noise}</span>
                     {profile.metrics.noiseLevel !== 'Low' && <AlertTriangle size={12} className="text-red-400" />}
                  </div>
                  <div className={`text-2xl font-mono font-medium ${getNoiseColor(profile.metrics.noiseLevel)}`}>
                    {getNoiseLabel(profile.metrics.noiseLevel)}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mt-auto">
                     <div className={`flex-1 rounded-l-full ${['Low', 'Medium', 'High'].includes(profile.metrics.noiseLevel) ? 'bg-green-500' : 'bg-night-900'}`} />
                     <div className={`flex-1 ${['Medium', 'High'].includes(profile.metrics.noiseLevel) ? 'bg-warm-500' : 'bg-night-900'}`} />
                     <div className={`flex-1 rounded-r-full ${['High'].includes(profile.metrics.noiseLevel) ? 'bg-red-500' : 'bg-night-900'}`} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-night-700/50">
              <div className="flex items-center justify-between gap-4">
                 <div className="text-xs text-slate-500 flex-1">
                    {t.settings.hint}
                 </div>
                 <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => startReRecord(profile.id)}
                    className="min-w-[140px]"
                 >
                    {t.settings.reRecord}
                 </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Recording Overlay */}
      {recordingState !== 'idle' && (
        <div className="absolute inset-0 bg-night-900/95 backdrop-blur-sm flex items-center justify-center p-6 z-10 animate-in fade-in">
           <div className="max-w-md w-full text-center space-y-6">
              
              {/* Step 1: Name Input (Only for new profiles) */}
              {recordingState === 'name-input' && (
                <>
                   <div className="w-16 h-16 rounded-full bg-night-800 flex items-center justify-center mx-auto mb-4 border border-night-700">
                     <User size={32} className="text-warm-500" />
                   </div>
                   <h3 className="text-xl font-bold text-white">{t.recording.whoIsReading}</h3>
                   <p className="text-slate-400">
                     {t.recording.nameDesc}
                   </p>
                   <input 
                      type="text"
                      autoFocus
                      className="w-full bg-night-800 border border-night-700 rounded-xl p-4 text-white text-center text-lg focus:border-warm-500 outline-none"
                      placeholder={t.recording.namePlaceholder}
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitName()}
                   />
                   <div className="flex gap-3 mt-4">
                     <Button variant="ghost" onClick={cancelRecording} className="flex-1">{t.recording.cancel}</Button>
                     <Button onClick={submitName} disabled={!newProfileName.trim()} className="flex-1">{t.recording.next}</Button>
                   </div>
                </>
              )}

              {/* Step 2: Instructions */}
              {recordingState === 'instruction' && (
                <>
                   <div className="w-16 h-16 rounded-full bg-night-800 flex items-center justify-center mx-auto mb-4 border border-night-700">
                     <Mic size={32} className="text-warm-500" />
                   </div>
                   <h3 className="text-xl font-bold text-white">
                     {activeProfileId ? t.recording.retrain : t.recording.calibrate}
                   </h3>
                   <p className="text-slate-400">
                     {t.recording.instruction}
                   </p>
                   <div className="bg-night-800 p-6 rounded-2xl border border-night-700 italic text-slate-200">
                     "{t.recording.phrase}"
                   </div>
                   <div className="flex gap-3">
                     <Button variant="ghost" onClick={cancelRecording} className="flex-1">{t.recording.cancel}</Button>
                     <Button onClick={confirmRecording} className="flex-1">{t.recording.start}</Button>
                   </div>
                </>
              )}

              {/* Step 3: Recording Animation */}
              {recordingState === 'recording' && (
                <>
                    <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></span>
                        <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center relative z-10 shadow-lg shadow-red-500/30">
                            <Mic size={32} className="text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white animate-pulse">{t.recording.recording}</h3>
                    <p className="text-slate-400">{t.recording.readNow}</p>
                    <div className="w-full h-12 flex items-center justify-center gap-1">
                        {[...Array(5)].map((_,i) => (
                             <div key={i} className="w-1 bg-slate-500 animate-pulse-slow" style={{height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s`}}></div>
                        ))}
                    </div>
                </>
              )}

              {/* Step 4: Processing Animation */}
              {recordingState === 'processing' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-night-800 flex items-center justify-center mx-auto mb-4 border border-night-700">
                        <Activity size={32} className="text-warm-500 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{t.recording.analyzing}</h3>
                    <p className="text-slate-400">{t.recording.metricsDesc}</p>
                </>
              )}

           </div>
        </div>
      )}

    </div>
  );
};