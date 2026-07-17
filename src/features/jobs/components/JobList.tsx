import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';

import { EmptyState } from '@/src/shared/components/EmptyState';
import { JobCard } from './JobCard';
import { colors, spacing, typography } from '@/src/shared/constants/theme';
import type { Job } from '../types';

type Props = {
  jobs: Job[];
  loading?: boolean;
  emptyMessage: string;
  onJobPress: (jobId: number) => void;
  onRefresh?: () => Promise<void> | void;
};

export function JobList({
  jobs,
  loading,
  emptyMessage,
  onJobPress,
  onRefresh,
}: Props) {
  const [refreshing, setRefreshing] = useState(false);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading jobs…</Text>
      </View>
    );
  }

  if (jobs.length === 0 && !onRefresh) {
    return <EmptyState message={emptyMessage} />;
  }

  async function handleRefresh() {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <JobCard job={item} onPress={onJobPress} />}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      ListEmptyComponent={<EmptyState message={emptyMessage} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
});
