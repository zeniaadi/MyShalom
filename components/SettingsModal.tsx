import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
  userEmail?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSignOut, userEmail }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'initial' | 'confirm'>('initial');

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      /* 
         IMPORTANT: The backend function expected here is 'delete_my_username'.
         Ensure this SQL is run in your Supabase Dashboard SQL Editor:
         
         create or replace function delete_my_username()
         returns void
         language plpgsql
         security definer
         as $$
         begin
           delete from auth.users where id = auth.uid();
         end;
         $$;

         -- You may also need to grant permission if using a custom role setup:
         -- grant execute on function delete_my_username to authenticated;
         -- grant execute on function delete_my_username to service_role;
      */
      
      const { error } = await supabase.rpc('delete_my_username');
      
      if (error) {
        console.error("Account deletion RPC failed:", error);
        // Show specific error message from Supabase so the user knows what went wrong (e.g. FK constraint, permissions, etc.)
        alert(`Server-side deletion failed: ${error.message}\n\nYou will be signed out locally.`);
        
        // Fallback: Sign out locally even if server deletion failed
        onSignOut();
        return;
      } 
      
      alert("Your account has been successfully deleted.");
      onSignOut();
    } catch (err: any) {
      console.error("Error deleting account:", err);
      // Ensure we still sign them out locally so they don't feel "stuck"
      onSignOut();
      alert(err.message || "An error occurred. You have been signed out.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white w-full max-w-md p-8 rounded-4xl shadow-float border border-stone-100 relative z-10 animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-serif text-2xl text-stone-900 mb-1">Settings</h2>
        <p className="text-stone-500 text-sm mb-8">{userEmail}</p>

        <div className="space-y-6">
          {/* Sign Out Section */}
          <div className="pb-6 border-b border-stone-100">
             <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Session</h3>
             <Button variant="outline" onClick={onSignOut} className="w-full justify-center">
                Sign Out
             </Button>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">Danger Zone</h3>
            
            {deleteStep === 'initial' ? (
              <button
                onClick={() => setDeleteStep('confirm')}
                className="w-full py-3 rounded-full text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                <p className="text-rose-800 text-sm mb-3 font-medium">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={() => setDeleteStep('initial')}
                    className="px-4 py-2 rounded-full text-xs font-bold text-stone-500 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <Button 
                    variant="primary"
                    onClick={handleDeleteAccount}
                    isLoading={isDeleting}
                    className="!bg-rose-600 hover:!bg-rose-700 !text-white !py-2 !px-4 !text-xs"
                  >
                    Confirm Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};