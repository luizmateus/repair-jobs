import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders the title correctly', async () => {
    await render(<Button title="Click Me" onPress={jest.fn()} />);
    expect(screen.getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPressMock = jest.fn();
    await render(<Button title="Click Me" onPress={onPressMock} />);
    await fireEvent.press(screen.getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders an activity indicator and disables press when loading', async () => {
    const onPressMock = jest.fn();
    await render(
      <Button title="Click Me" onPress={onPressMock} isLoading={true} />,
    );
    expect(screen.queryByText('Click Me')).toBeNull();
    expect(screen.getByTestId('button-loader')).toBeTruthy();
    const pressable = screen.getByTestId('button-pressable');
    await fireEvent.press(pressable);
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('disables press when disabled prop is true', async () => {
    const onPressMock = jest.fn();
    await render(
      <Button title="Click Me" onPress={onPressMock} disabled={true} />,
    );

    const pressable = screen.getByTestId('button-pressable');
    await fireEvent.press(pressable);
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
