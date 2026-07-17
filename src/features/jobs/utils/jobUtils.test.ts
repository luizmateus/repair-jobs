import {
  claimJob,
  claimedJobsForPro,
  completeJob,
  createJob,
  doneJobsForPro,
  jobsByCreator,
  JobTransitionError,
  mergeJobs,
  nextJobId,
  openJobs,
  resolveJobConflict,
} from './jobUtils';
import { JOB_STATUS, type Job } from '../types';

const openJob = (overrides: Partial<Job> = {}): Job => ({
  id: 1,
  title: 'Fix leaky faucet',
  description: 'Kitchen sink drip',
  status: JOB_STATUS.Open,
  creatorId: 1,
  assigneeId: null,
  createdAt: Date.now(),
  claimedAt: null,
  doneAt: null,
  ...overrides,
});

describe('createJob', () => {
  it('creates an open job with trimmed fields', () => {
    const job = createJob({
      id: 10,
      title: '  Broken hinge  ',
      description: '  Cabinet door  ',
      creatorId: 1,
    });
    expect(job).toMatchObject({
      id: 10,
      title: 'Broken hinge',
      description: 'Cabinet door',
      status: JOB_STATUS.Open,
      creatorId: 1,
      assigneeId: null,
    });
    expect(job.createdAt).toBeGreaterThan(0);
    expect(job.claimedAt).toBeNull();
    expect(job.doneAt).toBeNull();
  });

  it('rejects an empty title', () => {
    expect(() => createJob({ id: 1, title: '   ', creatorId: 1 })).toThrow(
      JobTransitionError,
    );
  });

  it('defaults description to empty string', () => {
    const job = createJob({ id: 1, title: 'Test', creatorId: 1 });
    expect(job.description).toBe('');
  });
});

describe('claimJob', () => {
  it('assigns an open job to the Pro', () => {
    const result = claimJob(openJob(), 2);
    expect(result).toMatchObject({
      status: JOB_STATUS.Claimed,
      assigneeId: 2,
    });
    expect(result.claimedAt).toBeGreaterThan(0);
  });

  it('rejects claiming a claimed job', () => {
    expect(() =>
      claimJob(openJob({ status: JOB_STATUS.Claimed, assigneeId: 2 }), 2),
    ).toThrow(/open jobs/);
  });

  it('rejects claiming a done job', () => {
    expect(() =>
      claimJob(openJob({ status: JOB_STATUS.Done, assigneeId: 2 }), 2),
    ).toThrow(/open jobs/);
  });

  it('rejects claiming an already-assigned job', () => {
    expect(() => claimJob(openJob({ assigneeId: 99 }), 2)).toThrow(
      /already assigned/,
    );
  });
});

describe('completeJob', () => {
  it('marks a claimed job done for the assignee', () => {
    const claimed = claimJob(openJob(), 2);
    const result = completeJob(claimed, 2);
    expect(result).toMatchObject({
      status: JOB_STATUS.Done,
    });
    expect(result.doneAt).toBeGreaterThan(0);
  });

  it('rejects completion by a different Pro', () => {
    const claimed = claimJob(openJob(), 2);
    expect(() => completeJob(claimed, 99)).toThrow(/assigned Pro/);
  });

  it('rejects completing an open job', () => {
    expect(() => completeJob(openJob(), 2)).toThrow(/claimed jobs/);
  });

  it('rejects completing a done job', () => {
    const claimed = claimJob(openJob(), 2);
    const done = completeJob(claimed, 2);
    expect(() => completeJob(done, 2)).toThrow(/claimed jobs/);
  });
});

describe('nextJobId', () => {
  it('returns 1 for an empty list', () => {
    expect(nextJobId([])).toBe(1);
  });

  it('returns max id + 1', () => {
    expect(nextJobId([openJob({ id: 3 }), openJob({ id: 12 })])).toBe(13);
  });
});

describe('job filters', () => {
  const jobs: Job[] = [
    openJob({ id: 1, creatorId: 1 }),
    openJob({
      id: 2,
      creatorId: 1,
      status: JOB_STATUS.Claimed,
      assigneeId: 2,
    }),
    openJob({
      id: 3,
      creatorId: 3,
      status: JOB_STATUS.Done,
      assigneeId: 2,
    }),
    openJob({
      id: 4,
      creatorId: 1,
      status: JOB_STATUS.Claimed,
      assigneeId: 99,
    }),
  ];

  it('jobsByCreator returns jobs for a creator', () => {
    expect(jobsByCreator(jobs, 1).map((j) => j.id)).toEqual([1, 2, 4]);
  });

  it('openJobs returns only open jobs', () => {
    expect(openJobs(jobs).map((j) => j.id)).toEqual([1]);
  });

  it('claimedJobsForPro returns claimed jobs for that pro', () => {
    expect(claimedJobsForPro(jobs, 2).map((j) => j.id)).toEqual([2]);
  });

  it('doneJobsForPro returns done jobs for that pro', () => {
    expect(doneJobsForPro(jobs, 2).map((j) => j.id)).toEqual([3]);
  });
});

describe('mergeJobs / resolveJobConflict', () => {
  it('keeps local when local has progressed further', () => {
    const local = openJob({
      status: JOB_STATUS.Claimed,
      assigneeId: 2,
      claimedAt: 100,
    });
    const fresh = openJob({ title: 'API title' });
    expect(resolveJobConflict(local, fresh)).toBe(local);
  });

  it('takes fresh when remote has progressed further', () => {
    const local = openJob();
    const fresh = openJob({
      status: JOB_STATUS.Done,
      assigneeId: 2,
      title: 'Done on API',
    });
    expect(resolveJobConflict(local, fresh)).toEqual(fresh);
  });

  it('keeps local-only jobs and merges overlapping ids', () => {
    const localOnly = openJob({ id: 99, title: 'Mine' });
    const claimed = openJob({
      id: 1,
      status: JOB_STATUS.Claimed,
      assigneeId: 2,
      claimedAt: 50,
    });
    const freshOpen = openJob({ id: 1, title: 'From API' });
    const freshNew = openJob({ id: 2, title: 'New from API' });

    const merged = mergeJobs([localOnly, claimed], [freshOpen, freshNew]);
    expect(merged.map((j) => j.id).sort()).toEqual([1, 2, 99]);
    expect(merged.find((j) => j.id === 1)?.status).toBe(JOB_STATUS.Claimed);
    expect(merged.find((j) => j.id === 99)?.title).toBe('Mine');
    expect(merged.find((j) => j.id === 2)?.title).toBe('New from API');
  });
});
