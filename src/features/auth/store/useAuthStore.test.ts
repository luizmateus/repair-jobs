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

import { useAuthStore } from './useAuthStore';
import { CLIENT_PERSONA } from '../constants/personas';

beforeEach(() => {
  useAuthStore.setState({
    session: null,
    hydrated: true,
  });
});

describe('useAuthStore — session', () => {
  it('signIn sets the session', () => {
    useAuthStore.getState().signIn(CLIENT_PERSONA);
    expect(useAuthStore.getState().session).toEqual(CLIENT_PERSONA);
  });

  it('signOut clears the session', () => {
    useAuthStore.getState().signIn(CLIENT_PERSONA);
    useAuthStore.getState().signOut();
    expect(useAuthStore.getState().session).toBeNull();
  });
});
