import { router } from 'expo-router';

import { EmptyState } from '@/src/shared/components/EmptyState';
import { JobDetail } from '@/src/features/jobs/components/JobDetail';
import { Screen } from '@/src/shared/components/Screen';
import { ScreenHeader } from '@/src/shared/components/ScreenHeader';
import { useJobByIdParam } from '@/src/features/jobs/hooks/useJobByIdParam';

export default function ClientJobDetail() {
  const result = useJobByIdParam();

  if (result.status === 'missing') {
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

  return (
    <Screen>
      <ScreenHeader
        title="Job Details"
        leftLabel="Back"
        onLeftPress={() => router.back()}
      />
      <JobDetail job={result.job} />
    </Screen>
  );
}
