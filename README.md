# VGV Cursor Team Marketplace

Cursor port of the **Very Good Ventures AI plugin stack** for Cursor Team
Marketplaces: Wingspan workflows and Flutter/Dart skills.

Forked from upstream VGV releases (`vgv-wingspan`, `vgv-ai-flutter-plugin`)
with Cursor-specific skills, flat agents, adapter rules, MCP, and hooks.

| Plugin | What you get |
| --- | --- |
| `vgv-wingspan` | 15 workflow skills (see below), review agents, adapter rules, `context7` + `vgv-ask-question` MCP |
| `vgv-ai-flutter-plugin` | Flutter/Dart skills + `flutter-reviewer` (enable on Flutter repos) |

## Install

1. Cursor Dashboard → **Team Marketplaces** → import
   `https://github.com/hughesyadaddy/vgv-cursor-marketplace`
2. Enable **VGV Wingspan** (required).
3. Enable **VGV AI Flutter** on Flutter/Dart repos.
4. **Cmd+Q** → reopen Cursor. Use **Composer 2.5** for `/plan` handoffs.

## Wingspan skills (15)

Core workflow skills:

| Skill | Purpose |
| --- | --- |
| `/brainstorm` | Explore ideas before planning |
| `/plan` | Turn a brainstorm into an implementation plan |
| `/build` | Execute a plan in phases |
| `/code-review` | VGV quality review on a change set |
| `/plan-technical-review` | Technical review of a plan |
| `/refine-approach` | Iterate on brainstorm or plan docs |
| `/hotfix` | Focused fix with reduced review set |
| `/debrief` | Post-ship summary |
| `/create` | Scaffold from templates |
| `/create-pr` | Open a PR with consistent formatting |
| `/rebase` | Rebase workflow helper |
| `/elements-of-style` | Writing quality pass |

PR review loop (optional; needs hook scripts in the consuming repo):

| Skill | Use when |
| --- | --- |
| `/pr-review-loop-inplace` | Fix review comments on the current branch (clean tree) |
| `/pr-review-loop-worktree` | Isolated git worktree for the PR branch |
| `/pre-push-harden` | Pre-push validation before opening or updating a PR |

**Repo hooks** (only when the consuming repo vendors
`scripts/hooks/pr-review-*.mjs`):

- `pnpm pr-review-status` — one-shot snapshot: review threads plus **CI gate on PR HEAD**
- `pnpm pr-review-loop` — background watch (**15s** polling; **30m** silence window)
- `pnpm pr-review-push` — runs `agent-prepush` then `git push` (normal prepush hooks)

These commands are **not** defined by the marketplace; they must exist in repos
that ship the hook scripts.

## Upstream

Official VGV plugins target Claude Code. This repo is the Cursor dual-manifest
fork (same-chat phase handoffs, native host AskQuestion).