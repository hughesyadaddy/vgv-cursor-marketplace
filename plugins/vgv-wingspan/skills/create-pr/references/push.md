# Push Reference

How to push the current branch. Scoped commit validation must already be
green on the commits being pushed (see
[scoped-commit-validation.md](../../shared/references/scoped-commit-validation.md)).

## Push

```bash
git push -u origin <branch>
```

## No mandatory pre-push suite

Wingspan does **not** require `pnpm prepush`, `push-gate`,
`pr-review-push`, whole-package tests, goldens, or CI-workflow replay
before push. Consumer repos may define their own gate in `package.json` or
`AGENTS.md`; run that gate only when the repo documents it and the user
(or ship skill) requires it — not as a Wingspan default.

Preserve all other remote restrictions: branch protection, required
reviews, deployment approvals, and no-force rules still apply on the
forge.

## If the push fails

Diagnose the error and guide the user:

- **Authentication failure** — advise checking SSH keys or credentials for the remote host.
- **Non-fast-forward rejection** — the remote has commits the local branch does not; advise running `git pull --rebase` and re-pushing.
- **Remote not found** — the remote URL may be missing or incorrect; advise running `git remote -v` to verify.
- **Other errors** — report the full error output and stop.
