import { Redirect } from 'expo-router';

import { useAppStartup } from '@/src/shared/hooks/useAppStartup';

export default function Index() {
  const { hydrated, redirectTo } = useAppStartup();
  if (!hydrated) return null;
  return <Redirect href={redirectTo} />;
}
