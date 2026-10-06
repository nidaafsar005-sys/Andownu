import React, { useState } from 'react';
import { 
  Download, Clock, User, Music, Film, Copy, Check, Layers 
} from 'lucide-react';
import type { MediaInfo, MediaFormat } from '../types';

interface ResultCardProps {
  media: MediaInfo;
  onStartDownload: (format: MediaFormat) => void;
  onReset: () => void;
  isProcessing: boolean;
}

export const AnalysisResultCard: React.FC<ResultCardProps> = ({
  media,
  onStartDownload,
  onReset,
  isProcessing,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat>(
    media.formats[0] || null
  );
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(media.webpage_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Thumbnail Preview Column */}
        <div className="md:col-span-5 relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
          {media.thumbnail ? (
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center bg-slate-900 text-slate-500">
              <Film className="w-12 h-12 stroke-[1.5]" />
            </div>
          )}

          {/* Duration Badge */}
          {media.duration_formatted && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-black/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>{media.duration_formatted}</span>
            </div>
          )}

          {/* Platform Tag */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-indigo-600/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
            {media.platform}
          </div>
        </div>

        {/* Media Details & Format Selector */}
        <div className="md:col-span-7 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight line-clamp-2">
              {media.title}
            </h2>

            {/* Public Uploader info */}
            {media.uploader && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Published by: <strong className="text-slate-200">{media.uploader}</strong></span>
              </div>
            )}

            {/* Description Snippet if available */}
            {media.description && (
              <p className="mt-2.5 text-xs text-slate-400 line-clamp-2">
                {media.description}
              </p>
            )}

            {/* Format Selection List */}
            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-2.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Choose Format & Quality:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {media.formats.map((fmt, idx) => {
                  const isSelected = selectedFormat?.format_id === fmt.format_id;
                  return (
                    <button
                      key={`${fmt.format_id}-${idx}`}
                      type="button"
                      onClick={() => setSelectedFormat(fmt)}
                      className={`p-2.5 rounded-xl text-left border transition-all duration-150 relative ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">
                          {fmt.quality_label || fmt.resolution || 'Standard'}
                        </span>
                        {fmt.is_audio_only ? (
                          <Music className="w-3.5 h-3.5 text-pink-400" />
                        ) : (
                          <Film className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="uppercase font-medium text-[10px] px-1 py-0.5 rounded bg-slate-800">
                          {fmt.ext}
                        </span>
                        <span>{fmt.filesize_formatted || 'Stream'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!selectedFormat || isProcessing}
              onClick={() => selectedFormat && onStartDownload(selectedFormat)}
              className="flex-1 min-w-[160px] py-3 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download ({selectedFormat ? selectedFormat.quality_label || selectedFormat.ext.toUpperCase() : 'Select'})</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Copy original link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
            >
              Analyze Another
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
