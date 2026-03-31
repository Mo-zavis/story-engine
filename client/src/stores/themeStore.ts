import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem('se-theme') as Theme) || 'dark',
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('se-theme', next);
      return { theme: next };
    }),
  setTheme: (t) => {
    localStorage.setItem('se-theme', t);
    set({ theme: t });
  },
}));

// Semantic tokens — softer than raw zinc/white
export const tokens = {
  dark: {
    bg: 'bg-neutral-950',
    bgSub: 'bg-neutral-900',
    bgCard: 'bg-neutral-900/80',
    bgHover: 'hover:bg-neutral-800',
    border: 'border-neutral-800',
    borderSub: 'border-neutral-700/50',
    text: 'text-neutral-200',
    textSub: 'text-neutral-400',
    textMuted: 'text-neutral-500',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500/30',
  },
  light: {
    bg: 'bg-stone-50',
    bgSub: 'bg-white',
    bgCard: 'bg-white',
    bgHover: 'hover:bg-stone-100',
    border: 'border-stone-200',
    borderSub: 'border-stone-200/80',
    text: 'text-stone-800',
    textSub: 'text-stone-500',
    textMuted: 'text-stone-400',
    accent: 'text-amber-600',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
  },
} as const;

export function useTokens() {
  const theme = useThemeStore((s) => s.theme);
  return tokens[theme];
}
