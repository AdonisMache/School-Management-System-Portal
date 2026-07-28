import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0b10] flex text-gray-100">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Primary Layout Panel */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#0c0d15]/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Hamburger toggle button for small screens */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-xl border border-[rgba(255,255,255,0.08)] text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar helper */}
            <div className="relative w-48 md:w-80 hidden sm:block">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full bg-[#121420]/60 border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-150"
              />
            </div>
          </div>

          {/* Quick Actions & User Meta */}
          <div className="flex items-center gap-4">
            {/* Notifications Trigger */}
            <button className="p-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition-all duration-150 relative cursor-pointer text-gray-400 hover:text-white">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full"></span>
            </button>

            {/* Separator Line */}
            <div className="h-5 w-px bg-[rgba(255,255,255,0.08)]"></div>

            {/* User Meta Trigger */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-bold text-xs text-indigo-300">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-white leading-tight">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] text-gray-500">Apex SMS Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Router Workspace */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
