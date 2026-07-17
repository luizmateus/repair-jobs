import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  message: string | null;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'success') => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message, type });
    hideTimer = setTimeout(() => set({ message: null }), 2500);
  },
  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message: null });
  },
}));
