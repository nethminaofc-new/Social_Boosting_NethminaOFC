import React from 'react';
import { ArrowRight, Rocket } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden py-20 lg:py-32 flex flex-col items-center text-center px-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px] -z-10"></div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-medium mb-6 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        NethminaOFC Boosting Service is Live
      </div>

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
        Boost your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">social media</span> <br className="hidden md:block" />
        presence instantly.
      </h1>

      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
        The most reliable platform to skyrocket your growth on TikTok, YouTube, Instagram, and Facebook. Secure, fast, and affordable.
      </p>

      <button 
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-900"
      >
        <Rocket className="w-5 h-5 mr-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
        Get Started / Boost Now
        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40"></div>
      </button>

      {/* Stats/Trust */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center w-full max-w-4xl border-t border-slate-800 pt-8">
        {[
          { label: 'Orders Completed', val: '50K+' },
          { label: 'Active Users', val: '12K+' },
          { label: 'Satisfaction', val: '99%' },
          { label: 'Support', val: '24/7' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.val}</div>
            <div className="text-slate-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
