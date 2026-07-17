export type Role = 'client' | 'pro';

export type Session = {
  role: Role;
  userId: number;
};
