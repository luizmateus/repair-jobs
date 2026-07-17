import { Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { JOB_STATUS } from '@/src/features/jobs/types';
import { EmptyState } from '@/src/shared/components/EmptyState';
import { JobDetail } from '@/src/features/jobs/components/JobDetail';
import { Button } from '@/src/shared/components/Button';
import { Screen } from '@/src/shared/components/Screen';
import { ScreenHeader } from '@/src/shared/components/ScreenHeader';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { useJobsStore } from '@/src/features/jobs/store/useJobsStore';
import { useJobByIdParam } from '@/src/features/jobs/hooks/useJobByIdParam';
import { useAsyncAction } from '@/src/shared/hooks/useAsyncAction';
import { spacing } from '@/src/shared/constants/theme';

export default function ProJobDetail() {
  const result = useJobByIdParam();
  const session = useAuthStore((state) => state.session);
  const claimOpenJob = useJobsStore((state) => state.claimOpenJob);
  const completeClaimedJob = useJobsStore((state) => state.completeClaimedJob);
  const { run, loading } = useAsyncAction();

  if (result.status === 'missing' || !session) {
    return (
      <Screen>
        <ScreenHeader
          title="Job Details"
          leftLabel="Back"
          onLeftPress={() => router.back()}
        />
        <EmptyState message="Job not found" />
      </Screen>
    );
  }

  const { job, jobId } = result;
  const canClaim = job.status === JOB_STATUS.Open;
  const canComplete =
    job.status === JOB_STATUS.Claimed && job.assigneeId === session.userId;

  function handleClaim() {
    void run(() => claimOpenJob(jobId, session!), {
      ok: 'Job claimed — check Mine',
      fail: 'Could not claim this job',
      onSuccess: () => router.back(),
    });
  }

  function handleComplete() {
    Alert.alert('Mark as done?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Done',
        style: 'default',
        onPress: () =>
          void run(() => completeClaimedJob(jobId, session!), {
            ok: 'Job marked as done',
            fail: 'Could not complete this job',
            onSuccess: () => router.back(),
          }),
      },
    ]);
  }

  const actionBar = (
    <>
      {canClaim && (
        <Button
          title="Claim this job"
          onPress={handleClaim}
          isLoading={loading}
          style={styles.action}
        />
      )}
      {canComplete && (
        <Button
          title="Mark as done"
          onPress={handleComplete}
          isLoading={loading}
          style={styles.action}
        />
      )}
    </>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Job Details"
        leftLabel="Back"
        onLeftPress={() => router.back()}
      />
      <JobDetail job={job} actionBar={actionBar} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  action: {
    marginTop: spacing.xl,
  },
});
