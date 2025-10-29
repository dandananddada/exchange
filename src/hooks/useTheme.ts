import { useLayoutStore } from '@/stores/layoutStore';
import { Theme } from '@/types/theme';
import { useCallback } from 'react';

export const useThemes = () => {
  const { theme, setTheme } = useLayoutStore();

  // 获取当前主题
  const getTheme = useCallback((): Theme => {
    console.log('current theme in hook:', theme);
    return theme;
  }, [theme]);

  // 设置主题
  const updateTheme = useCallback((newTheme: Partial<Theme>) => {
    setTheme(newTheme);
  }, [setTheme]);

  // 切换亮色/暗色模式
  const toggleTheme = useCallback(() => {
    setTheme({
      mode: theme.mode === 'light' ? 'dark' : 'light',
    });
  }, [theme.mode, setTheme]);

  return {
    getTheme,
    setTheme: updateTheme,
    toggleTheme,
    currentTheme: theme,
  };
};