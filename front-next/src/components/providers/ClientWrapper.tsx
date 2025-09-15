'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const HydrationProvider = dynamic(
  () => import('./HydrationProvider').then((mod) => ({ default: mod.HydrationProvider })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <HydrationProvider>{children}</HydrationProvider>;
}