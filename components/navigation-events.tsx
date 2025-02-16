'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start and complete progress immediately
    NProgress.start();
    NProgress.set(1);
    
    // Remove after a tiny delay
    const timer = setTimeout(() => {
      NProgress.remove();
    }, 10);

    return () => {
      clearTimeout(timer);
      NProgress.remove();
    };
  }, [pathname, searchParams]);

  return null;
}
