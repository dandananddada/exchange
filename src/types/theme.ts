export interface Theme {
  mode: 'light' | 'dark';
}

export interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
}