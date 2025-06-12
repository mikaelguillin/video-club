import { useCallback, useRef } from "react";

export default function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
  ): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
      undefined
    );
  
    return useCallback(
      ((...args: Parameters<T>) => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
  
        timeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      }) as T,
      [callback, delay]
    );
  }