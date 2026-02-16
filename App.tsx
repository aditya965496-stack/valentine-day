
import React, { useState, useEffect, useRef } from 'react';
import { ValentineDay, VALENTINE_WEEK, GreetingState, GreetingTheme, THEMES } from './types';
import ValentineBackground from './components/ValentineBackground';
import GreetingCard from './components/GreetingCard';
import { generateValentineContent, generateRomanticAudio, decode, decodeAudioData } from './services/gemini';

const BACKGROUND_MUSIC_URL = 'https://www.chosic.com/wp-content/uploads/2021/04/Warm-Memories-Emotional-Inspiring-Piano.mp3';

const App: React.FC = () => {
  const [state, setState] = useState<GreetingState>({
    partnerName: '',
    selectedDay: ValentineDay.VALENTINE,
    theme: GreetingTheme.CLASSIC,
    quote: '',
    wish: '',
    loading: false,
    isAudioPlaying: false
  });

  const [generated, setGenerated] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    // 1. Check for incoming shared link data in URL
    const params = new URLSearchParams(window.location.search);
    const p = params.get('p');
    const d = params.get('d') as ValentineDay;
    const t = params.get('t') as GreetingTheme;
    const q = params.get('q');
    const w = params.get('w');

    if (p && d && t && q && w) {
      setState(prev => ({
        ...prev,
        partnerName: p,
        selectedDay: d,
        theme: t,
        quote: q,
        wish: w
      }));
      setGenerated(true);
      return;
    }

    // 2. If no shared link, attempt auto-detect current Valentine week day
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDate = today.getDate();

    if (currentMonth === 2) {
      const dayMatch = VALENTINE_WEEK.find(v => v.date === `Feb ${currentDate}`);
      if (dayMatch) {
        setState(prev => ({ ...prev, selectedDay: dayMatch.day }));
      }
    }

    // Preload background music
    preloadBackgroundMusic();

    return () => {
      stopAllAudio();
    };
  }, []);

  const preloadBackgroundMusic = async () => {
    try {
      const response = await fetch(BACKGROUND_MUSIC_URL);
      const arrayBuffer = await response.arrayBuffer();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const decodedData = await audioContextRef.current.decodeAudioData(arrayBuffer);
      musicBufferRef.current = decodedData;
    } catch (error) {
      console.warn("Failed to preload background music:", error);
    }
  };

  const stopAllAudio = () => {
    activeSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    activeSourcesRef.current = [];
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.partnerName) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const content = await generateValentineContent(state.partnerName, state.selectedDay);
      // Automatically select a random theme
      const randomThemeInfo = THEMES[Math.floor(Math.random() * THEMES.length)];
      
      setState(prev => ({
        ...prev,
        theme: randomThemeInfo.id,
        quote: content.quote,
        wish: content.wish,
        loading: false
      }));
      setGenerated(true);
    } catch (error) {
      console.error("Generation failed", error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleShare = async () => {
    const shareUrl = new URL(window.location.origin + window.location.pathname);
    shareUrl.searchParams.set('p', state.partnerName);
    shareUrl.searchParams.set('d', state.selectedDay);
    shareUrl.searchParams.set('t', state.theme);
    shareUrl.searchParams.set('q', state.quote);
    shareUrl.searchParams.set('w', state.wish);

    const fullUrl = shareUrl.toString();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `A Valentine Surprise for ${state.partnerName}`,
          text: `Check out this romantic message for ${state.selectedDay}!`,
          url: fullUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const playRomanticAudio = async () => {
    if (state.isAudioPlaying) return;
    
    setState(prev => ({ ...prev, isAudioPlaying: true }));
    stopAllAudio();
    
    try {
      const voiceText = `${state.quote}. Happy ${state.selectedDay}, ${state.partnerName}. With love, your Valentine.`;
      const audioBase64 = await generateRomanticAudio(voiceText);
      
      if (!audioBase64) {
        setState(prev => ({ ...prev, isAudioPlaying: false }));
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Decode voice
      const audioData = decode(audioBase64);
      const voiceBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
      
      // Setup Voice Source
      const voiceSource = ctx.createBufferSource();
      voiceSource.buffer = voiceBuffer;
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 1.0;
      voiceSource.connect(voiceGain);
      voiceGain.connect(ctx.destination);
      
      // Setup Background Music Source
      let musicSource: AudioBufferSourceNode | null = null;
      let musicGain: GainNode | null = null;
      
      if (musicBufferRef.current) {
        musicSource = ctx.createBufferSource();
        musicSource.buffer = musicBufferRef.current;
        musicSource.loop = true;
        musicGain = ctx.createGain();
        // Start music softly
        musicGain.gain.setValueAtTime(0, ctx.currentTime);
        musicGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.5);
        musicSource.connect(musicGain);
        musicGain.connect(ctx.destination);
      }

      const onFinished = () => {
        if (musicGain && ctx) {
          musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
          musicGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
          setTimeout(() => {
            try { musicSource?.stop(); } catch(e) {}
            setState(prev => ({ ...prev, isAudioPlaying: false }));
          }, 2000);
        } else {
          setState(prev => ({ ...prev, isAudioPlaying: false }));
        }
      };

      voiceSource.onended = onFinished;
      
      activeSourcesRef.current = [];
      if (musicSource) activeSourcesRef.current.push(musicSource);
      activeSourcesRef.current.push(voiceSource);

      musicSource?.start(0);
      voiceSource.start(ctx.currentTime + 0.5); // Slight delay for voice to let music breathe
      
    } catch (error) {
      console.error("Audio playback error", error);
      setState(prev => ({ ...prev, isAudioPlaying: false }));
    }
  };

  const reset = () => {
    stopAllAudio();
    // Clear URL params on reset
    window.history.replaceState({}, document.title, window.location.pathname);
    setGenerated(false);
    setState(prev => ({ ...prev, quote: '', wish: '', isAudioPlaying: false }));
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <ValentineBackground />

      <div className="z-10 w-full max-w-4xl">
        {!generated ? (
          <div className="glass-effect p-8 rounded-3xl shadow-xl w-full max-w-md mx-auto animate-fadeIn border border-white/40">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-rose-600 mb-2 text-center py-2">
                VALENTINE WEEK
              </h1>
              <p className="text-rose-400 font-romantic text-xl text-center">Create a romantic surprise</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-2 text-center uppercase tracking-widest opacity-60">
                  Partner's Name
                </label>
                <input
                  type="text"
                  value={state.partnerName}
                  onChange={(e) => setState(prev => ({ ...prev, partnerName: e.target.value }))}
                  placeholder="e.g. My Dearest"
                  className="w-full px-4 py-3 rounded-xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none transition-all bg-white/60 text-center text-xl text-rose-700 placeholder:text-rose-200 placeholder:text-base font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-700 mb-2 text-center uppercase tracking-widest opacity-60">
                  Choose the Occasion
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border-2 border-rose-50 rounded-xl bg-white/30">
                  {VALENTINE_WEEK.map((item) => (
                    <button
                      key={item.day}
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, selectedDay: item.day }))}
                      className={`px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition-all ${
                        state.selectedDay === item.day
                          ? `${item.color} text-white font-bold scale-105 shadow-md`
                          : 'bg-white/50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span className="truncate">{item.day}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-rose-200/50 transition-all transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3"
                >
                  {state.loading ? (
                    <>
                      <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Working Magic...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">✨ Generate Romantic Wish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <GreetingCard
            partnerName={state.partnerName}
            day={state.selectedDay}
            theme={state.theme}
            quote={state.quote}
            wish={state.wish}
            onReset={reset}
            onPlayAudio={playRomanticAudio}
            isAudioPlaying={state.isAudioPlaying}
            onShare={handleShare}
          />
        )}
      </div>

      <footer className="fixed bottom-4 text-rose-500/60 font-romantic text-base z-10">
        Made with ❤️ for Valentine's Week
      </footer>
    </div>
  );
};

export default App;
