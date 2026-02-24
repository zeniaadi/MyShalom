import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';

interface UpdatePasswordProps {
  onSuccess: () => void;
}

export const UpdatePassword: React.FC<UpdatePasswordProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-3xl shadow-float max-w-md w-full border border-stone-100 animate-fade-in-up">
        <h2 className="font-serif text-2xl text-stone-900 mb-2 text-center">Set New Password</h2>
        <p className="text-stone-500 text-sm mb-6 text-center">
          Please enter your new password below.
        </p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 ml-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50/50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-sm rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          <Button type="submit" isLoading={loading} className="w-full justify-center">
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};