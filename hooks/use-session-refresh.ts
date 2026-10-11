'use client';

import { useEffect } from 'react';
import { ensureFreshAccess, hasSession } from '@/lib/auth-client';

// Keeps the access token fresh on pages that are sitting idle.
//
// `request()` renews before every API call, which covers anything actively
// fetching. It does not cover a tab left open on a quiet page: the token
// expires unnoticed, and the next thing the user does — often a navigation,
// which never touches the API — finds no usable token.
//
// Mounted once from the site header, so it runs on every page.
const CHECK_INTERVAL_MS = 4 * 60 * 1000;

export function useSessionRefresh() {
  useEffect(() => {
    let cancelled = false;

    const check = () => {
      // ensureFreshAccess is a no-op while the token has life left, so this
      // costs a cookie read on most ticks.
      if (cancelled || !hasSession()) return;
      void ensureFreshAccess();
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);

    // A backgrounded tab has its timers throttled, so it can come back with a
    // long-dead token and no tick having fired. Renew on the way back in.
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, []);
}
