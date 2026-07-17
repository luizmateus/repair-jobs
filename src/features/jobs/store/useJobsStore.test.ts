jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] ?? null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
  };
});

jest.mock('../services/api', () => ({
  fetchCreateJob: jest.fn().mockResolvedValue(undefined),
  fetchUpdateJob: jest.fn().mockResolvedValue(undefined),
  fetchSeedJobs: jest.fn().mockResolvedValue({ jobs: [], usedFallback: false }),
}));

import { fetchSeedJobs } from '../services/api';
import { JOB_STATUS } from '../types';
import {
  REFRESH_FAILED_MESSAGE,
  SEED_OFFLINE_MESSAGE,
  useJobsStore,
} from './useJobsStore';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import {
  CLIENT_PERSONA,
  PRO_PERSONA,
} from '@/src/features/auth/constants/personas';

beforeEach(() => {
  useAuthStore.setState({
    session: null,
    hydrated: true,
  });
  useJobsStore.setState({
    jobs: [],
    hasSeeded: true,
    hydrated: true,
    seedError: null,
  });
  jest.mocked(fetchSeedJobs).mockClear();
});

describe('useJobsStore — createClientJob', () => {
  it('appends a job as client', async () => {
    useAuthStore.setState({ session: CLIENT_PERSONA });
    await useJobsStore
      .getState()
      .createClientJob('Broken pipe', 'Under sink', CLIENT_PERSONA);
    const jobs = useJobsStore.getState().jobs;
    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      title: 'Broken pipe',
      description: 'Under sink',
      status: JOB_STATUS.Open,
      creatorId: CLIENT_PERSONA.userId,
    });
  });

  it('throws when not a client', () => {
    return expect(
      useJobsStore.getState().createClientJob('X', '', PRO_PERSONA),
    ).rejects.toThrow(/Only a Client/);
  });
});

describe('useJobsStore — claimOpenJob', () => {
  it('transitions an open job to claimed as pro', async () => {
    useAuthStore.setState({ session: CLIENT_PERSONA });
    await useJobsStore
      .getState()
      .createClientJob('To claim', '', CLIENT_PERSONA);
    const jobId = useJobsStore.getState().jobs[0].id;

    await useJobsStore.getState().claimOpenJob(jobId, PRO_PERSONA);

    const job = useJobsStore.getState().jobs.find((j) => j.id === jobId);
    expect(job?.status).toBe(JOB_STATUS.Claimed);
    expect(job?.assigneeId).toBe(PRO_PERSONA.userId);
    expect(job?.claimedAt).toBeGreaterThan(0);
  });

  it('throws when not a pro', () => {
    useJobsStore.setState({
      jobs: [
        {
          id: 123,
          title: 'To claim',
          description: '',
          status: JOB_STATUS.Open,
          creatorId: CLIENT_PERSONA.userId,
          assigneeId: null,
          createdAt: Date.now(),
          claimedAt: null,
          doneAt: null,
        },
      ],
    });
    return expect(
      useJobsStore.getState().claimOpenJob(123, CLIENT_PERSONA),
    ).rejects.toThrow(/Only a Pro/);
  });
});

describe('useJobsStore — completeClaimedJob', () => {
  it('transitions a claimed job to done as the assigned pro', async () => {
    useAuthStore.setState({ session: CLIENT_PERSONA });
    await useJobsStore
      .getState()
      .createClientJob('To complete', '', CLIENT_PERSONA);
    const jobId = useJobsStore.getState().jobs[0].id;

    await useJobsStore.getState().claimOpenJob(jobId, PRO_PERSONA);
    await useJobsStore.getState().completeClaimedJob(jobId, PRO_PERSONA);

    const job = useJobsStore.getState().jobs.find((j) => j.id === jobId);
    expect(job?.status).toBe(JOB_STATUS.Done);
    expect(job?.doneAt).toBeGreaterThan(0);
  });

  it('throws when not a pro', () => {
    useJobsStore.setState({
      jobs: [
        {
          id: 123,
          title: 'X',
          description: '',
          status: JOB_STATUS.Claimed,
          creatorId: 5,
          assigneeId: PRO_PERSONA.userId,
          createdAt: Date.now(),
          claimedAt: null,
          doneAt: null,
        },
      ],
    });
    return expect(
      useJobsStore.getState().completeClaimedJob(123, CLIENT_PERSONA),
    ).rejects.toThrow(/Only a Pro/);
  });
});

describe('useJobsStore — resyncJobs', () => {
  it('merges fresh seed with locally-created jobs (no id collisions)', async () => {
    useAuthStore.setState({ session: CLIENT_PERSONA });
    await useJobsStore
      .getState()
      .createClientJob('Local-only', '', CLIENT_PERSONA);
    const localId = useJobsStore.getState().jobs[0].id;

    jest.mocked(fetchSeedJobs).mockResolvedValue({
      jobs: [
        {
          id: 1,
          title: 'From API',
          description: '',
          status: JOB_STATUS.Open,
          creatorId: 5,
          assigneeId: null,
          createdAt: 1,
          claimedAt: null,
          doneAt: null,
        },
      ],
      usedFallback: false,
    });

    await useJobsStore.getState().resyncJobs();

    const ids = useJobsStore
      .getState()
      .jobs.map((job) => job.id)
      .sort();
    expect(ids).toContain(localId);
    expect(ids).toContain(1);
  });

  it('keeps local claim when fresh seed still reports open for the same id', async () => {
    useJobsStore.setState({
      jobs: [
        {
          id: 5,
          title: 'Claimed locally',
          description: '',
          status: JOB_STATUS.Claimed,
          creatorId: 5,
          assigneeId: PRO_PERSONA.userId,
          createdAt: 1,
          claimedAt: 2,
          doneAt: null,
        },
      ],
    });

    jest.mocked(fetchSeedJobs).mockResolvedValue({
      jobs: [
        {
          id: 5,
          title: 'Still open on API',
          description: '',
          status: JOB_STATUS.Open,
          creatorId: 5,
          assigneeId: null,
          createdAt: 1,
          claimedAt: null,
          doneAt: null,
        },
      ],
      usedFallback: false,
    });

    await useJobsStore.getState().resyncJobs();

    const job = useJobsStore.getState().jobs.find((j) => j.id === 5);
    expect(job?.status).toBe(JOB_STATUS.Claimed);
    expect(job?.assigneeId).toBe(PRO_PERSONA.userId);
    expect(job?.title).toBe('Claimed locally');
  });

  it('takes fresh when remote is further along than local', async () => {
    useJobsStore.setState({
      jobs: [
        {
          id: 5,
          title: 'Stale local copy',
          description: '',
          status: JOB_STATUS.Open,
          creatorId: 5,
          assigneeId: null,
          createdAt: 1,
          claimedAt: null,
          doneAt: null,
        },
      ],
    });

    jest.mocked(fetchSeedJobs).mockResolvedValue({
      jobs: [
        {
          id: 5,
          title: 'Fresh from API',
          description: '',
          status: JOB_STATUS.Done,
          creatorId: 5,
          assigneeId: 2,
          createdAt: 2,
          claimedAt: null,
          doneAt: null,
        },
      ],
      usedFallback: false,
    });

    await useJobsStore.getState().resyncJobs();

    const job = useJobsStore.getState().jobs.find((j) => j.id === 5);
    expect(job?.title).toBe('Fresh from API');
    expect(job?.status).toBe(JOB_STATUS.Done);
  });

  it('sets seedError and keeps local jobs when refresh fails', async () => {
    const localJob = {
      id: 9,
      title: 'Keep me',
      description: '',
      status: JOB_STATUS.Claimed,
      creatorId: 1,
      assigneeId: PRO_PERSONA.userId,
      createdAt: 1,
      claimedAt: 2,
      doneAt: null,
    };
    useJobsStore.setState({ jobs: [localJob], seedError: null });
    jest.mocked(fetchSeedJobs).mockRejectedValue(new Error('network'));

    await useJobsStore.getState().resyncJobs();

    expect(useJobsStore.getState().jobs).toEqual([localJob]);
    expect(useJobsStore.getState().seedError).toBe(REFRESH_FAILED_MESSAGE);
  });
});

describe('useJobsStore — setSeedJobs / retrySeed', () => {
  it('records an offline seedError when seed used fallback', () => {
    useJobsStore.getState().setSeedJobs([], { usedFallback: true });
    expect(useJobsStore.getState().seedError).toBe(SEED_OFFLINE_MESSAGE);
    expect(useJobsStore.getState().hasSeeded).toBe(true);
  });

  it('clears seedError after a successful retry', async () => {
    useJobsStore.setState({
      jobs: [],
      seedError: SEED_OFFLINE_MESSAGE,
      hasSeeded: true,
    });
    jest.mocked(fetchSeedJobs).mockResolvedValue({
      jobs: [
        {
          id: 1,
          title: 'Back online',
          description: '',
          status: JOB_STATUS.Open,
          creatorId: 5,
          assigneeId: null,
          createdAt: 1,
          claimedAt: null,
          doneAt: null,
        },
      ],
      usedFallback: false,
    });

    await useJobsStore.getState().retrySeed();

    expect(useJobsStore.getState().seedError).toBeNull();
    expect(useJobsStore.getState().jobs[0]?.title).toBe('Back online');
  });

  it('keeps seedError and throws when retry still fails', async () => {
    useJobsStore.setState({ seedError: SEED_OFFLINE_MESSAGE });
    jest.mocked(fetchSeedJobs).mockRejectedValue(new Error('network'));

    await expect(useJobsStore.getState().retrySeed()).rejects.toThrow(
      /Could not reach/,
    );
    expect(useJobsStore.getState().seedError).toBe(SEED_OFFLINE_MESSAGE);
  });
});
