import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: !!token });
      },

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const response = await authAPI.login(email, password);
        const token = response.data.token;
        if (token) {
          get().setToken(token);
          const userResponse = await authAPI.getMe();
          get().setUser(userResponse.data);
        }
        return response.data;
      },

      signup: async (data) => {
        const response = await authAPI.signup(data);
        const token = response.data.token;
        if (token) {
          get().setToken(token);
          const userResponse = await authAPI.getMe();
          get().setUser(userResponse.data);
        }
        return response.data;
      },

      fetchUser: async () => {
        try {
          const response = await authAPI.getMe();
          get().setUser(response.data);
          return response.data;
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      initialize: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          set({ token, isAuthenticated: true });
          try {
            const response = await authAPI.getMe();
            set({ user: response.data });
          } catch (error) {
            console.error('Failed to fetch user on initialize:', error);
            // Clear stale token if request fails (user not found or token invalid)
            if (error.response?.status === 403 || error.response?.status === 401) {
              localStorage.removeItem('token');
              set({ token: null, user: null, isAuthenticated: false });
            } else {
              set({ isAuthenticated: false });
            }
          }
        } else {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
export { useAuthStore };
