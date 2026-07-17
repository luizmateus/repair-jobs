import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';

import { Screen } from '@/src/shared/components/Screen';
import { PressableCard } from '@/src/shared/components/PressableCard';
import { ROLE_OPTIONS } from '@/src/features/auth/constants/personas';
import { useAuthStore } from '@/src/features/auth/store/useAuthStore';
import { colors, spacing, typography } from '@/src/shared/constants/theme';
import type { Session } from '@/src/features/auth/types';

export default function Login() {
  const signIn = useAuthStore((state) => state.signIn);
  const session = useAuthStore((state) => state.session);

  if (session) {
    return (
      <Redirect href={session.role === 'client' ? '/(client)' : '/(pro)'} />
    );
  }

  function handleSignIn(persona: Session) {
    signIn(persona);
    router.replace(persona.role === 'client' ? '/(client)' : '/(pro)');
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Text style={typography.title}>Repair Jobs</Text>
        <Text style={styles.subtitle}>Choose how you want to continue</Text>

        <View style={styles.options}>
          {ROLE_OPTIONS.map((option) => (
            <PressableCard
              key={option.persona.role}
              onPress={() => handleSignIn(option.persona)}
              radius={16}
              padding={spacing.lg}
            >
              <Text style={styles.roleTitle}>{option.title}</Text>
              <Text style={styles.roleDescription}>{option.description}</Text>
            </PressableCard>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  roleTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    ...typography.caption,
  },
});
