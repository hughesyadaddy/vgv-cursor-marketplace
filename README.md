# VGV Cursor Team Marketplace (public)

Shareable **VGV Wingspan + Flutter** plugins for any team. No Sea Trials
custom content.

Sea Trials engineers also import the **private**
`sea-trials-vgv-cursor-marketplace` (sea-trials plugin only).

Keep this GitHub repo **public** so other teams can import without collaborator
access. Sea Trials secrets stay in the private marketplace repo.

| Plugin | What you get |
| --- | --- |
| `vgv-wingspan` | `/brainstorm`, `/plan`, `/build`, `/code-review`, … + 10 review agents + adapter rules + ask-question MCP |
| `vgv-ai-flutter-plugin` | Flutter/Dart skills + `flutter-reviewer` (optional — skip on non-Flutter repos) |

## Install (other teams)

1. Cursor Dashboard → **Team Marketplaces** → import
   `https://github.com/hughesyadaddy/vgv-cursor-marketplace`
2. Enable **VGV Wingspan** (required). Enable **VGV AI Flutter** if Flutter.
3. **Do not** import the Sea Trials marketplace unless you work in that monorepo.
4. **Cmd+Q** → reopen Cursor. Use **Composer 2.5** for `/plan` handoffs.

## Sync (maintainers, from sea_trials_universal)

```bash
./scripts/cursor-link-vgv-skills.sh --emit-wingspan-shareable
./scripts/cursor-link-vgv-skills.sh --emit-cursor-plugin   # optional: fork skills
./scripts/scaffold-vgv-only-cursor-marketplace.sh
cd ~/dev/vgv-cursor-marketplace
git add -A && git commit -m "chore: bump VGV plugins" && git push
# Dashboard → Refresh Team Marketplace
```
