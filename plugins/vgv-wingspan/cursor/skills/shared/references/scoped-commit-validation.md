# Scoped commit validation (permanent standard)

Every Wingspan commit, phase checkpoint, and PR-prep step uses **only**
this scope. This is not a fast "iteration mode" — it is the sole agent
validation standard. Remote CI, deployment, approval, and security
policies stay authoritative for full suites; agents do not replay them
locally before commit or push.

## Dart / Flutter

For each **explicit changed** source path in the commit (staged plus
unstaged when validating before commit):

| Changed path | Run |
| --- | --- |
| `lib/**`, `bin/**` | `dart analyze --fatal-infos` on that file only (or MCP `analyze_files` with those paths) |
| `test/**` | The matching test file(s) only — `flutter test <path>` or consumer `pnpm agent-validate -- <paths>` |
| `lib/**` with a known test file | Analyze the changed lib file(s) **and** run only the directly covering test file(s) |

Do **not** run by default: whole-package `very_good test`, unscoped
`flutter test` / `dart test`, repo-wide format, coverage thresholds,
golden updates, custom lint across unchanged packages, or
`pnpm prepush` / `push-gate` / CI-workflow replay.

When the consumer repo ships `pnpm agent-validate`, prefer it with
**explicit paths** when git diff is incomplete (for example immediately
after commit).

## Non-Dart

Run only analyzers, linters, and tests that **directly apply** to the
changed paths (same explicit-path rule). No repo-wide fanout.

## Failures

1. Fix the failure.
2. Re-run the **same scoped** commands.
3. Up to 3 attempts per failure.
4. Then use **AskQuestion** (Cursor) / **AskUserQuestion** (Claude Code)
   with the error output and what you tried.

Warnings: fix analyze **errors** before proceeding. Do not block on
unrelated pre-existing warnings in unchanged files.

## Explicit opt-in (not commit gates)

These are **separate** from per-commit validation — invoke only when the
user asks or the consumer repo documents them as required:

- `/green-gate`, goldens, feature visual validation, screenshot review
- Consumer `prepush`, `push-gate`, `pr-review-push`, or ship/harden skills
- Full plan `VERIFICATION COMMAND` / CI-parity suites (human or CI runs these)

## create-pr

Step 1 runs this procedure on the changes about to be committed. There
is no Step that mirrors `.github/workflows` or runs broad local suites
before opening a PR.
