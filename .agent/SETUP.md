# OpenCode Config - Machine Setup Guide

This file is intended for the OpenCode agent. When a user clones this repo and opens it in OpenCode, they should tell you to read this file. Follow the steps below to configure their machine.

## Overview

This repo contains a shared OpenCode configuration (Antigravity models, LM Studio, MCP tools) that works on both macOS and Windows. The repo itself is NOT the config directory — it is a source that generates the real config.

**CRITICAL RULES:**
- NEVER copy `node_modules/`, `.env`, `bun.lock`, `package-lock.json`, or any platform-specific files into `~/.config/opencode/`
- NEVER overwrite `~/.config/opencode/package.json` — OpenCode Desktop manages that file
- ONLY copy the generated `opencode.json` into `~/.config/opencode/`
- NEVER push `.env`, `node_modules/`, `antigravity-accounts.json`, or `*.tmp` to git

---

## Step 1: Detect Environment

Determine the OS and set variables:

- **macOS** (`darwin`):
  - `REPO_PATH` = absolute path to this repo (e.g. `/Users/gusta/Downloads/opencode-config`)
  - `LM_STUDIO_URL` = `http://192.168.1.38:1234/v1` (ROG Flow over LAN)
  - Config target = `~/.config/opencode/opencode.json`

- **Windows** (`win32`):
  - `REPO_PATH` = absolute path to this repo (e.g. `C:\Users\gusta\Downloads\opencode-config`)
  - `LM_STUDIO_URL` = `http://localhost:1234/v1` (LM Studio runs locally)
  - Config target = `C:\Users\<username>\.config\opencode\opencode.json`

**IMPORTANT for Windows paths in JSON:** Use forward slashes (`/`) or escaped backslashes (`\\`) in the generated config. Forward slashes are recommended since Node.js handles them on all platforms.

---

## Step 2: Install MCP Tool Dependencies

Run in the repo root:

```
npm install
```

This installs `@modelcontextprotocol/sdk`, `@notionhq/client`, `dotenv`, and `node-fetch` which the MCP toolbox-proxy needs.

---

## Step 3: Set Up Secrets

Check if `.env` exists in the repo root. If not, copy `.env.example` to `.env`:

```
cp .env.example .env
```

Ask the user to provide values for any missing keys:
- `SLACK_BOT_TOKEN` — Slack bot token (starts with `xoxb-`)
- `NOTION_API_KEY` — Notion integration key (starts with `ntn_`)
- `N8N_API_URL` — n8n API URL (default: `http://localhost:5678/api/v1`)
- `N8N_API_KEY` — n8n API key

If the user doesn't use some of these services, those keys can be left empty. The MCP tools will just fail gracefully for unused services.

---

## Step 4: Generate opencode.json

Read `config/opencode.json.template` and replace:
- `{{REPO_PATH}}` with the resolved absolute path to this repo (use forward slashes)
- `{{LM_STUDIO_URL}}` with the correct URL from Step 1

Write the result to `~/.config/opencode/opencode.json`.

**WARNING:** Check if `~/.config/opencode/opencode.json` already exists. If it does, ask the user before overwriting. Show them the diff.

---

## Step 5: Authenticate Antigravity

The user needs to run the Antigravity OAuth login. Tell them:

```
opencode auth login
```

If using OpenCode Desktop (no CLI), they can run `/connect` and select Google, or the plugin may prompt automatically on first use.

---

## Step 6: Verify

Tell the user to restart OpenCode (or the Desktop app) to pick up the new config.

After restart, verify:
- Antigravity models appear in the model list (e.g. `google/antigravity-claude-opus-4-6-thinking`)
- LM Studio model appears if LM Studio is running
- Context7 MCP is available
- MCP toolbox tools are available (slack, notion, n8n)

---

## Troubleshooting

### "NUL file" or corruption on Windows
This happens when macOS files (symlinks, .DS_Store, binary node_modules) end up in the Windows config dir. Fix:
1. Delete everything in `~/.config/opencode/` EXCEPT `package.json` and `node_modules/`
2. Re-run this setup

### MCP tools not working
- Check that `npm install` was run in the repo root (not in `~/.config/opencode/`)
- Check that `.env` has valid tokens
- Check that the `{{REPO_PATH}}` in the generated config points to the actual repo location

### Antigravity auth issues
- Delete `~/.config/opencode/antigravity-accounts.json` and re-run `opencode auth login`

### OpenCode Desktop bash tool not working (Windows)
This is a known issue with OpenCode Desktop on Windows. The bash tool requires a shell (`bash.exe`) that the Desktop app can't spawn. This does NOT affect the MCP tools or model access — only the built-in bash tool.
