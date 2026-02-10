import React, { useState } from 'react';
import { validateWhatsAppNumber } from '../utils';
import { loginUser, registerUser } from '../services/authService';
import { User } from '../types';
import { Mail, Phone, Lock, ArrowRight, User as UserIcon, AlertCircle, KeyRound } from 'lucide-react';

interface AuthFormsProps {
  onSuccess: (user: User) => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLogin) {
      // Login Logic
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      // Use email field for both email/phone/secret code input in login
      const res = loginUser(formData.email, formData.password);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.message);
      }
    } else {
      // Register Logic
      if (!formData.email || !formData.phone || !formData.password) {
        setError('All fields are required');
        return;
      }
      
      // Email Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Invalid email format');
        return;
      }

      // Phone Validation
      if (!validateWhatsAppNumber(formData.phone)) {
        setError('Phone must be 11 digits numbers only');
        return;
      }

      // Password Length
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      const res = registerUser(formData.email, formData.phone, formData.password);
      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isLogin 
            ? 'Login with Email or Secret Code' 
            : 'Join NethminaOFC to boost your presence'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">
            {isLogin ? 'Email / Secret Code' : 'Email Address'}
          </label>
          <div className="relative">
            <input
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              placeholder={isLogin ? "user@example.com or Secret Code" : "you@example.com"}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-10 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all"
            />
            {isLogin ? (
              <KeyRound className="absolute left-3 top-3.5 text-slate-500" size={18} />
            ) : (
              <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
            )}
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">WhatsApp Number</label>
            <div className="relative">
              <input
                name="phone"
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                placeholder="947XXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-10 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all"
              />
              <Phone className="absolute left-3 top-3.5 text-slate-500" size={18} />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">Password</label>
          <div className="relative">
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-10 focus:ring-2 focus:ring-violet-500 outline-none text-white transition-all"
            />
            <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex justify-center items-center gap-2 mt-4"
        >
          {isLogin ? 'Login' : 'Register'} <ArrowRight size={18} />
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-500 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setFormData({ email: '', phone: '', password: '' });
            }}
            className="text-violet-400 font-bold hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
