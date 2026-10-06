import React from 'react';
import { Zap, ShieldCheck, RefreshCw, ChevronDown, Video } from 'lucide-react';
import type { PlatformItem } from '../types';

interface SeoProps {
  platforms: PlatformItem[];
  onSelectPlatform: (platformId: string) => void;
}

export const SeoSections: React.FC<SeoProps> = ({ platforms, onSelectPlatform }) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
    {
      q: "How does Andown work?",
      a: "Andown extracts public video streams directly from supported platforms such as YouTube, TikTok, Facebook, and Instagram. You paste a public video link, our engine analyzes available formats and audio codecs, and delivers a clean download without unnecessary software."
    },
    {
      q: "Do I need to install any software or extensions?",
      a: "No. Andown is 100% web-based and runs seamlessly on modern browsers across iOS, Android, macOS, Windows, and Linux."
    },
    {
      q: "Can I download audio or MP3 files?",
      a: "Yes! Whenever an audio stream (such as M4A or MP3) is made publicly available by the source platform, Andown provides a direct audio download option."
    },
    {
      q: "Is there any registration or credit card required?",
      a: "No registration is needed. You can analyze and download public media directly without creating an account or paying fees."
    },
    {
      q: "Can I download private videos or content behind a paywall?",
      a: "No. Andown strictly respects privacy and access controls. We do not bypass logins, DRM, private profiles, or subscription paywalls."
    },
    {
      q: "How long are my downloaded files stored on the server?",
      a: "Files are automatically purged and deleted by our background cleanup engine within 45 minutes to protect your privacy and server storage."
    },
    {
      q: "What is the maximum supported resolution?",
      a: "We support up to 4K / 1080p Full HD depending strictly on what quality options the creator uploaded and made publicly accessible on the host platform."
    },
    {
      q: "Why did my download link fail?",
      a: "Downloads typically fail if the video was set to private, deleted by the owner, region-restricted, or if it is protected by DRM security."
    },
    {
      q: "Does Andown store or log my personal data?",
      a: "No. We do not track personal identifying information, passwords, or cookies. All sessions are anonymous."
    },
    {
      q: "Is downloading videos legal?",
      a: "Downloading public media for personal offline access and educational archiving is generally allowed in many jurisdictions, provided you have the legal right to do so and do not infringe on copyrights."
    }
  ];

  const steps = [
    { num: "01", title: "Copy Link", desc: "Copy the public video URL from YouTube, Instagram, Facebook, or TikTok." },
    { num: "02", title: "Paste & Analyze", desc: "Paste the URL into Andown's smart analyzer box above and click 'Analyze Video'." },
    { num: "03", title: "Select Quality", desc: "Choose your preferred video resolution (1080p, 720p) or audio stream." },
    { num: "04", title: "Download", desc: "Click Download to save the media file directly to your phone or desktop." }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-24 px-4 sm:px-6 space-y-20 pb-16">
      
      {/* How It Works Section */}
      <section id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Simple Workflow</h2>
          <p className="text-3xl font-extrabold text-white">How To Download A Video in 4 Steps</p>
          <p className="mt-2 text-slate-400 text-sm">Download your favorite social media clips in seconds with no hassle.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl relative border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
              <span className="text-4xl font-black bg-gradient-to-br from-indigo-500/30 to-purple-500/10 bg-clip-text text-transparent absolute top-4 right-4">
                {st.num}
              </span>
              <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Platforms Grid */}
      <section id="supported">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Universal Compatibility</h2>
          <p className="text-3xl font-extrabold text-white">Supported Video Platforms</p>
          <p className="mt-2 text-slate-400 text-sm">Real-time status of all integrated platform extractors.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {platforms.map((plat) => (
            <div 
              key={plat.id}
              onClick={() => onSelectPlatform(plat.id)}
              className="p-4 rounded-xl glass-card border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Video className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plat.is_enabled ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/60 text-red-400'}`}>
                  {plat.is_enabled ? 'Active' : 'Maintenance'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{plat.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{plat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Andown */}
      <section className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">The Andown Advantage</h2>
          <p className="text-3xl font-extrabold text-white">Why Creators & Users Choose Andown</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Ultra Fast Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our asynchronous streaming engine fetches metadata in milliseconds and processes high-definition MP4 videos directly from origin edge servers.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">100% Secure & Clean</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict SSRF protection, malware scanning, zero deceptive advertising popups, and automatic server file expiration after 45 minutes.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">No Account Barrier</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enjoy complete freedom without creating logins, signing up for newsletters, or sharing personal credentials.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Got Questions?</h2>
          <p className="text-3xl font-extrabold text-white">Frequently Asked Questions</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="glass-card rounded-xl border border-slate-800/80 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4.5 flex items-center justify-between text-sm sm:text-base font-semibold text-white hover:text-indigo-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 text-slate-400 ${openFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4.5 pb-4.5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
