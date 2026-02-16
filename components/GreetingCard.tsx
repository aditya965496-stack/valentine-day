
import React, { useState } from 'react';
import { ValentineDay, VALENTINE_WEEK, GreetingTheme, THEMES } from '../types';

interface GreetingCardProps {
  partnerName: string;
  day: ValentineDay;
  theme: GreetingTheme;
  quote: string;
  wish: string;
  onReset: () => void;
  onPlayAudio: () => void;
  isAudioPlaying: boolean;
  onShare: () => void;
}

const GreetingCard: React.FC<GreetingCardProps> = ({
  partnerName,
  day,
  theme,
  quote,
  wish,
  onReset,
  onPlayAudio,
  isAudioPlaying,
  onShare
}) => {
  const dayInfo = VALENTINE_WEEK.find(d => d.day === day);
  const themeInfo = THEMES.find(t => t.id === theme) || THEMES[0];
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const isDarkTheme = theme === GreetingTheme.PASSION || theme === GreetingTheme.MIDNIGHT || theme === GreetingTheme.ELEGANT;

  const handleShareClick = () => {
    onShare();
    // Simple UI feedback if Web Share isn't available and we copy to clipboard
    if (!navigator.share) {
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }
  };

  return (
    <div className="relative max-w-lg w-full p-8 mx-auto animate-fadeIn">
      <div className={`rounded-3xl p-1 shadow-2xl bg-gradient-to-br ${themeInfo.class}`}>
        <div className={`${isDarkTheme ? 'bg-black/20' : 'bg-white/40'} backdrop-blur-md rounded-[calc(1.5rem-2px)] p-8 text-center relative overflow-hidden border border-white/30 h-full`}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 p-4 text-4xl opacity-20">🌹</div>
          <div className="absolute bottom-0 left-0 p-4 text-4xl opacity-20">💖</div>
          
          {theme === GreetingTheme.VINTAGE && (
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>
          )}

          <div className="mb-6">
            <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-bold uppercase tracking-widest ${dayInfo?.color || 'bg-rose-500 shadow-md'}`}>
              {dayInfo?.date} • {day}
            </span>
          </div>

          <h2 className={`text-4xl font-elegant mb-6 drop-shadow-sm ${themeInfo.text}`}>
            To {partnerName}
          </h2>

          <div className="mb-8">
            <p className={`text-xl font-romantic leading-relaxed italic mb-4 ${isDarkTheme ? 'text-pink-100' : 'text-gray-700'}`}>
              "{quote}"
            </p>
            <div className={`h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent ${isDarkTheme ? 'via-pink-400' : 'via-rose-300'} to-transparent`}></div>
          </div>

          <p className={`text-lg mb-10 leading-relaxed font-medium ${isDarkTheme ? 'text-white/90' : 'text-gray-800'}`}>
            {wish}
          </p>

          <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={onPlayAudio}
                disabled={isAudioPlaying}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white shadow-lg transition-all transform active:scale-95 ${
                  isAudioPlaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 hover:-translate-y-1'
                }`}
              >
                {isAudioPlaying ? (
                  <>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                    <span>Playing...</span>
                  </>
                ) : (
                  <>
                    <span>🔊 Listen</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShareClick}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white shadow-lg transition-all transform active:scale-95 bg-blue-500 hover:bg-blue-600 hover:-translate-y-1`}
              >
                <span>{showCopyFeedback ? '✅ Link Copied' : '📤 Share Card'}</span>
              </button>
            </div>

            <button
              onClick={onReset}
              className={`w-full sm:w-auto px-10 py-3 rounded-full border-2 transition-all font-semibold ${
                isDarkTheme 
                  ? 'text-white border-white/50 hover:bg-white/10' 
                  : 'text-rose-600 border-rose-400 hover:bg-rose-50'
              }`}
            >
              Create New
            </button>
          </div>

          <div className={`mt-8 font-romantic text-2xl ${isDarkTheme ? 'text-pink-300' : 'text-rose-400'}`}>
            With Love, Your Valentine
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default GreetingCard;
