# VGV Cursor Team Marketplace

Cursor port of the **Very Good Ventures AI plugin stack** for Cursor Team
Marketplaces: Wingspan workflows and Flutter/Dart skills.

Forked from upstream VGV releases (`vgv-wingspan`, `vgv-ai-flutter-plugin`)
with Cursor-specific skills, flat agents, adapter rules, MCP, and hooks.

| Plugin | What you get |
| --- | --- |
| `vgv-wingspan` | `/brainstorm`, `/plan`, `/build`, `/code-review`, … + review agents + adapter rules + ask-question MCP |
| `vgv-ai-flutter-plugin` | Flutter/Dart skills + `flutter-reviewer` (enable on Flutter repos) |

## Install

1. Cursor Dashboard → **Team Marketplaces** → import
   `https://github.com/hughesyadaddy/vgv-cursor-marketplace`
2. Enable **VGV Wingspan** (required).
3. Enable **VGV AI Flutter** on Flutter/Dart repos.
4. **Cmd+Q** → reopen Cursor. Use **Composer 2.5** for `/plan` handoffs.

## Upstream

Official VGV plugins target Claude Code. This repo is the Cursor dual-manifest
fork (same-chat phase handoffs, native host AskQuestion).
