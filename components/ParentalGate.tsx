import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { Button } from './Button';
import { translations } from '../translations';

interface ParentalGateProps {
  onUnlock: () => void;
  onCancel: () => void;
  lang?: 'en' | 'ru';
}

export const ParentalGate: React.FC<ParentalGateProps> = ({ onUnlock, onCancel, lang = 'en' }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const t = translations[lang];

  const handleNumClick = (num: number) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleSubmit = () => {
    if (pin === '1234') { // Mock PIN
      onUnlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-night-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-night-800 border border-night-700 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-float">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-warm-500">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">{t.gate.title}</h2>
          <p className="text-slate-400 mt-2">{t.gate.desc}</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all ${
                i < pin.length 
                  ? 'bg-warm-500 scale-125' 
                  : 'bg-slate-700'
              } ${error ? 'animate-pulse bg-red-500' : ''}`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              className="h-16 rounded-2xl bg-night-700 hover:bg-night-600 text-2xl font-bold text-white transition-colors"
            >
              {num}
            </button>
          ))}
          <div className="col-start-2">
            <button
              onClick={() => handleNumClick(0)}
              className="w-full h-16 rounded-2xl bg-night-700 hover:bg-night-600 text-2xl font-bold text-white transition-colors"
            >
              0
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            {t.gate.cancel}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={pin.length !== 4} className="flex-1">
            {t.gate.unlock}
          </Button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">{t.gate.defaultPin}</p>
      </div>
    </div>
  );
};