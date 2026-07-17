import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { StatusBadge } from './StatusBadge';
import { JOB_STATUS } from '../types';

describe('StatusBadge Component', () => {
  it('renders correctly for Open status', async () => {
    await render(<StatusBadge status={JOB_STATUS.Open} />);
    expect(screen.getByText('Open')).toBeTruthy();
  });

  it('renders correctly for Claimed status', async () => {
    await render(<StatusBadge status={JOB_STATUS.Claimed} />);
    expect(screen.getByText('Claimed')).toBeTruthy();
  });

  it('renders correctly for Done status', async () => {
    await render(<StatusBadge status={JOB_STATUS.Done} />);
    expect(screen.getByText('Done')).toBeTruthy();
  });
});
