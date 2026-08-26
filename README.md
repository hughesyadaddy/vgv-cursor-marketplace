# VGV Cursor Team Marketplace

Cursor port of the **Very Good Ventures AI plugin stack** for Cursor Team
Marketplaces: Wingspan workflows and Flutter/Dart skills.

Forked from upstream VGV releases (`vgv-wingspan`, `vgv-ai-flutter-plugin`)
with Cursor-specific skills, flat agents, adapter rules, MCP, and hooks.

| Plugin | What you get |
| --- | --- |
| `vgv-wingspan` | `/brainstorm`, `/plan`, `/build`, `/code-review`, â€¦ + review agents + adapter rules + ask-question MCP |
| `vgv-ai-flutter-plugin` | Flutter/Dart skills + `flutter-reviewer` (enable on Flutter repos) |

## Install

1. Cursor Dashboard â†’ **Team Marketplaces** â†’ import
   `https://github.com/hughesyadaddy/vgv-cursor-marketplace`
2. Enable **VGV Wingspan** (required).
3. Enable **VGV AI Flutter** on Flutter/Dart repos.
4. **Cmd+Q** â†’ reopen Cursor. Use **Composer 2.5** for `/plan` handoffs.


## PR review loop skills (Wingspan)

Three skills automate the PR feedback loop when the consuming repo ships the
hook scripts (for example the Sea Trials monorepo):

| Skill | Use when |
| --- | --- |
| `/pr-review-loop-inplace` | Fix review comments on the current branch (clean tree) |
| `/pr-review-loop-worktree` | Isolated git worktree for the PR branch |
| `/pre-push-harden` | Pre-push validation before opening or updating a PR |

**Repo hooks** (require `scripts/hooks/pr-review-*.mjs` in the consuming repo):

- `pnpm pr-review-status` — one-shot snapshot: review threads plus **CI gate on PR HEAD**
- `pnpm pr-review-loop` — background watch (**15s** polling; **30m** silence window)
- `pnpm pr-review-push` — runs `agent-prepush` then `git push` (normal prepush hooks)

These commands are not defined by the marketplace itself; they must exist in
repos that vendor the hook scripts.

## Upstream

Official VGV plugins target Claude Code. This repo is the Cursor dual-manifest
fork (same-chat phase handoffs, native host AskQuestion).
