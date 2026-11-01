export type RunStatus = 'ok' | 'retry' | 'fail';

// One row per job for a night, built from runs/<night>.jsonl.
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  // Times as written in the log, offset kept.
  firstAt: string;
  lastAt: string;
};

export type Night = {
  rows: DigestRow[];
  badLines: number;
};

// Returns null when runs/<night>.jsonl doesn't exist.
export type ReadNight = (runsDir: string, night: string) => Night | null;
