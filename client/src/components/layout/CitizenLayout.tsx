import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Home, PlusCircle, ListOrdered, User } from 'lucide-react';

export const CitizenLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar panelTitle="Citizen Portal" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 py-2 px-6 flex items-center justify-around">
        <NavLink
          to="/citizen"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-civic-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/citizen/report"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-civic-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <div className="w-10 h-10 -mt-5 bg-civic-600 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span>Report</span>
        </NavLink>

        <NavLink
          to="/citizen/my-complaints"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-civic-600' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <ListOrdered className="w-5 h-5" />
          <span>My Tickets</span>
        </NavLink>
      </nav>
    </div>
  );
};
