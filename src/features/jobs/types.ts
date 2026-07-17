export const JOB_STATUS = {
  Open: 'open',
  Claimed: 'claimed',
  Done: 'done',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  open: 'Open — waiting for a Pro',
  claimed: 'Claimed — in progress',
  done: 'Done — completed',
};

export type Job = {
  id: number;
  title: string;
  description: string;
  status: JobStatus;
  creatorId: number;
  assigneeId: number | null;
  createdAt: number;
  claimedAt: number | null;
  doneAt: number | null;
};
