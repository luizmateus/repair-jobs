import { StyleSheet, Text, View } from 'react-native';
import { spacing, typography } from '@/src/shared/constants/theme';

type Props = {
  label: string;
  value: string;
};

export function MetaRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    ...typography.label,
  },
  value: {
    ...typography.body,
    fontSize: 15,
  },
});
