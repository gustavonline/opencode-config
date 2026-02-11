# OpenCode Config - Machine Setup Guide

This file is intended for the OpenCode agent. When a user clones this repo and opens it in OpenCode, they should tell you to read this file. Follow the steps below to configure their machine.

## Overview

This repo contains a shared OpenCode configuration (LM Studio and MCP tools) that works on both macOS and Windows. The repo is **disposable** -- after setup, everything needed lives in `~/.config/opencode/` and the repo can be deleted.

**Two ways to set up:**
1. **Automated:** Run `node setup.js` in the repo root (handles everything)
2. **Agent-driven:** You (the agent) follow the manual steps below

Both produce the same result. The automated path is faster. Use the manual path if `setup.js` fails or if you need to customize something.

**Architecture:**
```
This repo (temporary)                     ~/.config/opencode/ (persistent)
├── tools/*.js (source)          ──>      ├── tools/*.js (installed copy)
├── tools/package.json           ──>      ├── tools/package.json
├── .env.example                 ──>      ├── tools/.env (created from example)
├── config/opencode.json.template──>      ├── tools/node_modules/ (npm install)
└── setup.js                              ├── opencode.json (generated)
                                          ├── package.json (OC Desktop - DO NOT TOUCH)
                                          └── node_modules/ (OC Desktop - DO NOT TOUCH)
```

**CRITICAL RULES:**
- NEVER overwrite `~/.config/opencode/package.json` -- OpenCode Desktop manages that file
- NEVER overwrite `~/.config/opencode/node_modules/` -- OpenCode Desktop manages that
- NEVER push `.env`, `node_modules/`, `antigravity-accounts.json`, or `*.tmp` to git
- The `.env` with API secrets lives at `~/.config/opencode/tools/.env` (NOT in the repo)

---

## Automated Setup

The simplest path. Run this in the repo directory:

```
node setup.js
```

This script:
1. Creates `~/.config/opencode/tools/` if needed
2. Copies all tool files (`toolbox-proxy.js`, `slack.js`, `notion.js`, `n8n.js`, `package.json`)
3. Creates `.env` from `.env.example` (only if `.env` doesn't already exist -- existing secrets are preserved)
4. Runs `npm install` in the tools directory
5. Generates `opencode.json` from the template with correct OS-specific values
6. Places `opencode.json` at `~/.config/opencode/opencode.json`

If files already exist, the script prompts before overwriting (use `--force` to skip prompts).

After running, the user can delete this repo folder.

---

## Manual Setup (if setup.js fails or for understanding)

### Step 1: Detect Environment

Determine the OS and set variables:

- **macOS** (`darwin`):
  - `CONFIG_DIR` = `~/.config/opencode` (e.g. `/Users/gusta/.config/opencode`)
  - `LM_STUDIO_URL` = `http://192.168.1.38:1234/v1` (ROG Flow Z13 over LAN -- if the IP changes, ask the user for the current LAN IP of their Windows machine)
  - The OpenCode CLI bash tool works normally on Mac, so you can run commands directly.

- **Windows** (`win32`):
  - `CONFIG_DIR` = `~/.config/opencode` (e.g. `C:\Users\gusta\.config\opencode`)
  - `LM_STUDIO_URL` = `http://localhost:1234/v1` (LM Studio runs locally)
  - **NOTE:** On Windows with OpenCode Desktop, the bash tool may not work (known issue). If so, give commands to the user to run manually in their terminal.

**IMPORTANT for paths in JSON:** Use forward slashes (`/`) in the generated config. Node.js handles them on all platforms.

### Step 2: Copy Tools

Create `~/.config/opencode/tools/` and copy these files from the repo's `tools/` directory:
- `toolbox-proxy.js`
- `slack.js`
- `notion.js`
- `n8n.js`
- `package.json`

### Step 3: Install Dependencies

Run in `~/.config/opencode/tools/`:
```
npm install
```

### Step 4: Set Up Secrets

Copy `.env.example` from the repo to `~/.config/opencode/tools/.env`.

Ask the user to provide values for any missing keys:
- `SLACK_BOT_TOKEN` -- Slack bot token (starts with `xoxb-`)
- `NOTION_API_KEY` -- Notion integration key (starts with `ntn_`)
- `N8N_API_URL` -- n8n API URL (default: `http://localhost:5678/api/v1`)
- `N8N_API_KEY` -- n8n API key

If the user doesn't use some of these services, those keys can be left empty.

### Step 5: Generate opencode.json

Read `config/opencode.json.template` and replace:
- `{{CONFIG_DIR}}` with the resolved `~/.config/opencode` path (use forward slashes)
- `{{LM_STUDIO_URL}}` with the correct URL from Step 1

Write the result to `~/.config/opencode/opencode.json`.

**WARNING:** Check if `opencode.json` already exists. If it does, ask the user before overwriting.

### Step 6: Verify

Tell the user to restart OpenCode Desktop to pick up the new config.

After restart, verify:
- LM Studio model appears if LM Studio is running
- Context7 MCP is available
- MCP toolbox tools are available (slack, notion, n8n)

---

## Updating Tools Later

To update the tool code after changes are pushed to the repo:

1. Clone or pull the repo
2. Run `node setup.js` again (it will ask before overwriting existing files)
3. Or use `node setup.js --force` to overwrite without asking
4. Delete the repo

The `.env` is never overwritten if it already exists, so secrets are preserved.

---

## Troubleshooting

### MCP tools not working
- Check that `npm install` was run in `~/.config/opencode/tools/` (not the repo)
- Check that `~/.config/opencode/tools/.env` has valid tokens
- Check that `opencode.json` points to `~/.config/opencode/tools/toolbox-proxy.js`

### OpenCode Desktop bash tool not working (Windows)
Known issue. The bash tool requires `bash.exe` that the Desktop app can't spawn. This does NOT affect MCP tools or model access.
