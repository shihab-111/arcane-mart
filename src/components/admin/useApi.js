'use client';
import { useCallback, useEffect, useState } from 'react';

export async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const json = await res.json().catch(() => ({ ok: false, error: 'Bad response' }));
  if (!json.ok) throw new Error(json.error || 'Request failed');
  return json.data;
}

export function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    api(url).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [url]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [reload, ...deps]);
  return { data, error, loading, reload, setData };
}
