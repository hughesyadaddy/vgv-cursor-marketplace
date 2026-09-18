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

## Structured questions (dual-host)

VGV skills show **Question** + **Options** blocks — pass them to a
structured question tool, never as plain chat text.

| Priority | Tool | Host / source |
| --- | --- | --- |
| 1 | **AskQuestion** | Cursor host (some models / modes) |
| 2 | **AskUserQuestion** | Claude Code host |
| 3 | **ask_user_question** | MCP `vgv-ask-question` (Wingspan plugin) |
| 4 | Numbered chat list | Last resort only |

Detect by **tool availability**, not product name. Degrade silently when
falling back — no apology or tool-name lecture.

Canonical protocol:
[`plugins/vgv-wingspan/references/structured-questions-protocol.md`](plugins/vgv-wingspan/references/structured-questions-protocol.md)

Always-on rule: `plugins/vgv-wingspan/rules/vgv-ask-question.mdc`.

## Composer 2.5 for handoffs

Use **Composer 2.5** as the parent chat model for `/brainstorm`, `/plan`,
`/refine-approach`, and end-of-phase handoffs. Cursor injects **AskQuestion**
on Composer 2.5 more reliably than on Grok 4.5 or some Agent modes.

| Phase | Parent model | Why |
| --- | --- | --- |
| Brainstorm / plan / refine handoffs | **Composer 2.5** (not Auto) | Best chance of native AskQuestion; verify schema |
| Build / code-review / hotfix | Composer 2.5 or Claude Sonnet | Coding + subagents |
| Avoid for question-heavy work | **Grok 4.5** | No AskQuestion |

Subagent `model:` pins in agent files are separate — do not change the
parent chat model for those.

## Claude Code setup

**Native (preferred):** Claude Code exposes **AskUserQuestion** as a host
tool — no MCP required for structured handoffs.

**Optional MCP fallback:** when the host tool is missing, add the Wingspan
`vgv-ask-question` server from the plugin cache (hash varies by install):

```json
{
  "mcpServers": {
    "vgv-ask-question": {
      "type": "stdio",
      "command": "node",
      "args": [
        "~/.cursor/plugins/cache/__DEFAULT__/vgv-wingspan/<hash>/mcp/vgv-ask-question-mcp/dist/index.js"
      ]
    }
  }
}
```

Replace `<hash>` with the commit folder under
`~/.cursor/plugins/cache/__DEFAULT__/vgv-wingspan/`. Prefer the bundled
plugin `mcp.json` on Cursor (uses `${CURSOR_PLUGIN_ROOT}` — no hand path).

## Upstream

Official VGV plugins target Claude Code. This repo is the Cursor dual-manifest
fork (same-chat phase handoffs, native host AskQuestion).
