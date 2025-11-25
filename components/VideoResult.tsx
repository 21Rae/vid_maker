import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { GeneratedVideo } from '../types';

interface VideoResultProps {
  video: GeneratedVideo;
  onReset: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ video, onReset }) => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!video.uri) {
            throw new Error("Invalid video URI received.");
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API Key not found. Please refresh and select your key again.");
        }

        // Safely append API key
        const separator = video.uri.includes('?') ? '&' : '?';
        const fetchUrl = `${video.uri}${separator}key=${apiKey}`;

        console.log("Fetching video content...");
        const response = await fetch(fetchUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to load video: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        if (mounted) {
            objectUrl = URL.createObjectURL(blob);
            setVideoUrl(objectUrl);
        }
      } catch (err: any) {
        console.error("Video load error:", err);
        if (mounted) {
            setError(err.message || "Failed to load video.");
        }
      } finally {
        if (mounted) {
            setLoading(false);
        }
      }
    };

    fetchVideo();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [video.uri]);

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative aspect-video bg-black flex items-center justify-center group min-h-[300px]">
          {loading ? (
             <div className="text-zinc-500 flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
               <p className="text-sm font-medium">Downloading video...</p>
             </div>
          ) : error ? (
             <div className="text-red-400 flex flex-col items-center gap-3 p-6 text-center">
               <AlertCircle size={32} />
               <p className="text-sm font-medium">{error}</p>
             </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : null}
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
                download="sirz-video.mp4"
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