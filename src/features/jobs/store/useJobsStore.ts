import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { fetchCreateJob, fetchSeedJobs, fetchUpdateJob } from '../services/api';
import type { Role, Session } from '@/src/features/auth/types';
import { asyncPersistStorage } from '@/src/shared/store/asyncPersistStorage';
import type { Job } from '../types';
import {
  claimJob,
  completeJob,
  createJob,
  mergeJobs,
  nextJobId,
} from '../utils/jobUtils';

export const SEED_OFFLINE_MESSAGE =
  "Couldn't reach the server. Showing offline sample jobs.";
export const REFRESH_FAILED_MESSAGE =
  "Couldn't refresh. Your local jobs are unchanged.";

type JobsState = {
  jobs: Job[];
  hasSeeded: boolean;
  hydrated: boolean;
  seedError: string | null;
  setSeedJobs: (jobs: Job[], meta?: { usedFallback?: boolean }) => void;
  setHydrated: (hydrated: boolean) => void;
  clearSeedError: () => void;
  retrySeed: () => Promise<void>;
  resyncJobs: () => Promise<void>;
  createClientJob: (
    title: string,
    description: string,
    session: Session,
  ) => Promise<void>;
  claimOpenJob: (jobId: number, session: Session) => Promise<void>;
  completeClaimedJob: (jobId: number, session: Session) => Promise<void>;
};

function requireSession(session: Session | null, role: Role): Session {
  if (!session || session.role !== role) {
    const label = role === 'client' ? 'Client' : 'Pro';
    throw new Error(`Only a ${label} can perform this action`);
  }
  return session;
}

export const useJobsStore = create<JobsState>()(
  persist(
    (set, get) => ({
      jobs: [],
      hasSeeded: false,
      hydrated: false,
      seedError: null,

      setSeedJobs: (jobs, meta) =>
        set({
          jobs,
          hasSeeded: true,
          seedError: meta?.usedFallback ? SEED_OFFLINE_MESSAGE : null,
        }),

      setHydrated: (hydrated) => set({ hydrated }),

      clearSeedError: () => set({ seedError: null }),

      retrySeed: async () => {
        try {
          const { jobs } = await fetchSeedJobs({ allowFallback: false });
          set({
            jobs: mergeJobs(get().jobs, jobs),
            hasSeeded: true,
            seedError: null,
          });
        } catch {
          set({
            seedError: get().seedError ?? SEED_OFFLINE_MESSAGE,
          });
          throw new Error('Could not reach the server');
        }
      },

      resyncJobs: async () => {
        try {
          const { jobs: fresh } = await fetchSeedJobs({
            allowFallback: false,
          });
          set({
            jobs: mergeJobs(get().jobs, fresh),
            seedError: null,
          });
        } catch {
          set({ seedError: REFRESH_FAILED_MESSAGE });
        }
      },

      createClientJob: async (title, description, session: Session) => {
        requireSession(session, 'client');
        const { jobs } = get();

        const job = createJob({
          id: nextJobId(jobs),
          title,
          description,
          creatorId: session.userId,
        });

        set({ jobs: [job, ...jobs] });
        void fetchCreateJob(job);
      },

      claimOpenJob: async (jobId, session: Session) => {
        requireSession(session, 'pro');
        const { jobs } = get();

        const updated = jobs.map((job) =>
          job.id === jobId ? claimJob(job, session.userId) : job,
        );
        set({ jobs: updated });

        const claimed = updated.find((job) => job.id === jobId);
        if (claimed) void fetchUpdateJob(claimed);
      },

      completeClaimedJob: async (jobId, session: Session) => {
        requireSession(session, 'pro');
        const { jobs } = get();

        const updated = jobs.map((job) =>
          job.id === jobId ? completeJob(job, session.userId) : job,
        );
        set({ jobs: updated });

        const completed = updated.find((job) => job.id === jobId);
        if (completed) void fetchUpdateJob(completed);
      },
    }),
    {
      name: 'repair-jobs-jobs-store',
      storage: asyncPersistStorage,
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Jobs hydration failed:', error);
        }
        useJobsStore.setState({ hydrated: true });
      },
      partialize: (state) => ({
        jobs: state.jobs,
        hasSeeded: state.hasSeeded,
      }),
    },
  ),
);
