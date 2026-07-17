import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';

import { colors, typography } from '@/src/shared/constants/theme';

export function LoadingScreen({ label }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
