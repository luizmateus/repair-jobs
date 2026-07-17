import { useState } from 'react';

import { useToastStore } from '@/src/shared/store/useToastStore';

type Options = {
  ok: string;
  fail: string;
  onSuccess?: () => void;
};

export function useAsyncAction() {
  const showToast = useToastStore.getState().show;
  const [loading, setLoading] = useState(false);

  async function run(
    action: () => Promise<void>,
    { ok, fail, onSuccess }: Options,
  ) {
    setLoading(true);
    try {
      await action();
      showToast(ok);
      onSuccess?.();
    } catch {
      showToast(fail, 'error');
    } finally {
      setLoading(false);
    }
  }

  return { run, loading };
}
