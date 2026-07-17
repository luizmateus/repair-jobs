import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { MetaRow } from '@/src/shared/components/MetaRow';
import { StatusBadge } from './StatusBadge';
import { JOB_STATUS_LABELS } from '../types';
import { assigneeName, creatorName } from '@/src/shared/constants/personaNames';
import { relativeTime } from '@/src/shared/utils/time';
import type { Job } from '../types';
import { colors, spacing, typography } from '@/src/shared/constants/theme';

type Props = {
  job: Job;
  actionBar?: ReactNode;
};

export function JobDetail({ job, actionBar }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      alwaysBounceVertical
    >
      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <StatusBadge status={job.status} />
      </View>

      {job.description ? (
        <Text style={styles.description}>{job.description}</Text>
      ) : (
        <Text style={styles.noDescription}>No description provided</Text>
      )}

      <View style={styles.divider} />

      <MetaRow label="Status" value={JOB_STATUS_LABELS[job.status]} />
      <MetaRow label="Posted by" value={creatorName(job.creatorId)} />
      <MetaRow
        label="Assigned Pro"
        value={assigneeName(job.assigneeId) ?? 'Not yet assigned'}
      />
      <MetaRow label="Posted" value={relativeTime(job.createdAt)} />
      {job.claimedAt && (
        <MetaRow label="Claimed" value={relativeTime(job.claimedAt)} />
      )}
      {job.doneAt && (
        <MetaRow label="Completed" value={relativeTime(job.doneAt)} />
      )}

      {actionBar}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
    flex: 1,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  noDescription: {
    ...typography.caption,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
