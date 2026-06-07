import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiError } from '../api/client';

export interface UseFetchOptions {
  debounce?: number;
  enabled?: boolean;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | Error | null;
  refresh: () => void;
}

export function useFetch<T>(
  fetcher: (signal?: AbortSignal) => Promise<T>,
  deps: any[] = [],
  options: UseFetchOptions = {},
): UseFetchResult<T> {
  const { debounce = 0, enabled = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const execute = useCallback(() => {
    if (!enabled) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const runFetch = async () => {
      if (!isMountedRef.current || controller.signal.aborted) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetcherRef.current(controller.signal);
        if (!isMountedRef.current || controller.signal.aborted) return;
        setData(result);
        setError(null);
      } catch (err: any) {
        if (!isMountedRef.current || controller.signal.aborted) return;
        if (err.name !== 'AbortError') {
          setError(err);
          setData(null);
        }
      } finally {
        if (!isMountedRef.current || controller.signal.aborted) return;
        setLoading(false);
      }
    };

    if (debounce > 0) {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = window.setTimeout(() => {
        runFetch();
      }, debounce);
    } else {
      runFetch();
    }
  }, [debounce, enabled]);

  const refresh = useCallback(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    isMountedRef.current = true;
    if (enabled) {
      execute();
    }
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [...deps, enabled, execute]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

export default useFetch;
