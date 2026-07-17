import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl Component', () => {
  const segments = ['First', 'Second', 'Third'];

  it('renders all segment labels', async () => {
    await render(
      <SegmentedControl
        segments={segments}
        activeIndex={0}
        onChange={jest.fn()}
      />,
    );
    segments.forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('triggers onChange when a segment is pressed', async () => {
    const onChangeMock = jest.fn();
    await render(
      <SegmentedControl
        segments={segments}
        activeIndex={0}
        onChange={onChangeMock}
      />,
    );
    await fireEvent.press(screen.getByText('Second'));
    expect(onChangeMock).toHaveBeenCalledWith(1);

    await fireEvent.press(screen.getByText('Third'));
    expect(onChangeMock).toHaveBeenCalledWith(2);
  });
});
