import { useLocalSearchParams } from 'expo-router';

import { useJobsStore } from '../store/useJobsStore';
import type { Job } from '../types';

type Result =
  { status: 'ready'; job: Job; jobId: number } | { status: 'missing' };

export function useJobByIdParam(): Result {
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = Number(id);
  const job = useJobsStore((state) => state.jobs.find((j) => j.id === jobId));

  if (!job) {
    return { status: 'missing' };
  }

  return { status: 'ready', job, jobId };
}
