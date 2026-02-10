import React from 'react';
import { Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          
          {/* Brand */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
              N
            </div>
            <span className="font-bold text-lg tracking-tight text-white">NethminaOFC</span>
          </div>

          {/* Contact Info */}
          <div className="mb-8">
            <a 
              href="mailto:nethminaofc@gmail.com" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/50 transition-all group"
            >
              <Mail size={16} className="group-hover:text-violet-400 transition-colors" />
              <span className="text-sm">nethminaofc@gmail.com</span>
            </a>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Support</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Refund Policy</a>
          </div>

          {/* Copyright */}
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} NethminaOFC Boosting Service. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
