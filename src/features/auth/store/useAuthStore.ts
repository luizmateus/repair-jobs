import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { asyncPersistStorage } from '@/src/shared/store/asyncPersistStorage';
import type { Session } from '../types';

type AuthState = {
  session: Session | null;
  hydrated: boolean;
  signIn: (session: Session) => void;
  signOut: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,

      signIn: (session) => set({ session }),

      signOut: () => set({ session: null }),

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'repair-jobs-auth-store',
      storage: asyncPersistStorage,
      partialize: (state) => ({
        session: state.session,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Auth hydration failed:', error);
        }
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);
