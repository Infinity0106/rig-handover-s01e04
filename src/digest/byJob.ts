import type { DigestRow } from './types.js';

// One sort for the page and the JSON, so they never disagree (ADR 0001).
export const byJob = (rows: DigestRow[]): DigestRow[] =>
  [...rows].sort((a, b) => (a.job < b.job ? -1 : a.job > b.job ? 1 : 0));
