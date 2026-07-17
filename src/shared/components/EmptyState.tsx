import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/src/shared/constants/theme';

type Props = {
  message: string;
};

export function EmptyState({ message }: Props) {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  text: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
