import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { InputField } from './InputField';

describe('InputField Component', () => {
  it('renders the label and placeholder correctly', async () => {
    await render(<InputField label="Username" placeholder="Enter username" />);
    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter username')).toBeTruthy();
  });

  it('displays the error message if provided', async () => {
    await render(<InputField label="Username" error="Invalid input" />);
    expect(screen.getByText('Invalid input')).toBeTruthy();
  });

  it('does not display error text if error is not provided', async () => {
    await render(<InputField label="Username" />);
    expect(screen.queryByText('Invalid input')).toBeNull();
  });

  it('calls onChangeText callback when text is typed', async () => {
    const onChangeTextMock = jest.fn();
    await render(
      <InputField
        label="Username"
        placeholder="Enter username"
        onChangeText={onChangeTextMock}
      />,
    );
    await fireEvent.changeText(
      screen.getByPlaceholderText('Enter username'),
      'john_doe',
    );
    expect(onChangeTextMock).toHaveBeenCalledWith('john_doe');
  });
});
