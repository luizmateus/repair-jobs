import { StyleSheet, Text, View } from 'react-native';
import { useToastStore } from '@/src/shared/store/useToastStore';
import { colors, shadows, spacing } from '@/src/shared/constants/theme';

const TOAST_COLORS: Record<string, string> = {
  success: colors.primary,
  error: colors.danger,
  info: colors.text,
};

export function Toast() {
  const message = useToastStore((state) => state.message);
  const type = useToastStore((state) => state.type);

  if (!message) return null;

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.toast,
          { backgroundColor: TOAST_COLORS[type] ?? colors.primary },
        ]}
      >
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  toast: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    ...shadows.md,
  },
  text: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
