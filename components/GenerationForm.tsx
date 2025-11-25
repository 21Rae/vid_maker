import React, { useState, useRef } from 'react';
import { VideoConfig, GenerationRequest } from '../types';
import { Upload, X, Image as ImageIcon, Film, Settings2 } from 'lucide-react';

interface GenerationFormProps {
  onSubmit: (data: GenerationRequest) => void;
  isGenerating: boolean;
}

export const GenerationForm: React.FC<GenerationFormProps> = ({ onSubmit, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState<VideoConfig>({
    aspectRatio: '16:9',
    resolution: '720p',
    model: 'veo-3.1-fast-generate-preview',
  });
  const [selectedImage, setSelectedImage] = useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setSelectedImage({
            file,
            preview: ev.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !selectedImage) return;

    let imagePayload = undefined;

    if (selectedImage) {
        // Extract base64 data without prefix
        const base64Data = selectedImage.preview.split(',')[1];
        imagePayload = {
            data: base64Data,
            mimeType: selectedImage.file.type
        };
    }

    onSubmit({
      prompt,
      image: imagePayload,
      config,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Input Area */}
      <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-2xl shadow-xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your video... (e.g., A cyberpunk city with neon lights in rain)"
          className="w-full bg-transparent text-white p-4 min-h-[120px] resize-none focus:outline-none placeholder-zinc-500 text-lg"
          disabled={isGenerating}
        />
        
        {/* Image Preview */}
        {selectedImage && (
          <div className="px-4 pb-4">
            <div className="relative inline-block group">
              <img
                src={selectedImage.preview}
                alt="Reference"
                className="h-24 w-auto rounded-lg border border-zinc-700 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isGenerating}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 rounded-b-xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating || !!selectedImage}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                selectedImage 
                  ? 'text-zinc-600 cursor-not-allowed' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ImageIcon size={18} />
              <span className="hidden sm:inline">Add Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-3">
             {/* Character Count */}
            <span className={`text-xs ${prompt.length > 500 ? 'text-red-500' : 'text-zinc-600'}`}>
                {prompt.length} chars
            </span>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model & Aspect Ratio */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-1">
                <Settings2 size={16} />
                <span>Format Settings</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500">Aspect Ratio</label>
                    <select
                        value={config.aspectRatio}
                        onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value as any })}
                        disabled={isGenerating}
                        className="bg-zinc-800 text-white text-sm rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none border border-transparent focus:border-blue-500/50"
                    >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-zinc-500">Resolution</label>
                    <select
                        value={config.resolution}
                        onChange={(e) => setConfig({ ...config, resolution: e.target.value as any })}
                        disabled={isGenerating}
                        className="bg-zinc-800 text-white text-sm rounded-lg p-2 focus:ring-1 focus:ring-blue-500 outline-none border border-transparent focus:border-blue-500/50"
                    >
                        <option value="720p">720p HD</option>
                        <option value="1080p">1080p FHD</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Model Selection */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-1">
                <Film size={16} />
                <span>Model Selection</span>
            </div>
            <div className="flex gap-2">
                 <button
                    type="button"
                    onClick={() => setConfig({ ...config, model: 'veo-3.1-fast-generate-preview' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        config.model === 'veo-3.1-fast-generate-preview'
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                 >
                    Veo Fast
                 </button>
                 <button
                    type="button"
                    onClick={() => setConfig({ ...config, model: 'veo-3.1-generate-preview' })}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        config.model === 'veo-3.1-generate-preview'
                        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                 >
                    Veo Quality
                 </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
                {config.model === 'veo-3.1-fast-generate-preview' 
                    ? 'Optimized for speed. Good for testing prompts.' 
                    : 'Higher quality output. Takes longer to generate.'}
            </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating || (!prompt && !selectedImage)}
        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
          isGenerating || (!prompt && !selectedImage)
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-blue-500/25'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            Generating...
          </span>
        ) : (
          'Generate Video'
        )}
      </button>
    </form>
  );
};