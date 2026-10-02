import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (accessToken: string, user: User) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading as true for initial restore
  setAuth: (accessToken, user) => set({ accessToken, user, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
