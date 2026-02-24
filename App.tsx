import React, { useState, useRef, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { fetchVerses } from './services/geminiService';
import { VerseResponse, VerseResult } from './types';
import { FEELING_CATEGORIES } from './constants';
import { Button } from './components/Button';
import { Chip } from './components/Chip';
import { VerseCard } from './components/VerseCard';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Auth } from './components/Auth';
import { SettingsModal } from './components/SettingsModal';
import { UpdatePassword } from './components/UpdatePassword';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // App State
  const [inputText, setInputText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [verseCount, setVerseCount] = useState<number>(2); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<VerseResponse | null>(null);

  // Refs for scrolling
  const resultsRef = useRef<HTMLDivElement>(null);
  const feelingsRef = useRef<HTMLDivElement>(null);

  // Initialize Auth & Handle Redirect Errors
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Check for URL errors (e.g. expired magic links)
    const hash = window.location.hash;
    if (hash && hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const errorDescription = params.get('error_description');
      const errorCode = params.get('error_code');
      
      if (errorDescription) {
        let userMessage = errorDescription.replace(/\+/g, ' ');
        if (errorCode === 'otp_expired') {
          userMessage = "That login link has expired. Please sign in again to get a new one.";
        }
        setError(userMessage);
        // Clean URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }

    // 2. Check Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 3. Listen for Auth Changes (including Password Recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handlers
  const handleSignOut = async () => {
    setShowSettings(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      // Force local state clear to ensure UI updates even if network fails
      setSession(null);
      setInputText('');
      setResponse(null);
      setSelectedFeelings([]);
      setActiveCategory(null);
    }
  };

  const toggleFeeling = (id: string) => {
    setSelectedFeelings(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id) 
        : [...prev, id]
    );
  };

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryId);
      setTimeout(() => {
        feelingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && selectedFeelings.length === 0) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await fetchVerses(inputText, selectedFeelings, verseCount);
      setResponse(data);
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError("We couldn't reach the guide right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSelectedFeelings([]);
    setActiveCategory(null);
    setResponse(null);
    setError(null);
  };

  // Helper to get color classes for category buttons
  const getCategoryStyles = (baseColor: string, isActive: boolean) => {
    const styles = {
      sky: isActive ? 'bg-sky-400 text-white border-sky-500 ring-sky-200' : 'bg-sky-50 text-sky-900 border-sky-100 hover:bg-sky-100',
      teal: isActive ? 'bg-teal-400 text-white border-teal-500 ring-teal-200' : 'bg-teal-50 text-teal-900 border-teal-100 hover:bg-teal-100',
      violet: isActive ? 'bg-violet-400 text-white border-violet-500 ring-violet-200' : 'bg-violet-50 text-violet-900 border-violet-100 hover:bg-violet-100',
      blue: isActive ? 'bg-blue-400 text-white border-blue-500 ring-blue-200' : 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100',
      stone: isActive ? 'bg-stone-800 text-white' : 'bg-white', // fallback
    };
    return styles[baseColor as keyof typeof styles] || styles.stone;
  };

  // 1. Missing Config State
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-stone-800 relative p-6">
        <InteractiveBackground />
        <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-float border border-stone-200 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-stone-900 mb-3">Setup Required</h2>
          <p className="text-stone-500 mb-6 leading-relaxed">
            To enable the secure login gate, this app requires a Supabase connection.
          </p>
          <div className="text-left bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Missing Environment Variables</p>
            <code className="block text-xs font-mono text-rose-600 break-all">SUPABASE_URL</code>
            <code className="block text-xs font-mono text-rose-600 break-all mt-1">SUPABASE_ANON_KEY</code>
          </div>
          <p className="text-xs text-stone-400">
            Please add these to your environment configuration to continue.
          </p>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center font-sans text-stone-800 relative">
             <InteractiveBackground />
             <div className="animate-pulse flex flex-col items-center">
                 <div className="h-4 w-32 bg-stone-200 rounded mb-4"></div>
                 <div className="h-4 w-4 rounded-full bg-stone-300"></div>
             </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800 pb-20 relative">
      <InteractiveBackground />
      
      {/* Header */}
      <header className="w-full py-12 md:py-20 px-6 flex justify-center animate-fade-in-up relative z-10">
        <div className="text-center relative w-full max-w-4xl mx-auto">
          {session && (
             <div className="absolute top-0 right-0 z-50 p-4">
               <button 
                 onClick={() => setShowSettings(true)}
                 className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-400 hover:text-stone-800 uppercase tracking-widest transition-colors rounded-full hover:bg-white/50"
               >
                 <span className="hidden md:inline">Settings</span>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.157.92c.44.085.86.237 1.248.448l.857-.384c.463-.207 1.01-.065 1.326.342l.8.997c.316.394.305.962-.05 1.353l-.613.682c.075.44.075.894 0 1.334l.613.682c.355.39.366.96.05 1.353l-.8.997c-.317.408-.863.55-1.326.342l-.857-.384c-.388.21-.808.362-1.248.448l-.157.92c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.157-.92c-.44-.085-.86-.237-1.248-.448l-.857.384c-.463.207-1.01.065-1.326-.342l-.8-.997c-.316-.394-.305-.962.05-1.353l.613-.682a9.23 9.23 0 010-1.334l-.613-.682c-.355-.39-.366-.96-.05-1.353l.8-.997c.317-.408.863-.55 1.326-.342l.857.384c.388-.21.808-.362 1.248-.448l.157-.92z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </button>
             </div>
          )}
          <h1 className="font-display text-5xl md:text-7xl text-stone-900 tracking-tighter mb-4 drop-shadow-sm">
            MY SHALOM
          </h1>
          <p className="text-stone-500 text-base md:text-lg max-w-md mx-auto font-medium tracking-tight">
            God’s wisdom, right where you are
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-2xl mx-auto px-6 flex flex-col relative z-10">
        
        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 p-6 bg-rose-50 text-rose-800 rounded-2xl text-center text-sm font-medium border border-rose-100 animate-fade-in-up shadow-sm">
             <div className="flex items-center justify-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span className="font-bold">Notice</span>
             </div>
             {error}
          </div>
        )}

        {!session ? (
            <Auth />
        ) : (
            <>
                {/* Modals */}
                <SettingsModal 
                  isOpen={showSettings} 
                  onClose={() => setShowSettings(false)} 
                  onSignOut={handleSignOut}
                  userEmail={session.user.email}
                />

                {isRecoveryMode && (
                  <UpdatePassword onSuccess={() => setIsRecoveryMode(false)} />
                )}

                {/* Input Card */}
                <div className={`transition-all duration-700 ease-in-out transform ${response ? 'opacity-60 scale-95 grayscale-[0.3]' : 'opacity-100 scale-100'}`}>
                <div className="bg-white/80 backdrop-blur-xl p-6 md:p-10 rounded-4xl shadow-float border border-white/60">
                    <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* 1. Free Text Input */}
                    <div className="relative group">
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 ml-1">
                        What's on your heart?
                        </label>
                        <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="I'm feeling..."
                        className="w-full h-32 p-6 rounded-3xl border border-stone-100 bg-stone-50/50 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-200 transition-all resize-none text-lg leading-relaxed shadow-inner"
                        />
                    </div>

                    {/* 2. Category Selection */}
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 ml-1">
                        Or choose a vibe
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                        {FEELING_CATEGORIES.map(category => {
                            const isActive = activeCategory === category.id;
                            const isDimmed = activeCategory && !isActive; 
                            const colorStyles = getCategoryStyles(category.baseColor, isActive);
                            
                            return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryClick(category.id)}
                                className={`
                                flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-300 border-2
                                ${colorStyles}
                                ${isActive ? 'shadow-lg scale-[1.02] ring-4 ring-opacity-20 border-transparent' : 'border-transparent'}
                                ${isDimmed ? 'opacity-50 grayscale-[0.3]' : 'opacity-100'}
                                `}
                            >
                                <span className="font-bold text-lg md:text-xl text-center block mb-2 leading-tight">
                                {category.label.split('•')[0].trim()}
                                </span>
                                <span className={`text-xs text-center font-medium opacity-80 uppercase tracking-wider`}>
                                {category.label.split('•')[1]?.trim()}
                                </span>
                            </button>
                            );
                        })}
                        </div>
                    </div>

                    {/* 3. Specific Feelings */}
                    <div 
                        ref={feelingsRef}
                        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${activeCategory ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        {activeCategory && (
                        <div className="bg-stone-50/50 rounded-3xl p-6 border border-stone-100">
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                            Tap to select
                            </label>
                            <div className="flex flex-wrap gap-2">
                            {FEELING_CATEGORIES.find(c => c.id === activeCategory)?.feelings.map(feeling => (
                                <Chip
                                key={feeling.id}
                                label={feeling.label}
                                selected={selectedFeelings.includes(feeling.id)}
                                onClick={() => toggleFeeling(feeling.id)}
                                baseColor={FEELING_CATEGORIES.find(c => c.id === activeCategory)?.baseColor}
                                />
                            ))}
                            </div>
                        </div>
                        )}
                        
                        {/* Selected summary if category closed or switched */}
                        {selectedFeelings.length > 0 && !activeCategory && (
                        <div className="mt-4 pt-4">
                            <div className="flex flex-wrap gap-2">
                                {selectedFeelings.map(id => {
                                // Find label and color for this feeling ID
                                let label = id;
                                let baseColor = 'stone';
                                FEELING_CATEGORIES.forEach(cat => {
                                    const f = cat.feelings.find(i => i.id === id);
                                    if (f) {
                                    label = f.label;
                                    baseColor = cat.baseColor;
                                    }
                                });
                                return (
                                    <span key={id} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-stone-800 text-white`}>
                                    {label}
                                    <button type="button" onClick={() => toggleFeeling(id)} className="ml-2 text-stone-400 hover:text-white focus:outline-none">
                                        &times;
                                    </button>
                                    </span>
                                )
                                })}
                            </div>
                        </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-6 pt-2">
                        {/* Verse Count */}
                        <div className="flex items-center justify-between bg-stone-50 p-2 rounded-full border border-stone-100 max-w-xs mx-auto">
                            {[1, 2, 3].map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setVerseCount(num)}
                                className={`
                                flex-1 py-2 rounded-full text-sm font-bold transition-all duration-300
                                ${verseCount === num 
                                    ? 'bg-white text-stone-900 shadow-md transform scale-105' 
                                    : 'text-stone-400 hover:text-stone-600'
                                }
                                `}
                            >
                                {num} Verse{num > 1 ? 's' : ''}
                            </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                        <Button 
                            type="submit" 
                            disabled={!inputText && selectedFeelings.length === 0}
                            isLoading={loading}
                            className="w-full text-lg py-4 shadow-glow"
                        >
                            {loading ? 'Reflecting...' : 'Find Wisdom'}
                        </Button>
                        
                        {(inputText || selectedFeelings.length > 0 || activeCategory) && (
                            <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={handleClear}
                            className="text-stone-400 hover:text-stone-600 text-sm"
                            >
                            Clear all
                            </Button>
                        )}
                        </div>
                    </div>
                    </form>
                </div>
                </div>

                {/* Results Section */}
                {response && (
                <div ref={resultsRef} className="mt-20">
                    <div className="text-center mb-16 animate-fade-in-up">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-bold uppercase tracking-widest mb-6">
                        For You
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl text-stone-900 leading-tight mb-4">
                        {response.title}
                    </h2>
                    <p className="text-stone-500 italic font-serif">
                        Because you're feeling {response.interpreted_feelings.join(' & ')}
                    </p>
                    </div>

                    <div className="space-y-12">
                    {response.results.map((verse: VerseResult, index: number) => (
                        <VerseCard key={index} verse={verse} index={index} />
                    ))}
                    </div>
                </div>
                )}
            </>
        )}

        {/* Static Footer */}
        <div className="mt-20 pt-10 pb-12 border-t border-stone-200/50 text-center z-10 flex flex-col items-center gap-6">
             <p className="text-stone-500 text-base font-serif italic">
                Crafted by <a href="https://www.linkedin.com/in/zeniaadiwijaya/" target="_blank" rel="noreferrer" className="font-semibold text-stone-800 hover:text-stone-900 not-italic transition-colors border-b border-stone-300 hover:border-stone-500">zeniaadi</a>, with care — and a cup of coffee.
            </p>
            
            <div className="bg-white/60 hover:bg-white/90 transition-all duration-300 border border-white/60 rounded-2xl px-8 py-5 shadow-float backdrop-blur-md max-w-xl mx-auto transform hover:-translate-y-1">
                <p className="text-stone-700 text-sm md:text-base font-medium leading-relaxed">
                    This app is freely offered. If it’s meaningful to you, you’re welcome to <a href="https://www.linkedin.com/in/zeniaadiwijaya/" target="_blank" rel="noreferrer" className="text-sky-700 font-bold hover:text-sky-900 hover:underline decoration-2 underline-offset-2 transition-all">connect on LinkedIn</a> or <a href="https://donorbox.org/buy-zen-a-coffee" target="_blank" rel="noreferrer" className="text-sky-700 font-bold hover:text-sky-900 hover:underline decoration-2 underline-offset-2 transition-all">contribute a coffee</a>.
                </p>
            </div>
        </div>
      </main>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;