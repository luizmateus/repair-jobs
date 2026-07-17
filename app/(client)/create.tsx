import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/src/shared/components/Button';
import { InputField } from '@/src/shared/components/InputField';
import { Screen } from '@/src/shared/components/Screen';
import { ScreenHeader } from '@/src/shared/components/ScreenHeader';
import { useAsyncAction } from '@/src/shared/hooks/useAsyncAction';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { useJobsStore } from '@/src/features/jobs/store/useJobsStore';
import { spacing } from '@/src/shared/constants/theme';

export default function CreateJob() {
  const createClientJob = useJobsStore((state) => state.createClientJob);
  const session = useAuthStore((state) => state.session);
  const { run, loading } = useAsyncAction();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('A title is required');
      return;
    }

    if (!session) return;

    await run(() => createClientJob(trimmed, description.trim(), session), {
      ok: 'Job posted',
      fail: 'Could not create job',
      onSuccess: () => router.replace('/(client)'),
    });
  }

  return (
    <Screen>
      <ScreenHeader
        title="New Job"
        leftLabel="Cancel"
        onLeftPress={() => router.back()}
        leftWidth={60}
      />

      <View style={styles.form}>
        <InputField
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setError(null);
          }}
          placeholder="e.g. Fix leaky kitchen faucet"
          autoFocus
          error={error}
        />

        <InputField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description of the repair"
          multiline
          numberOfLines={4}
        />

        <Button
          title="Post Job"
          onPress={handleSubmit}
          isLoading={loading}
          style={styles.submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: spacing.md,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
