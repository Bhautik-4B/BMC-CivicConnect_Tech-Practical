import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { CheckSquare, History, User } from 'lucide-react';

export const FieldLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar panelTitle="Field Operations" />

      {/* Mobile-centric task container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-20">
        <Outlet />
      </main>

      {/* Field Staff Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2.5 px-6 flex items-center justify-around shadow-lg">
        <NavLink
          to="/field"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
              isActive ? 'text-civic-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <CheckSquare className="w-5 h-5" />
          <span>My Tasks</span>
        </NavLink>

        <NavLink
          to="/field/history"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-xs font-bold transition-colors ${
              isActive ? 'text-civic-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <History className="w-5 h-5" />
          <span>Work History</span>
        </NavLink>
      </nav>
    </div>
  );
};
