import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { LayoutDashboard, Inbox, Users, AlertOctagon } from 'lucide-react';

const deptNavItems = [
  { name: 'Dept Dashboard', href: '/dept', icon: LayoutDashboard },
  { name: 'Complaint Queue', href: '/dept/queue', icon: Inbox },
  { name: 'Staff Workload', href: '/dept/staff', icon: Users }
];

export const DeptLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar panelTitle="Department Portal" />
      <div className="flex-1 flex">
        <Sidebar items={deptNavItems} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
