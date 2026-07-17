import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/src/features/auth/store/useAuthStore';

export default function ProLayout() {
  const session = useAuthStore((state) => state.session);

  if (!session) {
    return <Redirect href="/login" />;
  }
  if (session.role !== 'pro') {
    return <Redirect href="/(client)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
