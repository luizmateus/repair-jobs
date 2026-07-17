import { router } from 'expo-router';
import { useMemo } from 'react';

import { jobsByCreator } from '@/src/features/jobs/utils/jobUtils';
import { JobList } from '@/src/features/jobs/components/JobList';
import { NetworkErrorBanner } from '@/src/shared/components/NetworkErrorBanner';
import { Screen } from '@/src/shared/components/Screen';
import {
  HeaderPrimaryAction,
  HeaderTextAction,
  ScreenHeader,
} from '@/src/shared/components/ScreenHeader';
import { useAsyncAction } from '@/src/shared/hooks/useAsyncAction';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { useJobsStore } from '@/src/features/jobs/store/useJobsStore';
import { personaLabel } from '@/src/features/auth/constants/personas';

export default function ClientHome() {
  const session = useAuthStore((state) => state.session);
  const jobs = useJobsStore((state) => state.jobs);
  const seedError = useJobsStore((state) => state.seedError);
  const resyncJobs = useJobsStore((state) => state.resyncJobs);
  const retrySeed = useJobsStore((state) => state.retrySeed);
  const signOut = useAuthStore((state) => state.signOut);
  const { run, loading: retrying } = useAsyncAction();

  const myJobs = useMemo(() => {
    if (!session) return [];
    return jobsByCreator(jobs, session.userId);
  }, [jobs, session]);

  function handleJobPress(jobId: number) {
    router.push({
      pathname: '/(client)/job/[id]',
      params: { id: String(jobId) },
    });
  }

  function handleSignOut() {
    signOut();
    router.replace('/login');
  }

  function handleRetry() {
    void run(() => retrySeed(), {
      ok: 'Jobs updated',
      fail: 'Still offline — try again later',
    });
  }

  return (
    <Screen>
      <ScreenHeader
        variant="home"
        title="My Jobs"
        subtitle={session ? personaLabel(session) : undefined}
        actions={
          <>
            <HeaderPrimaryAction
              label="+ New"
              onPress={() => router.push('/(client)/create')}
            />
            <HeaderTextAction
              label="Log out"
              onPress={handleSignOut}
              tone="danger"
            />
          </>
        }
      />

      {seedError ? (
        <NetworkErrorBanner
          message={seedError}
          onRetry={handleRetry}
          isRetrying={retrying}
        />
      ) : null}

      <JobList
        jobs={myJobs}
        emptyMessage="You haven't posted any jobs yet. Tap + New to create one."
        onJobPress={handleJobPress}
        onRefresh={resyncJobs}
      />
    </Screen>
  );
}
