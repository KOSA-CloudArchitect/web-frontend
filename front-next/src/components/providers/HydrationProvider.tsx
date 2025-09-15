'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist가 hydration을 완료할 때까지 기다림
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // 만약 이미 hydration이 완료되었다면
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  if (!isHydrated) {
    // Hydration 중에는 로딩 화면을 표시하거나 null을 반환
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}