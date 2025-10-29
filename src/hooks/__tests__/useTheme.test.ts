import { renderHook, act } from '@testing-library/react';
import { useThemes } from '../useTheme';
import { useLayoutStore } from '@/stores/layoutStore';
import { Theme } from '@/types/theme';

// Mock the layout store
jest.mock('@/stores/layoutStore');

describe('useThemes', () => {
  const mockTheme: Theme = {
    mode: 'dark',
    primaryColor: '#1a73e8',
    backgroundColor: '#121212',
  };

  const mockStore = {
    theme: mockTheme,
    setTheme: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useLayoutStore as unknown as jest.Mock).mockReturnValue(mockStore);
    console.log = jest.fn(); // Mock console.log
  });

  it('should get current theme', () => {
    const { result } = renderHook(() => useThemes());

    const theme = result.current.getTheme();

    expect(theme).toEqual(mockTheme);
    expect(console.log).toHaveBeenCalledWith('current theme in hook:', mockTheme);
  });

  it('should return currentTheme directly', () => {
    const { result } = renderHook(() => useThemes());

    expect(result.current.currentTheme).toEqual(mockTheme);
  });

  it('should update theme with partial theme object', () => {
    const { result } = renderHook(() => useThemes());

    const newTheme = { primaryColor: '#ff0000' };

    act(() => {
      result.current.setTheme(newTheme);
    });

    expect(mockStore.setTheme).toHaveBeenCalledWith(newTheme);
  });

  it('should update theme with complete theme object', () => {
    const { result } = renderHook(() => useThemes());

    const newTheme: Theme = {
      mode: 'light',
      primaryColor: '#ffffff',
      backgroundColor: '#000000',
    };

    act(() => {
      result.current.setTheme(newTheme);
    });

    expect(mockStore.setTheme).toHaveBeenCalledWith(newTheme);
  });

  it('should toggle from dark to light mode', () => {
    mockStore.theme = { ...mockTheme, mode: 'dark' };

    const { result } = renderHook(() => useThemes());

    act(() => {
      result.current.toggleTheme();
    });

    expect(mockStore.setTheme).toHaveBeenCalledWith({ mode: 'light' });
  });

  it('should toggle from light to dark mode', () => {
    mockStore.theme = { ...mockTheme, mode: 'light' };

    const { result } = renderHook(() => useThemes());

    act(() => {
      result.current.toggleTheme();
    });

    expect(mockStore.setTheme).toHaveBeenCalledWith({ mode: 'dark' });
  });

  it('should maintain other theme properties when toggling', () => {
    const themeWithColor: Theme = {
      mode: 'dark',
      primaryColor: '#ff0000',
      backgroundColor: '#000000',
    };

    mockStore.theme = themeWithColor;

    const { result } = renderHook(() => useThemes());

    act(() => {
      result.current.toggleTheme();
    });

    // Should only change mode, not other properties
    expect(mockStore.setTheme).toHaveBeenCalledWith({ mode: 'light' });
  });

  it('should handle multiple theme updates', () => {
    const { result } = renderHook(() => useThemes());

    act(() => {
      result.current.setTheme({ primaryColor: '#ff0000' });
      result.current.setTheme({ backgroundColor: '#ffffff' });
      result.current.setTheme({ mode: 'light' });
    });

    expect(mockStore.setTheme).toHaveBeenCalledTimes(3);
  });

  it('should handle multiple toggles', () => {
    mockStore.theme = { ...mockTheme, mode: 'dark' };

    const { result, rerender } = renderHook(() => useThemes());

    act(() => {
      result.current.toggleTheme();
    });

    // Update mock store to reflect the change
    mockStore.theme = { ...mockTheme, mode: 'light' };
    rerender();

    act(() => {
      result.current.toggleTheme();
    });

    expect(mockStore.setTheme).toHaveBeenCalledTimes(2);
    expect(mockStore.setTheme).toHaveBeenNthCalledWith(1, { mode: 'light' });
    expect(mockStore.setTheme).toHaveBeenNthCalledWith(2, { mode: 'dark' });
  });

  it('should call getTheme on every render', () => {
    const { result, rerender } = renderHook(() => useThemes());

    result.current.getTheme();
    rerender();
    result.current.getTheme();

    expect(console.log).toHaveBeenCalledTimes(2);
  });
});
