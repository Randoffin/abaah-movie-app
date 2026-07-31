import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes fresh cache
      gcTime: 1000 * 60 * 60 * 24, // 24 hours memory retention
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Simple LocalStorage cache helper for robust offline fallback
const LOCAL_CACHE_PREFIX = 'abaahmovieapp_cache_';

export function getLocalCache<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(LOCAL_CACHE_PREFIX + key);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed.timestamp && Date.now() - parsed.timestamp > 1000 * 60 * 60 * 48) {
      localStorage.removeItem(LOCAL_CACHE_PREFIX + key);
      return null;
    }
    return parsed.value as T;
  } catch {
    return null;
  }
}

export function setLocalCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(
      LOCAL_CACHE_PREFIX + key,
      JSON.stringify({ value, timestamp: Date.now() })
    );
  } catch (err) {
    console.warn('LocalStorage cache write error:', err);
  }
}
