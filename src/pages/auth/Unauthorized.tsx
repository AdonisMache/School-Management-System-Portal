import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0b10] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl flex flex-col items-center text-center relative z-10 border-red-500/20">
        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 mb-6">
          <ShieldAlert className="w-10 h-10 text-red-400 animate-bounce" />
        </div>
        
        <h1 className="text-xl font-bold text-white mb-2">Access Restrained</h1>
        <p className="text-gray-400 text-xs leading-relaxed mb-8 max-w-xs">
          Your profile doesn't possess the dynamic permissions required to read, update or explore this section.
        </p>

        <div className="flex gap-4 w-full">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-bold transition-all duration-150 shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
