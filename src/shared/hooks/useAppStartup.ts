import { useEffect } from 'react';

import type { Session } from '@/src/features/auth/types';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { useJobsStore } from '@/src/features/jobs/store/useJobsStore';
import { fetchSeedJobs } from '@/src/features/jobs/services/api';

type HomeRoute = '/(client)' | '/(pro)';

function routeForSession(session: Session): HomeRoute {
  return session.role === 'client' ? '/(client)' : '/(pro)';
}

export type AppStartupReady = {
  hydrated: true;
  redirectTo: '/login' | HomeRoute;
};

export type AppStartupPending = {
  hydrated: false;
  redirectTo: null;
};

export type AppStartup = AppStartupReady | AppStartupPending;

export function useAppStartup(): AppStartup {
  const authHydrated = useAuthStore((state) => state.hydrated);
  const jobsHydrated = useJobsStore((state) => state.hydrated);
  const hasSeeded = useJobsStore((state) => state.hasSeeded);
  const setSeedJobs = useJobsStore((state) => state.setSeedJobs);
  const session = useAuthStore((state) => state.session);

  const storageHydrated = authHydrated && jobsHydrated;

  useEffect(() => {
    if (storageHydrated && !hasSeeded) {
      fetchSeedJobs().then(({ jobs, usedFallback }) => {
        setSeedJobs(jobs, { usedFallback });
      });
    }
  }, [storageHydrated, hasSeeded, setSeedJobs]);

  const hydrated = storageHydrated && hasSeeded;

  if (!hydrated) return { hydrated: false, redirectTo: null };
  return {
    hydrated: true,
    redirectTo: session ? routeForSession(session) : '/login',
  };
}
