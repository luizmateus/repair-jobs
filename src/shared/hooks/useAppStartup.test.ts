import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { JOB_STATUS, type Job } from '@/src/features/jobs/types';
import { fetchSeedJobs } from '@/src/features/jobs/services/api';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { useJobsStore } from '@/src/features/jobs/store/useJobsStore';
import { useAppStartup, type AppStartup } from './useAppStartup';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/src/features/jobs/services/api', () => ({
  fetchSeedJobs: jest.fn().mockResolvedValue({
    jobs: [
      {
        id: 999,
        title: 'Seeded',
        description: '',
        status: 'open',
        creatorId: 5,
        assigneeId: null,
        createdAt: Date.now(),
        claimedAt: null,
        doneAt: null,
      },
    ],
    usedFallback: false,
  }),
  fetchCreateJob: jest.fn().mockResolvedValue(undefined),
  fetchUpdateJob: jest.fn().mockResolvedValue(undefined),
}));

const createWrapper = () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  Wrapper.displayName = 'EmptyWrapper';
  return Wrapper;
};

beforeEach(() => {
  jest.mocked(fetchSeedJobs).mockClear();
  useAuthStore.setState({
    session: null,
    hydrated: true,
  });
  useJobsStore.setState({
    jobs: [],
    hasSeeded: false,
    hydrated: true,
    seedError: null,
  });
});

describe('useAppStartup', () => {
  it('does not re-seed when the store has already seeded', async () => {
    const persistedJob: Job = {
      id: 42,
      title: 'Persisted',
      description: '',
      status: JOB_STATUS.Open,
      creatorId: 5,
      assigneeId: null,
      createdAt: 1000,
      claimedAt: null,
      doneAt: null,
    };
    useJobsStore.setState({ hasSeeded: true, jobs: [persistedJob] });

    await act(async () => {
      renderHook(() => useAppStartup(), { wrapper: createWrapper() });
    });

    expect(fetchSeedJobs).not.toHaveBeenCalled();
    expect(useJobsStore.getState().jobs).toEqual([persistedJob]);
  });

  it('seeds once when hasSeeded is false, then redirects to /login with no session', async () => {
    let result: { current: AppStartup } | undefined;
    await act(async () => {
      result = (
        await renderHook(() => useAppStartup(), { wrapper: createWrapper() })
      ).result;
    });
    await waitFor(() => {
      expect(result!.current.hydrated).toBe(true);
    });

    expect(fetchSeedJobs).toHaveBeenCalledTimes(1);
    expect(result!.current.redirectTo).toBe('/login');
  });

  it('redirects to /(client) when a Client session is persisted and does not re-seed', async () => {
    useAuthStore.setState({
      session: { role: 'client', userId: 1 },
    });
    useJobsStore.setState({
      hasSeeded: true,
      jobs: [],
    });

    let result: { current: AppStartup } | undefined;
    await act(async () => {
      result = (
        await renderHook(() => useAppStartup(), { wrapper: createWrapper() })
      ).result;
    });

    expect(fetchSeedJobs).not.toHaveBeenCalled();
    expect(result!.current.redirectTo).toBe('/(client)');
  });

  it('redirects to /(pro) when a Pro session is persisted and does not re-seed', async () => {
    useAuthStore.setState({
      session: { role: 'pro', userId: 2 },
    });
    useJobsStore.setState({
      hasSeeded: true,
      jobs: [],
    });

    let result: { current: AppStartup } | undefined;
    await act(async () => {
      result = (
        await renderHook(() => useAppStartup(), { wrapper: createWrapper() })
      ).result;
    });

    expect(fetchSeedJobs).not.toHaveBeenCalled();
    expect(result!.current.redirectTo).toBe('/(pro)');
  });
});
