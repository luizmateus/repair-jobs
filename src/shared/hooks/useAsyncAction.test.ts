import { act, renderHook } from '@testing-library/react-native';

import { useToastStore } from '@/src/shared/store/useToastStore';
import { useAsyncAction } from './useAsyncAction';

beforeEach(() => {
  useToastStore.setState({ message: null, type: 'info' });
});

afterEach(() => {
  useToastStore.getState().hide();
});

it('sets loading true during action, false after', async () => {
  let result!: {
    current: {
      run: ReturnType<typeof useAsyncAction>['run'];
      loading: boolean;
    };
  };
  await act(async () => {
    result = (await renderHook(() => useAsyncAction())).result;
  });
  expect(result.current.loading).toBe(false);

  let resolveAction!: () => void;
  const action = jest.fn().mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveAction = resolve;
      }),
  );

  await act(() => {
    result.current.run(action, { ok: 'Done', fail: 'Oops' });
  });

  expect(result.current.loading).toBe(true);

  await act(async () => {
    resolveAction();
  });

  expect(result.current.loading).toBe(false);
});

it('shows success toast and calls onSuccess on resolve', async () => {
  let result!: {
    current: {
      run: ReturnType<typeof useAsyncAction>['run'];
      loading: boolean;
    };
  };
  await act(async () => {
    result = (await renderHook(() => useAsyncAction())).result;
  });
  const onSuccess = jest.fn();
  const action = jest.fn().mockResolvedValue(undefined);

  await act(async () => {
    await result.current.run(action, { ok: 'Done', fail: 'Oops', onSuccess });
  });

  expect(action).toHaveBeenCalledTimes(1);
  expect(useToastStore.getState().message).toBe('Done');
  expect(useToastStore.getState().type).toBe('success');
  expect(onSuccess).toHaveBeenCalledTimes(1);
});

it('shows error toast and does not call onSuccess on reject', async () => {
  let result!: {
    current: {
      run: ReturnType<typeof useAsyncAction>['run'];
      loading: boolean;
    };
  };
  await act(async () => {
    result = (await renderHook(() => useAsyncAction())).result;
  });
  const onSuccess = jest.fn();
  const action = jest.fn().mockRejectedValue(new Error('fail'));

  await act(async () => {
    await result.current.run(action, { ok: 'Done', fail: 'Oops', onSuccess });
  });

  expect(action).toHaveBeenCalledTimes(1);
  expect(useToastStore.getState().message).toBe('Oops');
  expect(useToastStore.getState().type).toBe('error');
  expect(onSuccess).not.toHaveBeenCalled();
});

it('resets loading to false even when action throws', async () => {
  let result!: {
    current: {
      run: ReturnType<typeof useAsyncAction>['run'];
      loading: boolean;
    };
  };
  await act(async () => {
    result = (await renderHook(() => useAsyncAction())).result;
  });
  const action = jest.fn().mockRejectedValue(new Error('fail'));

  await act(async () => {
    await result.current.run(action, { ok: 'Done', fail: 'Oops' });
  });

  expect(result.current.loading).toBe(false);
});
