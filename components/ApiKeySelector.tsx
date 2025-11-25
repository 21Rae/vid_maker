import React from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // As per instructions, assume success immediately after openSelectKey triggers
        // and avoid race conditions by not waiting for a state change.
        onKeySelected();
      } catch (e) {
        console.error("Failed to open key selector", e);
      }
    } else {
      alert("AI Studio environment not detected. Please run this app within the AI Studio compatible environment.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-8 animate-fade-in">
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mb-6">
          <Key size={32} />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Unlock Veo</h2>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          To generate high-quality videos with Google's Veo model, you need to connect a paid API key from a Google Cloud Project.
        </p>

        <button
          onClick={handleSelectKey}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
        >
          <span>Select Paid API Key</span>
        </button>

        <div className="mt-6 pt-6 border-t border-zinc-800">
            <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-blue-400 flex items-center justify-center gap-1 transition-colors"
            >
                Learn more about billing <ExternalLink size={10} />
            </a>
        </div>
      </div>
    </div>
  );
};