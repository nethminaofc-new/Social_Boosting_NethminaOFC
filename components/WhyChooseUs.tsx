import React from 'react';
import { ShieldCheck, Zap, Headphones, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Day 1', organic: 100, boosted: 100 },
  { name: 'Day 2', organic: 120, boosted: 500 },
  { name: 'Day 3', organic: 130, boosted: 1200 },
  { name: 'Day 4', organic: 150, boosted: 2800 },
  { name: 'Day 5', organic: 170, boosted: 5000 },
  { name: 'Day 6', organic: 180, boosted: 8500 },
  { name: 'Day 7', organic: 200, boosted: 12000 },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <div className="py-20 bg-slate-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We deliver real results with a focus on safety and speed. See the difference our service makes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Zap, title: "Fast Delivery", desc: "Orders start within minutes." },
              { icon: ShieldCheck, title: "Guaranteed Results", desc: "Refills available for drops." },
              { icon: Lock, title: "Secure Payments", desc: "Encrypted transactions only." },
              { icon: Headphones, title: "24/7 Support", desc: "We are here to help anytime." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 transition-colors">
                <f.icon className="w-8 h-8 text-violet-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-6 text-center">Typical Growth Trajectory</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorBoosted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="boosted" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorBoosted)" strokeWidth={3} />
                  <Area type="monotone" dataKey="organic" stroke="#475569" fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">*Visualization of potential reach. Results vary.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
