import React from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import type { JobResponse } from '../types';

interface DownloadProgressProps {
  job: JobResponse;
  onCancel: () => void;
  onReset: () => void;
}

export const DownloadProgressCard: React.FC<DownloadProgressProps> = ({
  job,
  onCancel,
  onReset,
}) => {
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';
  const isWorking = job.status === 'queued' || job.status === 'processing';

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 glass-panel rounded-2xl p-6 sm:p-8 border border-indigo-500/20 shadow-2xl text-center">
      
      {/* Icon Status */}
      <div className="flex justify-center mb-4">
        {isWorking && (
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
        {isCompleted && (
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        )}
        {isFailed && (
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>
        )}
        {isCancelled && (
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <XCircle className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Title / Status Message */}
      <h3 className="text-xl sm:text-2xl font-bold text-white">
        {isCompleted && "Your Download Is Ready!"}
        {isWorking && job.status_message}
        {isFailed && "Processing Encountered An Issue"}
        {isCancelled && "Download Job Cancelled"}
      </h3>

      {job.media_info?.title && (
        <p className="mt-1 text-sm text-slate-300 font-medium line-clamp-1 max-w-md mx-auto">
          {job.media_info.title}
        </p>
      )}

      {/* Progress Bar */}
      {isWorking && (
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>{job.status === 'queued' ? 'Queued' : 'Processing stream'}</span>
            <span>{job.progress_percentage ? `${job.progress_percentage}%` : 'Working...'}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${job.progress_percentage || 25}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Fetching best compatible streams and finalizing container...
          </p>
        </div>
      )}

      {/* Success Details & Direct Download Button */}
      {isCompleted && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-1 text-slate-300">
            {job.filename && <div className="truncate"><strong>Filename:</strong> {job.filename}</div>}
            {job.filesize_formatted && <div><strong>File Size:</strong> {job.filesize_formatted}</div>}
            <div className="flex items-center gap-1 text-amber-400 pt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Temporary download link expires in 45 minutes</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={job.download_url}
              download={job.filename || "andown-video.mp4"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Save File Now</span>
            </a>

            <button
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Download Another
            </button>
          </div>
        </div>
      )}

      {/* Failure Message */}
      {isFailed && (
        <div className="mt-4 max-w-md mx-auto">
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-left mb-5">
            {job.error || "Unable to download this video stream. The URL might be private or copyrighted."}
          </div>
          <button
            onClick={onReset}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs"
          >
            Try Another URL
          </button>
        </div>
      )}

      {/* Cancel button during active work */}
      {isWorking && (
        <div className="mt-6">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors"
          >
            Cancel Download
          </button>
        </div>
      )}

    </div>
  );
};
