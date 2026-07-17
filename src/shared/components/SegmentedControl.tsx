import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  shadows,
  spacing,
  typography,
} from '@/src/shared/constants/theme';

type Props = {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export function SegmentedControl({ segments, activeIndex, onChange }: Props) {
  return (
    <View style={styles.container}>
      {segments.map((label, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={index}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onChange(index)}
          >
            <Text
              style={[styles.segmentText, isActive && styles.segmentTextActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.overlay,
    borderRadius: 10,
    padding: spacing.xs,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  segmentText: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentTextActive: {
    color: colors.text,
  },
});
