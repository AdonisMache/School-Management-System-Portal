import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Network, 
  Users, 
  GraduationCap, 
  CalendarDays, 
  FileSpreadsheet, 
  Landmark, 
  ClipboardList, 
  BookOpen, 
  ScrollText, 
  Megaphone, 
  LogOut,
  School
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { hasPermission, signOut, user, roles } = useAuth();

  const menuItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true
    },
    {
      to: '/academics',
      label: 'Academic Setup',
      icon: Network,
      show: hasPermission('academics:write')
    },
    {
      to: '/students',
      label: 'Student Directory',
      icon: Users,
      show: hasPermission('students:write') || hasPermission('academics:read')
    },
    {
      to: '/teachers',
      label: 'Teacher Directory',
      icon: GraduationCap,
      show: hasPermission('teachers:write')
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: CalendarDays,
      show: hasPermission('attendance:write') || hasPermission('academics:read')
    },
    {
      to: '/marks',
      label: 'Grades & Marks',
      icon: FileSpreadsheet,
      show: hasPermission('marks:write') || hasPermission('academics:read')
    },
    {
      to: '/finance',
      label: 'Finance & Fees',
      icon: Landmark,
      show: hasPermission('finance:read')
    },
    {
      to: '/assignments',
      label: 'Assignments',
      icon: ClipboardList,
      show: hasPermission('assignments:write') || hasPermission('assignments:submit')
    },
    {
      to: '/library',
      label: 'Online Library',
      icon: BookOpen,
      show: hasPermission('library:read')
    },
    {
      to: '/announcements',
      label: 'Announcements',
      icon: Megaphone,
      show: true
    },
    {
      to: '/audit',
      label: 'System Logs',
      icon: ScrollText,
      show: hasPermission('audit:read')
    }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-[rgba(255,255,255,0.08)] flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex items-center gap-3">
        <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
          <School className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-md font-bold tracking-tight text-white leading-none">VLCSMS</h2>
          <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Vibrant Legend</span>
        </div>
      </div>

      {/* Navigation Menus */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          if (!item.show) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'}
              `}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile Summary */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-700/50 flex items-center justify-center font-bold text-indigo-300">
            {user?.email?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase mt-0.5 truncate">
              {roles[0]?.replace('_', ' ') || 'User'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
