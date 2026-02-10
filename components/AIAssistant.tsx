import React, { useState } from 'react';
import { Sparkles, Bot, Loader2 } from 'lucide-react';
import { generateSocialTips } from '../services/geminiService';

export const AIAssistant: React.FC = () => {
  const [platform, setPlatform] = useState('TikTok');
  const [goal, setGoal] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setResult(null);
    const response = await generateSocialTips(platform, goal);
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="py-20 container mx-auto px-4">
      <div className="bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-violet-500/30 rounded-3xl p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px] -z-10"></div>
        
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold uppercase mb-4 border border-violet-500/30">
              <Sparkles size={14} />
              Powered by Gemini AI
            </div>
            <h2 className="text-3xl font-bold mb-4">Free AI Social Growth Audit</h2>
            <p className="text-slate-300 mb-6">
              Not sure which boost to buy? Ask our AI assistant for a quick strategy tip based on your niche and platform.
            </p>
            
            <form onSubmit={handleAskAI} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Platform</label>
                <select 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none text-white"
                >
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Your Main Goal</label>
                <input 
                  type="text" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Become a fashion influencer, Get more sales..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none text-white"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !goal.trim()}
                className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Bot size={20} />}
                {loading ? 'Analyzing...' : 'Get AI Advice'}
              </button>
            </form>
          </div>

          <div className="md:w-1/2 w-full">
            {result ? (
              <div className="bg-slate-950/50 rounded-xl p-6 border border-slate-700 h-full min-h-[200px]">
                <h3 className="font-bold text-violet-400 mb-3 flex items-center gap-2">
                  <Sparkles size={16} /> AI Strategy:
                </h3>
                <div className="prose prose-invert prose-sm">
                   <p className="whitespace-pre-line text-slate-200">{result}</p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[250px] flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl text-slate-600">
                <div className="text-center">
                  <Bot size={40} className="mx-auto mb-2 opacity-50" />
                  <p>Results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
