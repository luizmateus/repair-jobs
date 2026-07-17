import React, { type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/src/shared/constants/theme';
import { Button } from './Button';

type PrimaryActionProps = {
  label: string;
  onPress: () => void;
};

export function HeaderPrimaryAction({ label, onPress }: PrimaryActionProps) {
  return <Button title={label} onPress={onPress} variant="primary" size="sm" />;
}

type TextActionProps = {
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
};

export function HeaderTextAction({
  label,
  onPress,
  tone = 'default',
}: TextActionProps) {
  const color = tone === 'danger' ? colors.danger : colors.textMuted;
  return (
    <Button
      title={label}
      onPress={onPress}
      variant="link"
      size="sm"
      textStyle={{ color, fontWeight: '600', fontSize: 14 }}
    />
  );
}

type ScreenHeaderProps = {
  variant?: 'home';
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  leftLabel?: string;
  onLeftPress?: () => void;
  leftWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function ScreenHeader({
  variant,
  title,
  subtitle,
  actions,
  leftLabel,
  onLeftPress,
  leftWidth = 70,
  style,
}: ScreenHeaderProps) {
  const isHome = variant === 'home';

  return (
    <View style={[styles.header, style]}>
      {!isHome && onLeftPress && leftLabel ? (
        <View style={[styles.leftContainer, { width: leftWidth }]}>
          <Button
            title={leftLabel}
            onPress={onLeftPress}
            variant="link"
            size="sm"
            style={styles.backButton}
            textStyle={styles.backText}
          />
        </View>
      ) : !isHome && onLeftPress ? (
        <View style={[styles.leftContainer, { width: leftWidth }]} />
      ) : null}

      <View
        style={[
          styles.titleContainer,
          !isHome && onLeftPress ? styles.titleWithBack : null,
        ]}
      >
        <Text style={typography.heading} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sessionLabel} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {actions ? (
          actions
        ) : !isHome && onLeftPress ? (
          <View style={{ width: leftWidth }} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 60,
  },
  leftContainer: {
    alignItems: 'flex-start',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleWithBack: {
    alignItems: 'center',
    textAlign: 'center',
  },
  sessionLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  backButton: {
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
});
