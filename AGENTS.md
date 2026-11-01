# rig

The lane's resident service: keeps a heartbeat, serves the status board, reads the night's run
log. Hono + JSX, rendered on the server, Node 22+.

Read first: `docs/vision.md`, `docs/styleguide.md`. Decisions: `docs/adr/`.

## Commands

- `pnpm dev` / `pnpm start`: serves on `PORT` (8787). Needs `.env` (copy `.env.example`).
- `pnpm test`: vitest. `pnpm typecheck`: tsc.

## How work moves here

1. A feature starts as a plan: `plan.md` at the root (one at a time). Finished plans live in
   `docs/plans/done/`.
2. The plan is split into GitHub issues: skill `plan-to-issues` (`.agents/skills/`). A human
   reviews the split before anything is published. GitHub issues out of reach: files in
   `docs/issues/` (ADR 0004).
3. Issues are worked by workers, one issue per worker, each on its own branch or worktree.
   Pick the model per issue: the strongest for logic, a cheaper one for views and tests.
4. A worker closes its issue with a closing comment, exactly this shape:

   ```
   done: <what changed, one line>
   worker: <harness> · <model> · <effort>
   commit: <sha or "none">
   ```

5. An issue is closed only when its "Done when" holds. If it can't hold yet, leave it open and
   say what it waits on. When "Done when" depends on someone else (a reviewer looking, a reply),
   sending is not done: close it only after their event, never right after your send.
6. Before closing an issue, check the work is on the default branch: `git status` is clean,
   `git log origin/main` has the commit. A failed commit or push leaves the issue open.

## Every issue carries

- First line: `Source: plan.md § <n>`.
- Label: `plan:<plan name>` (e.g. `plan:morning-digest`).
- Sections: Scope, Done when, Blocked by, Rules (DRY, YAGNI, atomic title-only commits with
  `closes #n`, closing comment from step 4).

## Previews (ADR 0003)

Save the page with a command, outside the repo, in a folder holding only `index.html`:
`curl -s localhost:8787/digest/<night> -o <dir>/index.html`. Host: Cloudflare Pages via
`npx wrangler pages deploy <dir> --project-name <project> --branch main`. A new project needs
`wrangler pages project create <project> --production-branch main --force` once, or Wrangler
makes a Worker instead. Clean-up: run rig with `LANE_MARKER=` (not `pnpm start`, which reads
`.env`), save again, deploy over the same project, then delete older deployments that still
carry the marker.

## Skills

Shared skills live in `.agents/skills/`, one folder each, `SKILL.md` inside. That folder is the
one source for every harness on the team. If yours loads skills from somewhere else, point it
here (a link or a config entry). Don't copy: copies drift.

## Rules

- Never commit `.env`, tokens or previews.
- Don't touch `runs/`: those are real nights, read-only fixtures.
- No client JS (ADR 0001).
