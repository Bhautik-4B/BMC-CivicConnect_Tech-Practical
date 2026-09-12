import { create } from 'zustand';
import { IUser, UserRole } from '@bmc/shared';

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const savedUser = localStorage.getItem('bmc_user');
  let initialUser: IUser | null = null;
  try {
    if (savedUser) initialUser = JSON.parse(savedUser);
  } catch (e) {
    console.error('Failed to parse saved user', e);
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    setAuth: (user, token) => {
      localStorage.setItem('bmc_user', JSON.stringify(user));
      localStorage.setItem('bmc_access_token', token);
      set({ user, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('bmc_user');
      localStorage.removeItem('bmc_access_token');
      set({ user: null, isAuthenticated: false });
    }
  };
});
