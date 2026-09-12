import React from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { Building2, Bell, LogOut, User } from 'lucide-react';
import { RoleDisplayNames } from '@bmc/shared';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  panelTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ panelTitle = 'CivicConnect' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Brand logo & panel title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-civic-600 flex items-center justify-center text-white shadow-sm font-bold">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight text-sm md:text-base">
              BMC CivicConnect
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 hidden sm:inline-block">
              {panelTitle}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Bhavnagar Municipal Corporation</p>
        </div>
      </div>

      {/* User profile & actions */}
      {user && (
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-civic-600 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {RoleDisplayNames[user.role]}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
