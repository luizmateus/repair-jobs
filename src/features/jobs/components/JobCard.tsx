import { StyleSheet, Text, View } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { PressableCard } from '@/src/shared/components/PressableCard';
import { relativeTime } from '@/src/shared/utils/time';
import { colors, spacing, typography } from '@/src/shared/constants/theme';
import type { Job } from '../types';

type Props = {
  job: Job;
  onPress: (jobId: number) => void;
};

export function JobCard({ job, onPress }: Props) {
  return (
    <PressableCard onPress={() => onPress(job.id)} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        <StatusBadge status={job.status} />
      </View>
      {job.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {job.description}
        </Text>
      ) : null}
      <Text style={styles.timestamp}>{relativeTime(job.createdAt)}</Text>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 12,
    marginTop: spacing.xs,
    color: colors.textMuted,
  },
});
