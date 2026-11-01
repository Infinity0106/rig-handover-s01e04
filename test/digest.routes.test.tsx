import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const line = (at: string, job: string, status: string, owner: string | null = 'rook') =>
  JSON.stringify({ at, job, status, owner });

let app: ReturnType<typeof createApp>;

beforeAll(() => {
  const runsDir = mkdtempSync(join(tmpdir(), 'rig-routes-'));
  writeFileSync(
    join(runsDir, '2026-01-01.jsonl'),
    [
      line('2026-01-01T01:00:00+01:00', 'b/second', 'ok'),
      line('2026-01-01T01:01:00+01:00', 'a/first', 'fail', null),
      'not json',
    ].join('\n') + '\n',
  );
  writeFileSync(join(runsDir, '2026-01-02.jsonl'), '');
  app = createApp({ adapter: 'test', installed: 'test', beatEverySeconds: 60, runsDir });
});

const jobsInOrder = (text: string, jobs: string[]) =>
  jobs.map((j) => text.indexOf(j)).every((at, i, all) => at >= 0 && (i === 0 || at > all[i - 1]!));

describe('GET /digest/:night', () => {
  it('renders the rows sorted by job, null owner as —', async () => {
    const res = await app.request('/digest/2026-01-01');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(jobsInOrder(html, ['a/first', 'b/second'])).toBe(true);
    expect(html).toContain('—');
  });

  it('404s for a night with no file', async () => {
    expect((await app.request('/digest/2026-01-03')).status).toBe(404);
  });

  it('renders "nothing ran" for an empty night', async () => {
    const res = await app.request('/digest/2026-01-02');
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('nothing ran');
  });
});

describe('GET /api/digest/:night', () => {
  const rowsOf = async (night: string) => {
    const res = await app.request(`/api/digest/${night}`);
    const body = (await res.json()) as { rows?: { job: string }[] } | { job: string }[];
    return { res, rows: Array.isArray(body) ? body : (body.rows ?? []) };
  };

  it('returns the rows in the same order as the page', async () => {
    const { res, rows } = await rowsOf('2026-01-01');
    expect(res.status).toBe(200);
    const jobs = rows.map((r) => r.job);
    expect(jobs).toEqual(['a/first', 'b/second']);
    expect(jobsInOrder(await (await app.request('/digest/2026-01-01')).text(), jobs)).toBe(true);
  });

  it('404s for a night with no file', async () => {
    expect((await app.request('/api/digest/2026-01-03')).status).toBe(404);
  });

  it('returns no rows for an empty night', async () => {
    const { res, rows } = await rowsOf('2026-01-02');
    expect(res.status).toBe(200);
    expect(rows).toEqual([]);
  });
});
