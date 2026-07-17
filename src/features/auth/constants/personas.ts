import type { Session } from '../types';
import { PERSONA_NAMES } from '@/src/shared/constants/personaNames';

export const CLIENT_PERSONA: Session = {
  role: 'client',
  userId: 1,
};

export const PRO_PERSONA: Session = {
  role: 'pro',
  userId: 2,
};

export const ROLE_OPTIONS: {
  persona: Session;
  title: string;
  description: string;
}[] = [
  {
    persona: CLIENT_PERSONA,
    title: 'Continue as Client',
    description: 'Post repair jobs and track their status',
  },
  {
    persona: PRO_PERSONA,
    title: 'Continue as Pro',
    description: 'Browse available jobs, claim and complete them',
  },
];

export function personaLabel(session: Session): string {
  const name = PERSONA_NAMES[session.userId] ?? `User ${session.userId}`;
  const roleLabel = session.role === 'client' ? 'Client' : 'Pro';
  return `${name} · ${roleLabel}`;
}
