'use client';

import { useEffect } from 'react';
import { syncApiBaseUrl } from '@/lib/api-config';

// Mounted once in the root layout. On every full page load / refresh,
// this fetches the current backend URL from the resolver and updates
// localStorage before the rest of the app starts fetching data.
export default function BackendUrlSync() {
  useEffect(() => {
    syncApiBaseUrl();
  }, []);

  return null;
}