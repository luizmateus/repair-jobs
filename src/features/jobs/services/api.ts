import { JOB_STATUS, type Job } from '../types';
import { fetchService } from '@/src/shared/api/client';
import {
  CLIENT_PERSONA,
  PRO_PERSONA,
} from '@/src/features/auth/constants/personas';

const BASE_URL = 'https://dummyjson.com/todos';

async function fetchJobMutation(
  url: string,
  method: 'POST' | 'PUT',
  body: Record<string, unknown>,
): Promise<void> {
  try {
    await fetchService(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {}
}

export function fetchCreateJob(job: Job): Promise<void> {
  return fetchJobMutation(`${BASE_URL}/add`, 'POST', {
    todo: job.title,
    completed: false,
    userId: job.creatorId,
  });
}

export function fetchUpdateJob(job: Job): Promise<void> {
  return fetchJobMutation(`${BASE_URL}/${job.id}`, 'PUT', {
    todo: job.title,
    completed: job.status === JOB_STATUS.Done,
  });
}

type DummyTodo = {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
};

type TodosResponse = {
  todos: DummyTodo[];
};

const SEED_LIMIT = 0;
const HOUR_MS = 3600_000;
const HALF_HOUR_MS = 1800_000;

type FixtureDef = {
  title: string;
  description: string;
  status: Job['status'];
  creatorId: number;
  assigneeId?: number | null;
  ageMs: number;
  claimedAgeMs?: number;
  doneAgeMs?: number;
};

const CLIENT_FIXTURE_DEFS: FixtureDef[] = [
  {
    title: 'Replace bathroom faucet',
    description: 'Old fixture is corroded and drips overnight.',
    status: JOB_STATUS.Open,
    creatorId: CLIENT_PERSONA.userId,
    ageMs: 7200_000,
  },
  {
    title: 'Patch drywall in hallway',
    description: 'Two fist-sized holes near the light switch.',
    status: JOB_STATUS.Open,
    creatorId: CLIENT_PERSONA.userId,
    ageMs: 3600_000,
  },
  {
    title: 'Tune squeaky bedroom door',
    description: 'Hinges need oil and a slight realignment.',
    status: JOB_STATUS.Done,
    creatorId: CLIENT_PERSONA.userId,
    assigneeId: PRO_PERSONA.userId,
    ageMs: 86400_000,
    claimedAgeMs: 79200_000,
    doneAgeMs: 72000_000,
  },
];

const FALLBACK_EXTRA_DEFS: FixtureDef[] = [
  {
    title: 'Fix broken doorbell',
    description: 'Push button does not chime.',
    status: JOB_STATUS.Open,
    creatorId: 5,
    ageMs: 5400_000,
  },
  {
    title: 'Install ceiling fan',
    description: 'Bedroom gets no airflow in summer.',
    status: JOB_STATUS.Open,
    creatorId: 7,
    ageMs: 10800_000,
  },
  {
    title: 'Repair garage door spring',
    description: 'Loud snap, door will not open.',
    status: JOB_STATUS.Open,
    creatorId: 12,
    ageMs: 1800_000,
  },
];

function defaultAssigneeId(def: FixtureDef): number | null {
  if (def.assigneeId !== undefined) return def.assigneeId;
  if (def.status === JOB_STATUS.Open) return null;
  return PRO_PERSONA.userId;
}

function materializeFixtures(defs: FixtureDef[], startId: number): Job[] {
  const now = Date.now();
  return defs.map((def, i) => ({
    id: startId + i,
    title: def.title,
    description: def.description,
    status: def.status,
    creatorId: def.creatorId,
    assigneeId: defaultAssigneeId(def),
    createdAt: now - def.ageMs,
    claimedAt: def.claimedAgeMs != null ? now - def.claimedAgeMs : null,
    doneAt: def.doneAgeMs != null ? now - def.doneAgeMs : null,
  }));
}

export function mapTodoToJob(todo: DummyTodo): Job {
  const now = Date.now();
  const offset = todo.id * HOUR_MS;
  const isDone = todo.completed;
  return {
    id: todo.id,
    title: todo.todo,
    description: '',
    status: isDone ? JOB_STATUS.Done : JOB_STATUS.Open,
    creatorId: todo.userId,
    assigneeId: isDone ? PRO_PERSONA.userId : null,
    createdAt: now - offset,
    claimedAt: isDone ? now - offset + HALF_HOUR_MS / 2 : null,
    doneAt: isDone ? now - offset + HALF_HOUR_MS : null,
  };
}

export type SeedResult = {
  jobs: Job[];
  usedFallback: boolean;
};

export async function fetchSeedJobs(options?: {
  signal?: AbortSignal;
  allowFallback?: boolean;
}): Promise<SeedResult> {
  const allowFallback = options?.allowFallback ?? true;

  try {
    const response = await fetchService(
      `https://dummyjson.com/todos?limit=${SEED_LIMIT}`,
      { signal: options?.signal },
    );

    if (!response.ok) {
      throw new Error(`Seed failed (${response.status})`);
    }

    const data = (await response.json()) as TodosResponse;
    const seeded = data.todos.map(mapTodoToJob);
    return {
      jobs: [...seeded, ...materializeFixtures(CLIENT_FIXTURE_DEFS, 10_000)],
      usedFallback: false,
    };
  } catch (error) {
    if (!allowFallback) throw error;
    return {
      jobs: materializeFixtures(
        [...CLIENT_FIXTURE_DEFS, ...FALLBACK_EXTRA_DEFS],
        10_001,
      ),
      usedFallback: true,
    };
  }
}
