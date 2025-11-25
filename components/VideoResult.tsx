import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, PlayCircle } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoResultProps {
  video: GeneratedVideo;
  onReset: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ video, onReset }) => {
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    // The raw URI from Veo requires the API key appended to it for access.
    // process.env.API_KEY is available in this environment.
    if (video.uri) {
      setVideoUrl(`${video.uri}&key=${process.env.API_KEY}`);
    }
  }, [video.uri]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video bg-black flex items-center justify-center group">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="text-zinc-500 flex flex-col items-center">
              <div className="animate-spin mb-2">
                <RefreshCw size={24} />
              </div>
              <p>Loading video stream...</p>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex-1">
             <h3 className="text-lg font-semibold text-white">Generation Complete</h3>
             <p className="text-zinc-400 text-sm">Your video is ready to view and download.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onReset}
              className="flex-1 sm:flex-none py-2.5 px-4 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              New
            </button>
            
            {videoUrl && (
              <a
                href={videoUrl}
                download="lumina-video.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10"
              >
                <Download size={18} />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};