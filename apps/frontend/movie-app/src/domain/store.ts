import type { ChatMessage } from 'shared';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  chatMessages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
}

export const useAppStore = create(
  persist<AppState>(
    (set) => ({
      chatMessages: [],

      addMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      clearMessages: () => set({ chatMessages: [] }),
    }),
    {
      name: 'movie-app-store',
      getStorage: () => sessionStorage,
    },
  ),
);
