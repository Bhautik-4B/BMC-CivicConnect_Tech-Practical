import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Building,
  Users,
  AlertOctagon,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const { logout } = useAuthStore();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 shrink-0 hidden md:flex">
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href.split('/').length <= 2}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-civic-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Support Info */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
        <p className="font-semibold text-slate-600 text-[11px]">BMC Smart Governance</p>
        <p className="text-[10px] mt-0.5">Helpline: 1800-233-1234</p>
      </div>
    </aside>
  );
};
