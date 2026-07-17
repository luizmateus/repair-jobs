import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { JobCard } from './JobCard';
import { JOB_STATUS, type Job } from '../types';

describe('JobCard Component', () => {
  const mockJob: Job = {
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

  it('renders the job details correctly', async () => {
    await render(<JobCard job={mockJob} onPress={jest.fn()} />);

    expect(screen.getByText('Fix leaky kitchen faucet')).toBeTruthy();
    expect(
      screen.getByText('The faucet drips continuously under the sink.'),
    ).toBeTruthy();
    expect(screen.getByText('Open')).toBeTruthy();
    expect(screen.getByText('1h ago')).toBeTruthy();
  });

  it('calls onPress with the correct jobId when pressed', async () => {
    const onPressMock = jest.fn();
    await render(<JobCard job={mockJob} onPress={onPressMock} />);

    await fireEvent.press(screen.getByText('Fix leaky kitchen faucet'));
    expect(onPressMock).toHaveBeenCalledWith(101);
  });
});
