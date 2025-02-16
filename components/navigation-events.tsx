'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Start progress immediately
    NProgress.start();
    NProgress.set(0.4);

    // Create mutation observer to watch for content changes
    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // Content has been added to the page
          NProgress.done(true);
          NProgress.remove();
          observerRef.current?.disconnect();
          break;
        }
      }
    });

    // Start observing the main content area
    const mainContent = document.querySelector('main');
    if (mainContent) {
      observerRef.current.observe(mainContent, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      observerRef.current?.disconnect();
      NProgress.done(true);
      NProgress.remove();
    };
  }, [pathname, searchParams]);

  return null;
}
