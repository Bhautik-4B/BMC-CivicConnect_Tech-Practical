import { create } from 'zustand';
import { api } from '../services/api.js';
import { getSocket, joinUserRoom, joinDeptRoom } from '../services/socket.js';

export interface INotificationItem {
  id: string;
  recipientId?: string;
  title: string;
  message: string;
  ticketId?: string;
  complaintId?: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: INotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isDropdownOpen: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  toggleDropdown: () => void;
  closeDropdown: () => void;
  initializeSocketListeners: (userId: string, deptId?: string) => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isDropdownOpen: false,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true });
      const res: any = await api.get('/notifications?limit=30');
      if (res && res.data) {
        set({
          notifications: res.data.notifications || [],
          unreadCount: res.data.unreadCount || 0
        });
      }
    } catch (e) {
      console.warn('Could not fetch notifications', e);
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        const unread = updated.filter((n) => !n.isRead).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  },

  toggleDropdown: () => set((state) => ({ isDropdownOpen: !state.isDropdownOpen })),
  closeDropdown: () => set({ isDropdownOpen: false }),

  initializeSocketListeners: (userId: string, deptId?: string) => {
    const socket = getSocket();
    if (!socket) return () => {};

    if (userId) joinUserRoom(userId);
    if (deptId) joinDeptRoom(deptId);

    // Initial fetch
    get().fetchNotifications();

    const handleNewNotification = (notif: any) => {
      const formattedNotif: INotificationItem = {
        id: notif.id || `temp-${Date.now()}`,
        recipientId: userId,
        title: notif.title || 'New Update',
        message: notif.message || '',
        ticketId: notif.ticketId,
        type: notif.type || 'STATUS_UPDATE',
        isRead: false,
        createdAt: notif.createdAt || new Date().toISOString()
      };

      set((state) => ({
        notifications: [formattedNotif, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }));
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }
}));
