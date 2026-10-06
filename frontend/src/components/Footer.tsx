import React from 'react';
import { Download } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                <Download className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white">Andown</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Fast, simple and convenient media downloading for supported public URLs. Respecting copyright and creator ownership.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-3">Popular Extractors</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-400">YouTube Video Downloader</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-400">Instagram Reels Downloader</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-400">TikTok Video Downloader</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-indigo-400">Facebook Video Downloader</button></li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div>
            <h4 className="font-bold text-white mb-3">Legal & Compliance</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => onNavigate('terms')} className="hover:text-indigo-400">Terms of Service</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="hover:text-indigo-400">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('dmca')} className="hover:text-indigo-400">DMCA / Copyright Notice</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-indigo-400">Contact & Support</button></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="font-bold text-white mb-3">Compliance Notice</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Andown does not host or pirate copyrighted content. It serves solely as a client-side stream helper for accessible public links. Andown is not affiliated with YouTube, Meta, TikTok, or Twitter.
            </p>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Andown (<a href="https://www.andown.in" className="hover:underline text-indigo-400">www.andown.in</a>). All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with precision for performance & privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
