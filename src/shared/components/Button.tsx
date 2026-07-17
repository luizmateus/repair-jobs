import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, spacing } from '@/src/shared/constants/theme';

export type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md';

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  testID,
}: Props) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <Pressable
      testID={testID ?? 'button-pressable'}
      style={({ pressed }) => [
        styles.base,
        styles[variant] as ViewStyle,
        styles[size] as ViewStyle,
        pressed &&
          (styles[`${variant}Pressed` as keyof typeof styles] as ViewStyle),
        isButtonDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      onPress={onPress}
      disabled={isButtonDisabled}
    >
      {isLoading ? (
        <ActivityIndicator
          testID="button-loader"
          color={
            variant === 'primary' || variant === 'danger'
              ? colors.surface
              : colors.primary
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}` as keyof typeof styles] as TextStyle,
            styles[`text_${size}` as keyof typeof styles] as TextStyle,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  link: {
    backgroundColor: 'transparent',
  },
  sm: {
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  md: {
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  dangerPressed: {
    opacity: 0.8,
  },
  ghostPressed: {
    backgroundColor: colors.overlay,
  },
  linkPressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '700',
  },
  text_primary: {
    color: colors.surface,
  },
  text_danger: {
    color: colors.surface,
  },
  text_ghost: {
    color: colors.primary,
  },
  text_link: {
    color: colors.primary,
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
});
