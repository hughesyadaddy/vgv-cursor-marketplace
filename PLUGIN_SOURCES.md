# Plugin source pins

| Plugin | Source | SHA / note |
| --- | --- | --- |
| vgv-wingspan | Upstream `VeryGoodOpenSource/vgv-wingspan` + Cursor emit bundle | Vendored tree at marketplace commit; see `git log -1` on this repo |
| vgv-ai-flutter-plugin | Upstream `VeryGoodOpenSource/vgv-ai-flutter-plugin` + Cursor emit bundle | Same vendored pin as `vgv-wingspan` in each release |

## Wingspan skills (vendored)

All **15** skills under `plugins/vgv-wingspan/cursor/skills/` ship with the
Wingspan plugin, including the PR review trio:

- `pr-review-loop-inplace`
- `pr-review-loop-worktree`
- `pre-push-harden`

They are produced by the internal Cursor emit pipeline (Wingspan
`skill-custom` / shareable bundle sources). Regenerate via the maintaining
team's `cursor-link-vgv-skills.sh --emit-wingspan-shareable` and
`scaffold-vgv-only-cursor-marketplace.sh` workflow — not copied from
application monorepos at publish time.

## Review agents and rules

Review agents live under `plugins/vgv-wingspan/cursor/agents/`. Dual-host
adapter rules live under `plugins/vgv-wingspan/rules/`.