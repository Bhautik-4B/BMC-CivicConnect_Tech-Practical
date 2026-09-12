import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import { useNotificationStore } from '../../store/notificationStore.js';
import {
  Building2,
  Bell,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { RoleDisplayNames, UserRoles } from '@bmc/shared';
import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  panelTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ panelTitle = 'CivicConnect' }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isDropdownOpen,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
    initializeSocketListeners
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      const cleanup = initializeSocketListeners(user.id, user.departmentId);
      return cleanup;
    }
  }, [user?.id, user?.departmentId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTicketLink = (ticketId?: string) => {
    if (!ticketId) return '#';
    if (user?.role === UserRoles.BMC_ADMIN) return `/admin/ticket/${ticketId}`;
    if (user?.role === UserRoles.DEPT_OFFICER || user?.role === UserRoles.DEPT_SUPERVISOR)
      return `/dept/ticket/${ticketId}`;
    if (user?.role === UserRoles.FIELD_STAFF) return `/field/ticket/${ticketId}`;
    return `/citizen/ticket/${ticketId}`;
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
          {/* Notification Bell & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              aria-label="Notifications"
              className={`p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative ${
                isDropdownOpen ? 'bg-slate-100 text-civic-700' : ''
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-civic-100 text-civic-800 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-civic-600 hover:text-civic-800 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      <p>No notifications yet.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Real-time updates on your tickets will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3.5 text-xs transition-colors flex items-start gap-3 ${
                          notif.isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-blue-50/40 hover:bg-blue-50/70'
                        }`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'SLA_WARNING' ? (
                            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : notif.type === 'VERIFICATION_REQUIRED' ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : notif.type === 'NEW_ASSIGNMENT' || notif.type === 'ASSIGNMENT' ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-bold text-slate-900 truncate">
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed mb-1.5 line-clamp-2">
                            {notif.message}
                          </p>

                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            {notif.ticketId && (
                              <Link
                                to={getTicketLink(notif.ticketId)}
                                onClick={() => {
                                  markAsRead(notif.id);
                                  closeDropdown();
                                }}
                                className="inline-flex items-center gap-1 font-bold text-civic-700 hover:text-civic-900 bg-civic-50 px-2 py-0.5 rounded-md border border-civic-200"
                              >
                                <span>Inspect</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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

