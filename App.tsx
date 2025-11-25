import React, { useState, useEffect } from 'react';
import { ApiKeySelector } from './components/ApiKeySelector';
import { GenerationForm } from './components/GenerationForm';
import { VideoResult } from './components/VideoResult';
import { generateVideo } from './services/gemini';
import { AppState, GeneratedVideo, GenerationRequest } from './types';
import { Sparkles, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [resultVideo, setResultVideo] = useState<GeneratedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial check for API Key presence
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleKeySelected = () => {
    setHasApiKey(true);
    setError(null);
  };

  const handleGenerate = async (request: GenerationRequest) => {
    setAppState(AppState.GENERATING);
    setError(null);
    setResultVideo(null);

    try {
      const video = await generateVideo(request);
      setResultVideo(video);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
      setAppState(AppState.ERROR);
      
      // If the error implies the key is invalid/missing, reset key state
      if (err.message && (err.message.includes("API Key") || err.message.includes("Requested entity was not found"))) {
        setHasApiKey(false);
      }
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResultVideo(null);
    setError(null);
  };

  // Background ambient effect
  const AmbientBackground = () => (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center">
      <AmbientBackground />
      
      <header className="w-full max-w-6xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 tracking-tight">
            Lumina
          </h1>
        </div>
        {hasApiKey && (
           <div className="text-xs font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900/50">
             Veo 3.1 Active
           </div>
        )}
      </header>

      <main className="w-full max-w-4xl px-6 pb-12 flex-1 flex flex-col justify-center">
        {!hasApiKey ? (
          <ApiKeySelector onKeySelected={handleKeySelected} />
        ) : (
          <div className="space-y-8">
            <div className={`text-center space-y-2 mb-8 ${appState === AppState.COMPLETE ? 'hidden' : 'block'}`}>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                Turn imagination into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">reality</span>
              </h2>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                Generate stunning videos from text and images using Google's state-of-the-art Veo model.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-200 animate-fade-in text-sm mb-6">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p>{error}</p>
              </div>
            )}

            {appState === AppState.COMPLETE && resultVideo && (
               <div className="mb-8">
                  <VideoResult video={resultVideo} onReset={resetApp} />
               </div>
            )}

            {/* Generation Form - Keep mounted to preserve state */}
            <div className={`relative ${appState === AppState.COMPLETE ? 'hidden' : 'block'}`}>
                {appState === AppState.GENERATING && (
                    <div className="absolute inset-0 z-10 bg-zinc-950/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                        <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-white mb-2">Creating your masterpiece</h3>
                        <p className="text-zinc-400 max-w-xs animate-pulse">
                            This typically takes 1-2 minutes. The AI is dreaming up frames and rendering motion...
                        </p>
                    </div>
                )}
                <GenerationForm onSubmit={handleGenerate} isGenerating={appState === AppState.GENERATING} />
            </div>
          </div>
        )}
      </main>

      <footer className="w-full py-6 text-center text-zinc-600 text-sm">
        <p>Powered by Google Veo & Gemini API</p>
      </footer>
    </div>
  );
};

export default App;