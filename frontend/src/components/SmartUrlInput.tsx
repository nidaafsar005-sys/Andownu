import React, { useState } from 'react';
import { Link as LinkIcon, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export const SmartUrlInput: React.FC<UrlInputProps> = ({ onAnalyze, isLoading, error }) => {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  const detectPlatform = (val: string) => {
    const input = val.toLowerCase();
    if (input.includes('youtube.com') || input.includes('youtu.be')) return 'YouTube';
    if (input.includes('facebook.com') || input.includes('fb.watch')) return 'Facebook';
    if (input.includes('instagram.com')) return 'Instagram';
    if (input.includes('tiktok.com')) return 'TikTok';
    if (input.includes('twitter.com') || input.includes('x.com')) return 'X / Twitter';
    if (input.includes('reddit.com') || input.includes('v.redd.it')) return 'Reddit';
    if (input.includes('pinterest.com') || input.includes('pin.it')) return 'Pinterest';
    if (input.includes('vimeo.com')) return 'Vimeo';
    if (input.includes('dailymotion.com')) return 'Dailymotion';
    if (input.includes('twitch.tv')) return 'Twitch';
    if (input.length > 8 && (input.startsWith('http://') || input.startsWith('https://'))) return 'Universal Web Video';
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    setDetectedPlatform(detectPlatform(val));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setDetectedPlatform(detectPlatform(text));
      }
    } catch {
      // Fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAnalyze(url.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-stretch p-2 rounded-2xl glass-card border border-indigo-500/20 shadow-2xl shadow-indigo-950/40 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300">
          
          <div className="relative flex-1 flex items-center min-w-0">
            <div className="pl-3.5 pr-2 text-indigo-400">
              <LinkIcon className="w-5 h-5 opacity-70" />
            </div>
            
            <input
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder="Paste video URL here (e.g. YouTube, Instagram, TikTok)..."
              disabled={isLoading}
              className="w-full bg-transparent border-0 text-white placeholder-slate-400 px-2 py-3 text-base sm:text-lg focus:outline-none focus:ring-0 disabled:opacity-50"
            />

            {url && (
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setDetectedPlatform(null);
                }}
                className="p-1.5 mr-1 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-700/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 mr-2 transition-colors"
              >
                Paste
              </button>
            )}
          </div>

          <div className="mt-2 sm:mt-0 flex sm:items-center">
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Video</span>
                </>
              )}
            </button>
          </div>
        </div>

        {detectedPlatform && !error && (
          <div className="mt-2.5 flex items-center gap-2 px-3 text-xs font-medium text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Recognized: <strong>{detectedPlatform}</strong> link detected</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Unable to analyze</p>
              <p className="text-red-300/90 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
