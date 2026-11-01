import { byJob } from '../digest/byJob.js';
import type { Night } from '../digest/types.js';

const dash = '—';

export function DigestPage({ night, data }: { night: string; data: Night }) {
  const rows = byJob(data.rows);
  return (
    <>
      <h1>digest {night}</h1>
      {data.badLines > 0 && <p class="mute">{data.badLines} unreadable line(s) skipped</p>}
      {rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th><th>owner</th><th>runs</th><th>retries</th><th>last status</th>
              <th>last error</th><th>first</th><th>last</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr>
                <td>{r.job}</td>
                <td>{r.owner ?? dash}</td>
                <td>{r.runs}</td>
                <td class={r.retries >= 3 ? 'warn' : undefined}>{r.retries >= 3 ? `${r.retries} ⚠` : r.retries}</td>
                <td class={r.lastStatus === 'fail' ? 'warn' : undefined}>{r.lastStatus === 'fail' ? 'fail ⚠' : r.lastStatus}</td>
                <td>{r.lastError ?? dash}</td>
                <td>{r.firstAt}</td>
                <td>{r.lastAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
