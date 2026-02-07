# OpenCode Config (Cross-Platform)

Shared OpenCode configuration for macOS and Windows. Includes Antigravity models, LM Studio, and MCP tools (Slack, Notion, n8n).

## Quick Setup

1. Clone this repo somewhere on your machine (NOT into `~/.config/opencode/`):
   ```
   git clone https://github.com/gustavonline/opencode-config ~/Downloads/opencode-config
   ```

2. Open the folder in OpenCode and tell the agent:
   > Read `.agent/SETUP.md` and configure this machine.

That's it. The agent handles the rest.

## What's Inside

- **Antigravity plugin** (latest) -- Gemini 3 Pro/Flash, Claude Sonnet 4.5, Opus 4.5/4.6 via Google OAuth
- **Gemini CLI models** -- Gemini 2.5 Flash/Pro, 3 Flash/Pro Preview (separate quota)
- **LM Studio** -- local LLM support (auto-detects localhost vs LAN)
- **Context7 MCP** -- documentation lookup
- **Unified Toolbox MCP** -- Slack (read-only), Notion (read-only), n8n (full)

## Architecture

```
This repo (~/Downloads/opencode-config/)     ~/.config/opencode/
+----------------------------------+         +-------------------------+
| config/opencode.json.template    | ------> | opencode.json (generated)
| tools/toolbox-proxy.js           | <------ | (MCP points back here)  |
| tools/slack.js, notion.js, n8n.js|         | package.json (OC owns)  |
| .env (secrets, git-ignored)      |         | node_modules/ (OC owns) |
| node_modules/ (MCP deps)        |         +-------------------------+
+----------------------------------+
```

The repo is the source. Only `opencode.json` gets placed into the config dir. Everything else stays in the repo folder. This prevents platform conflicts.

## Manual Setup (Without Agent)

1. `npm install` in the repo root
2. Copy `.env.example` to `.env`, fill in API keys
3. Read `config/opencode.json.template`
4. Replace `{{REPO_PATH}}` with the absolute path to this repo (use forward slashes)
5. Replace `{{LM_STUDIO_URL}}` with:
   - Windows (local): `http://localhost:1234/v1`
   - macOS (over LAN): `http://192.168.1.38:1234/v1`
6. Save the result as `~/.config/opencode/opencode.json`
7. Run `opencode auth login` to authenticate Antigravity
8. Restart OpenCode
