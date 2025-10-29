// stores/layoutStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeStore, Theme } from '@/types/theme';

const defaultTheme: Theme = {
  mode: 'dark',
};

export const useLayoutStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: defaultTheme,
      
      setTheme: (newTheme: Partial<Theme>) => {
        set({
          theme: {
            ...get().theme,
            ...newTheme,
          },
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);