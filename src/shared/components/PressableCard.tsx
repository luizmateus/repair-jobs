import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';
import { colors, spacing } from '@/src/shared/constants/theme';

type Props = {
  onPress: () => void;
  children: ReactNode;
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
};

export function PressableCard({
  onPress,
  children,
  radius = 12,
  padding = spacing.md,
  style,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderRadius: radius, padding },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
});
