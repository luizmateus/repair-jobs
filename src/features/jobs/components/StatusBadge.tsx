import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/src/shared/constants/theme';
import type { JobStatus } from '../types';

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: colors.open },
  claimed: { label: 'Claimed', color: colors.claimed },
  done: { label: 'Done', color: colors.done },
};

type Props = {
  status: JobStatus;
};

export function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.color }]}>
      <Text style={styles.text}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  text: {
    ...typography.label,
    color: colors.surface,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
