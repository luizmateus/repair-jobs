import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/src/shared/components/Button';
import { colors, spacing, typography } from '@/src/shared/constants/theme';

type Props = {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

export function NetworkErrorBanner({ message, onRetry, isRetrying }: Props) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.message}>{message}</Text>
      <Button
        title="Retry"
        size="sm"
        variant="ghost"
        onPress={onRetry}
        isLoading={isRetrying}
        style={styles.retry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  message: {
    ...typography.caption,
    color: colors.text,
  },
  retry: {
    alignSelf: 'flex-start',
  },
});
