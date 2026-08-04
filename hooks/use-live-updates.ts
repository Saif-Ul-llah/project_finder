'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchStats } from '@/lib/api';

// Smart polling: periodically checks the lightweight /api/stats endpoint and
// signals when the backend data changed (new total or newer latest_created_at),
// so the listing can re-fetch itself automatically — without WebSockets.
export function useLiveUpdates(intervalMs = 30000) {
  const [revision, setRevision] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const lastSignature = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const s = await fetchStats();
        const signature = `${s.total}|${s.latest_created_at ?? ''}`;
        if (!active) return;
        setTotal(s.total);
        if (lastSignature.current !== null && signature !== lastSignature.current) {
          setRevision((r) => r + 1); // data changed since last check
        }
        lastSignature.current = signature;
      } catch {
        /* backend may be briefly unreachable — ignore and retry next tick */
      }
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { revision, total };
}
