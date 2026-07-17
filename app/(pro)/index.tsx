import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import {
  claimedJobsForPro,
  doneJobsForPro,
  openJobs,
} from '@/src/features/jobs/utils/jobUtils';
import { JobList } from '@/src/features/jobs/components/JobList';
import { NetworkErrorBanner } from '@/src/shared/components/NetworkErrorBanner';
import { Screen } from '@/src/shared/components/Screen';
import {
  HeaderTextAction,
  ScreenHeader,
} from '@/src/shared/components/ScreenHeader';
import { SegmentedControl } from '@/src/shared/components/SegmentedControl';
import { useAsyncAction } from '@/src/shared/hooks/useAsyncAction';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { useJobsStore } from '@/src/features/jobs/store/useJobsStore';
import { personaLabel } from '@/src/features/auth/constants/personas';
import type { Job } from '@/src/features/jobs/types';

export default function ProHome() {
  const session = useAuthStore((state) => state.session);
  const jobs = useJobsStore((state) => state.jobs);
  const seedError = useJobsStore((state) => state.seedError);
  const resyncJobs = useJobsStore((state) => state.resyncJobs);
  const retrySeed = useJobsStore((state) => state.retrySeed);
  const signOut = useAuthStore((state) => state.signOut);
  const { run, loading: retrying } = useAsyncAction();
  const [activeSegment, setActiveSegment] = useState(0);

  const availableJobs = useMemo(() => openJobs(jobs), [jobs]);
  const myJobs = useMemo(() => {
    if (!session) return [];
    return claimedJobsForPro(jobs, session.userId);
  }, [jobs, session]);
  const doneJobs = useMemo(() => {
    if (!session) return [];
    return doneJobsForPro(jobs, session.userId);
  }, [jobs, session]);

  function handleJobPress(jobId: number) {
    router.push({ pathname: '/(pro)/job/[id]', params: { id: String(jobId) } });
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

  const segments: {
    label: string;
    jobs: Job[];
    empty: string;
  }[] = [
    {
      label: 'Available',
      jobs: availableJobs,
      empty: 'No available jobs right now. Check back later.',
    },
    {
      label: 'Mine',
      jobs: myJobs,
      empty: "You haven't claimed any jobs yet. Browse Available to find one.",
    },
    {
      label: 'Done',
      jobs: doneJobs,
      empty:
        'No completed jobs yet. Mark a claimed job as done to see it here.',
    },
  ];
  const active = segments[activeSegment];

  return (
    <Screen>
      <ScreenHeader
        variant="home"
        title="Repair Jobs"
        subtitle={session ? personaLabel(session) : undefined}
        actions={
          <HeaderTextAction
            label="Log out"
            onPress={handleSignOut}
            tone="danger"
          />
        }
      />

      <SegmentedControl
        segments={segments.map((s) => s.label)}
        activeIndex={activeSegment}
        onChange={setActiveSegment}
      />

      {seedError ? (
        <NetworkErrorBanner
          message={seedError}
          onRetry={handleRetry}
          isRetrying={retrying}
        />
      ) : null}

      <JobList
        jobs={active.jobs}
        emptyMessage={active.empty}
        onJobPress={handleJobPress}
        onRefresh={resyncJobs}
      />
    </Screen>
  );
}
