# Consumer push gate (repo override)

Some repos document a stricter push path than Wingspan's default scoped
validation. Detect it before shipping — any one of these means the repo
**may** own its own gate:

- `package.json` defines a `pr-review-push`, `push-gate`, or `prepush`
  script
- `AGENTS.md` / `CLAUDE.md` has a "push gate" section naming a command
- A consumer plugin ships a ship/harden skill (for example a
  `*-pr-ship` or `*-pre-push-harden` skill)

Wingspan skills **never** mandate these gates by default. When a gate
exists and the user (or repo `AGENTS.md`) requires it:

- Run the repo's gate command (or its ship skill) instead of assuming
  `/create-pr` already ran a broad suite
- Call `/create-pr` for commit/scoped validation and PR creation unless
  the repo gate fully replaces that flow

When no gate is required, the default **Ship** flow uses scoped commit
validation and `/create-pr` only.
