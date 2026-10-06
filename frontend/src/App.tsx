import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { SmartUrlInput } from './components/SmartUrlInput';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import { DownloadProgressCard } from './components/DownloadProgressCard';
import { SeoSections } from './components/SeoSections';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';

import type { 
  MediaInfo, MediaFormat, JobResponse, PlatformItem, DownloadHistoryItem 
} from './types';
import { 
  fetchMediaInfo, startDownloadProcess, pollJobStatus, cancelJob, fetchSupportedPlatforms 
} from './api';
import { Sparkles, Clock, Trash2 } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Downloader Flow States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaInfo | null>(null);
  const [currentJob, setCurrentJob] = useState<JobResponse | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);

  const pollIntervalRef = useRef<any>(null);

  // Load local history & platforms on mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('andown_history');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch {}

    fetchSupportedPlatforms()
      .then(setPlatforms)
      .catch(() => {
        // Fallback default list
        setPlatforms([
          { id: 'youtube', name: 'YouTube', domains: ['youtube.com'], is_enabled: true, supported_media: [], icon_name: 'youtube', description: 'Videos, Shorts, and Audio' },
          { id: 'instagram', name: 'Instagram', domains: ['instagram.com'], is_enabled: true, supported_media: [], icon_name: 'instagram', description: 'Reels, Posts & Stories' },
          { id: 'tiktok', name: 'TikTok', domains: ['tiktok.com'], is_enabled: true, supported_media: [], icon_name: 'tiktok', description: 'HD Videos & Sounds' },
          { id: 'facebook', name: 'Facebook', domains: ['facebook.com'], is_enabled: true, supported_media: [], icon_name: 'facebook', description: 'Public Video Posts & Reels' },
        ]);
      });

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentJob(null);
    setCurrentMedia(null);

    try {
      const info = await fetchMediaInfo(url);
      setCurrentMedia(info);
    } catch (err: any) {
      setAnalysisError(err.message || 'We could not process this video. Please check the URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDownload = async (format: MediaFormat) => {
    if (!currentMedia) return;
    try {
      const job = await startDownloadProcess(
        currentMedia.webpage_url,
        format.format_id,
        format.ext,
        format.is_audio_only
      );
      setCurrentJob(job);
      startPolling(job.job_id);

      // Save to local browser history
      const newHistoryItem: DownloadHistoryItem = {
        id: job.job_id,
        title: currentMedia.title,
        platform: currentMedia.platform,
        format: format.quality_label || format.ext.toUpperCase(),
        date: new Date().toLocaleDateString(),
      };
      const updated = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(updated);
      localStorage.setItem('andown_history', JSON.stringify(updated));
    } catch (err: any) {
      alert(err.message || 'Failed to initialize download.');
    }
  };

  const startPolling = (jobId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const updatedJob = await pollJobStatus(jobId);
        setCurrentJob(updatedJob);

        if (['completed', 'failed', 'cancelled'].includes(updatedJob.status)) {
          clearInterval(pollIntervalRef.current);
        }
      } catch {
        clearInterval(pollIntervalRef.current);
      }
    }, 1500);
  };

  const handleCancelDownload = async () => {
    if (currentJob) {
      await cancelJob(currentJob.job_id);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setCurrentJob({
        ...currentJob,
        status: 'cancelled',
        status_message: 'Job cancelled by user.'
      });
    }
  };

  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setCurrentMedia(null);
    setCurrentJob(null);
    setAnalysisError(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('andown_history');
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation */}
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-1">
        {currentPage === 'admin' ? (
          <AdminDashboard />
        ) : (
          <>
            {/* Hero Section */}
            <section className="relative pt-16 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 glow-gradient">
              <div className="max-w-4xl mx-auto text-center space-y-4">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Universal Video & Audio Extractor</span>
                </div>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  Download Videos From <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                    Your Favorite Platforms
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
                  Paste a supported public video URL, choose an available format, and download your media in a few simple steps.
                </p>

                {/* Main Smart URL Input */}
                <div className="pt-6">
                  <SmartUrlInput 
                    onAnalyze={handleAnalyze}
                    isLoading={isAnalyzing}
                    error={analysisError}
                  />
                </div>

                {/* Media Analysis Result Card */}
                {currentMedia && !currentJob && (
                  <AnalysisResultCard 
                    media={currentMedia}
                    onStartDownload={handleStartDownload}
                    onReset={handleReset}
                    isProcessing={false}
                  />
                )}

                {/* Download Progress Card */}
                {currentJob && (
                  <DownloadProgressCard 
                    job={currentJob}
                    onCancel={handleCancelDownload}
                    onReset={handleReset}
                  />
                )}

                {/* Recent Browser Downloads History */}
                {history.length > 0 && !currentMedia && !currentJob && (
                  <div className="max-w-xl mx-auto mt-12 p-4 glass-card rounded-2xl border border-slate-800 text-left text-xs">
                    <div className="flex items-center justify-between mb-3 text-slate-400">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        Recent Downloads (This Browser)
                      </span>
                      <button 
                        onClick={handleClearHistory}
                        className="text-slate-500 hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {history.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/80">
                          <span className="truncate max-w-[240px] text-white font-medium">{item.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 uppercase font-semibold">
                            {item.format}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* SEO & Platform Content Sections */}
            <SeoSections 
              platforms={platforms}
              onSelectPlatform={(_id) => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(page) => setCurrentPage(page)} />

    </div>
  );
}

export default App;
