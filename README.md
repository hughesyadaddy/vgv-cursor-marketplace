# VGV Cursor Team Marketplace (private — shareable teams)

**Not for Sea Trials monorepo work.** Other teams import this marketplace.
Sea Trials engineers use `sea-trials-vgv-cursor-marketplace` instead.

Keep this GitHub repo **private**. Add only the other team’s GitHub users (or
org team) as collaborators, then import in their Cursor org’s Dashboard.

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
