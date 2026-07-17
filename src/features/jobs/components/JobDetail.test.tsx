import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { JobDetail } from './JobDetail';
import { JOB_STATUS, type Job } from '../types';

const BASE_JOB: Job = {
  id: 101,
  title: 'Fix leaky kitchen faucet',
  description: 'The faucet drips continuously under the sink.',
  status: JOB_STATUS.Open,
  creatorId: 1,
  assigneeId: null,
  createdAt: Date.now() - 3600_000,
  claimedAt: null,
  doneAt: null,
};

function makeJob(overrides: Partial<Job> = {}): Job {
  return { ...BASE_JOB, ...overrides };
}

describe('JobDetail', () => {
  it('renders title, status badge, creator name, and posted time', async () => {
    await render(<JobDetail job={makeJob()} />);
    expect(screen.getByText('Fix leaky kitchen faucet')).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
    expect(screen.getByText('Alex')).toBeTruthy();
    expect(screen.getByText('1h ago')).toBeTruthy();
  });

  it('renders description when present', async () => {
    await render(<JobDetail job={makeJob()} />);
    expect(
      screen.getByText('The faucet drips continuously under the sink.'),
    ).toBeTruthy();
  });

  it('renders "No description provided" when description is empty', async () => {
    await render(<JobDetail job={makeJob({ description: '' })} />);
    expect(screen.getByText('No description provided')).toBeTruthy();
  });

  it('shows "Not yet assigned" when assigneeId is null', async () => {
    await render(<JobDetail job={makeJob({ assigneeId: null })} />);
    expect(screen.getByText('Not yet assigned')).toBeTruthy();
  });

  it('shows assignee name when assigneeId is set', async () => {
    await render(
      <JobDetail
        job={makeJob({ status: JOB_STATUS.Claimed, assigneeId: 2 })}
      />,
    );
    expect(screen.getByText('Sam')).toBeTruthy();
  });

  it('shows Claimed meta row only when claimedAt is set', async () => {
    const { rerender } = await render(<JobDetail job={makeJob()} />);
    expect(screen.queryByText('Claimed')).toBeNull();

    await rerender(
      <JobDetail
        job={makeJob({
          status: JOB_STATUS.Claimed,
          claimedAt: Date.now() - 1800_000,
        })}
      />,
    );
    expect(screen.getAllByText('Claimed').length).toBe(2);
  });

  it('shows Completed meta row only when doneAt is set', async () => {
    const { rerender } = await render(<JobDetail job={makeJob()} />);
    expect(screen.queryByText('Completed')).toBeNull();

    await rerender(
      <JobDetail
        job={makeJob({
          status: JOB_STATUS.Done,
          doneAt: Date.now() - 900_000,
        })}
      />,
    );
    expect(screen.getByText('Completed')).toBeTruthy();
  });

  it('renders actionBar when provided', async () => {
    await render(<JobDetail job={makeJob()} actionBar={<></>} />);
  });
});
