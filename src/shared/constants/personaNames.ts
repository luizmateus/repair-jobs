export const PERSONA_NAMES: Record<number, string> = {
  1: 'Alex',
  2: 'Sam',
};

export function assigneeName(assigneeId: number | null): string | null {
  if (assigneeId === null) return null;
  return PERSONA_NAMES[assigneeId] ?? `Pro #${assigneeId}`;
}

export function creatorName(creatorId: number): string {
  return PERSONA_NAMES[creatorId] ?? `Client #${creatorId}`;
}
