import { useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
function debounce<T extends Function>(fn: T, delay: number): T {
  let timeout = -1;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    if (timeout !== -1) {
      clearTimeout(timeout);
    }
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-argument
    timeout = setTimeout(fn, delay, ...args);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useDebounce<T extends Function>(cb: T, delay: number) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounce(cb, delay), [])
}