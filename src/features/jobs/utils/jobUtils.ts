import { JOB_STATUS, type Job, type JobStatus } from '../types';

export class JobTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JobTransitionError';
  }
}

const STATUS_RANK: Record<JobStatus, number> = {
  open: 0,
  claimed: 1,
  done: 2,
};

export function resolveJobConflict(local: Job, fresh: Job): Job {
  const localRank = STATUS_RANK[local.status];
  const freshRank = STATUS_RANK[fresh.status];

  if (localRank > freshRank) return local;
  if (freshRank > localRank) return fresh;

  if (local.status === JOB_STATUS.Claimed) return local;

  if (local.status === JOB_STATUS.Done) {
    return {
      ...fresh,
      assigneeId: local.assigneeId ?? fresh.assigneeId,
      claimedAt: local.claimedAt ?? fresh.claimedAt,
      doneAt: local.doneAt ?? fresh.doneAt,
    };
  }

  return fresh;
}

export function mergeJobs(local: Job[], fresh: Job[]): Job[] {
  const localById = new Map(local.map((job) => [job.id, job]));
  const freshIds = new Set(fresh.map((job) => job.id));

  const mergedFromFresh = fresh.map((freshJob) => {
    const localJob = localById.get(freshJob.id);
    if (!localJob) return freshJob;
    return resolveJobConflict(localJob, freshJob);
  });

  const localOnly = local.filter((job) => !freshIds.has(job.id));
  return [...localOnly, ...mergedFromFresh];
}

export function createJob(input: {
  id: number;
  title: string;
  description?: string;
  creatorId: number;
}): Job {
  const title = input.title.trim();
  if (!title) {
    throw new JobTransitionError('Title is required');
  }

  const now = Date.now();
  return {
    id: input.id,
    title,
    description: (input.description ?? '').trim(),
    status: JOB_STATUS.Open,
    creatorId: input.creatorId,
    assigneeId: null,
    createdAt: now,
    claimedAt: null,
    doneAt: null,
  };
}

export function claimJob(job: Job, proId: number): Job {
  if (job.status !== JOB_STATUS.Open) {
    throw new JobTransitionError('Only open jobs can be claimed');
  }
  if (job.assigneeId !== null) {
    throw new JobTransitionError('Job is already assigned');
  }

  return {
    ...job,
    status: JOB_STATUS.Claimed,
    assigneeId: proId,
    claimedAt: Date.now(),
  };
}

export function completeJob(job: Job, proId: number): Job {
  if (job.status !== JOB_STATUS.Claimed) {
    throw new JobTransitionError('Only claimed jobs can be marked done');
  }
  if (job.assigneeId !== proId) {
    throw new JobTransitionError('Only the assigned Pro can complete this job');
  }

  return {
    ...job,
    status: JOB_STATUS.Done,
    doneAt: Date.now(),
  };
}

export function nextJobId(jobs: Job[]): number {
  if (jobs.length === 0) return 1;
  return Math.max(...jobs.map((job) => job.id)) + 1;
}

export function jobsByCreator(jobs: Job[], creatorId: number): Job[] {
  return jobs.filter((job) => job.creatorId === creatorId);
}

export function openJobs(jobs: Job[]): Job[] {
  return jobs.filter((job) => job.status === JOB_STATUS.Open);
}

export function claimedJobsForPro(jobs: Job[], proId: number): Job[] {
  return jobs.filter(
    (job) => job.status === JOB_STATUS.Claimed && job.assigneeId === proId,
  );
}

export function doneJobsForPro(jobs: Job[], proId: number): Job[] {
  return jobs.filter(
    (job) => job.status === JOB_STATUS.Done && job.assigneeId === proId,
  );
}
