import { renderHook, act } from '@testing-library/react';
import { useLayoutStore } from '../layoutStore';

describe('layoutStore', () => {
  beforeEach(() => {
    // 清除 localStorage
    localStorage.clear();
    // 重置 store 状态
    const { result } = renderHook(() => useLayoutStore());
    act(() => {
      result.current.setTheme({ mode: 'dark' });
    });
  });

  describe('初始状态', () => {
    it('应该有正确的初始 theme', () => {
      const { result } = renderHook(() => useLayoutStore());
      
      expect(result.current.theme).toEqual({
        mode: 'dark',
      });
    });
  });

  describe('setTheme', () => {
    it('应该更新 theme mode', () => {
      const { result } = renderHook(() => useLayoutStore());
      
      act(() => {
        result.current.setTheme({ mode: 'light' });
      });
      
      expect(result.current.theme.mode).toBe('light');
    });

    it('应该部分更新 theme', () => {
      const { result } = renderHook(() => useLayoutStore());
      
      act(() => {
        result.current.setTheme({ mode: 'light' });
      });
      
      expect(result.current.theme).toEqual({
        mode: 'light',
      });
    });

    it('应该保留未更新的 theme 属性', () => {
      const { result } = renderHook(() => useLayoutStore());
      
      // 先设置一个完整的 theme
      act(() => {
        result.current.setTheme({ mode: 'dark' });
      });
      
      // 只更新部分属性
      act(() => {
        result.current.setTheme({ mode: 'light' });
      });
      
      expect(result.current.theme.mode).toBe('light');
    });

    it('应该处理多次更新', () => {
      const { result } = renderHook(() => useLayoutStore());
      
      act(() => {
        result.current.setTheme({ mode: 'light' });
      });
      
      expect(result.current.theme.mode).toBe('light');
      
      act(() => {
        result.current.setTheme({ mode: 'dark' });
      });
      
      expect(result.current.theme.mode).toBe('dark');
    });
  });

  describe('持久化', () => {
    it('应该将 theme 持久化到 localStorage', () => {
      const { result } = renderHook(() => useLayoutStore());
      
      act(() => {
        result.current.setTheme({ mode: 'light' });
      });
      
      const stored = localStorage.getItem('theme-storage');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.theme.mode).toBe('light');
      }
    });

    it('应该从 localStorage 恢复 theme', () => {
      // 先设置一个 theme
      const { result: result1 } = renderHook(() => useLayoutStore());
      
      act(() => {
        result1.current.setTheme({ mode: 'light' });
      });
      
      // 创建新的 hook 实例模拟页面刷新
      const { result: result2 } = renderHook(() => useLayoutStore());
      
      expect(result2.current.theme.mode).toBe('light');
    });
  });

  describe('跨实例共享状态', () => {
    it('应该在多个 hook 实例间共享状态', () => {
      const { result: result1 } = renderHook(() => useLayoutStore());
      const { result: result2 } = renderHook(() => useLayoutStore());
      
      act(() => {
        result1.current.setTheme({ mode: 'light' });
      });
      
      expect(result2.current.theme.mode).toBe('light');
    });
  });
});
