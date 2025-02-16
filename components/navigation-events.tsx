'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start progress immediately
    NProgress.start();
    NProgress.set(0.4);

    // Schedule the completion after exactly 0.5 seconds
    const timer = setTimeout(() => {
      NProgress.set(1);
      // Remove after showing 100%
      setTimeout(() => {
        NProgress.remove();
      }, 10);
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.remove();
    };
  }, [pathname, searchParams]);

  return null;
}
