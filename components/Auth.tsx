import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';

type AuthMode = 'signin' | 'signup' | 'forgot';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage({ text: 'Password reset link sent! Check your email.', type: 'success' });
        return;
      }

      if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data.user && data.session === null) {
             setMessage({ text: 'Success! Please check your email to verify your account.', type: 'success' });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      let errorMessage = error.message || 'An unexpected error occurred';
      
      // Friendly message for Rate Limits
      if (errorMessage.toLowerCase().includes('rate limit')) {
        errorMessage = 'Too many attempts. Please wait a moment before trying again.';
      }

      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch(mode) {
      case 'signup': return 'Join Shalom';
      case 'forgot': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  const getSubtitle = () => {
    switch(mode) {
      case 'signup': return 'Begin your journey of reflection.';
      case 'forgot': return 'Enter your email to receive instructions.';
      default: return 'Sign in to continue your journey.';
    }
  };

  const getButtonText = () => {
    switch(mode) {
      case 'signup': return 'Create Account';
      case 'forgot': return 'Send Reset Link';
      default: return 'Sign In';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-4xl shadow-float border border-white/60 text-center">
        <h2 className="font-serif text-3xl text-stone-900 mb-2">
          {getTitle()}
        </h2>
        <p className="text-stone-500 text-sm mb-8 font-medium">
          {getSubtitle()}
        </p>

        <form onSubmit={handleAuth} className="space-y-6 text-left">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">
                  Password
                </label>
                {mode === 'signin' && (
                  <button 
                    type="button"
                    onClick={() => { setMode('forgot'); setMessage(null); }}
                    className="text-xs text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-100' : 'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full justify-center shadow-lg"
          >
            {getButtonText()}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100">
          <p className="text-stone-400 text-sm">
            {mode === 'signup' ? 'Already have an account?' : (mode === 'forgot' ? 'Remembered your password?' : "Don't have an account?")}
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : (mode === 'forgot' ? 'signin' : 'signup'));
                setMessage(null);
              }}
              className="ml-2 font-bold text-stone-600 hover:text-stone-900 underline decoration-2 underline-offset-2 transition-colors"
            >
              {mode === 'signup' ? 'Sign In' : 'Sign In/Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};