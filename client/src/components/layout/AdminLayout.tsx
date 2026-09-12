import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import {
  LayoutDashboard,
  FileText,
  Map,
  Building2,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

const adminNavItems = [
  { name: 'City Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'All Complaints', href: '/admin/complaints', icon: FileText },
  { name: 'Live GIS Map', href: '/admin/live-map', icon: Map },
  { name: 'Departments & Staff', href: '/admin/departments', icon: Building2 },
  { name: 'SLA & Escalations', href: '/admin/escalations', icon: AlertTriangle }
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar panelTitle="BMC Admin Command Center" />
      <div className="flex-1 flex">
        <Sidebar items={adminNavItems} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
