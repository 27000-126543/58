import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
  skip?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function getUserId(): string | null {
  return localStorage.getItem('tp_user_id');
}

export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = {}
): UseFetchResult<T> {
  const { skip = false, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!skip && !!url);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const userId = getUserId();
      if (userId) headers['X-User-Id'] = userId;

      const res = await fetch(url.startsWith('http') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`请求失败: ${res.status}`);
      }

      const json = await res.json();
      setData(json.data as T);
      onSuccess?.(json.data);
    } catch (err: any) {
      const msg = err.message || '请求出错';
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (skip || !url) return;
    fetchData();
  }, [url, skip, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
