# OpenCode Config (Cross-Platform)

Shared OpenCode configuration for macOS and Windows. Includes Antigravity models, LM Studio, and MCP tools (Slack, Notion, n8n).

## Setup

1. Clone this repo anywhere (it's temporary):
   ```
   git clone https://github.com/gustavonline/opencode-config.git
   cd opencode-config
   ```

2. Run the setup script:
   ```
   node setup.js
   ```

3. Edit `~/.config/opencode/tools/.env` with your API keys.

4. Restart OpenCode Desktop.

5. Delete the cloned repo -- everything is installed.

## What It Does

The setup script copies MCP tools and generates `opencode.json` into `~/.config/opencode/`. After setup, the repo is no longer needed.

```
~/.config/opencode/              (persistent -- OpenCode reads from here)
├── opencode.json                ← generated from template
├── tools/                       ← MCP toolbox (installed by setup)
│   ├── toolbox-proxy.js
│   ├── slack.js, notion.js, n8n.js
│   ├── package.json
│   ├── node_modules/
│   └── .env                     ← your API keys (never committed)
├── package.json                 ← OpenCode Desktop manages this
└── node_modules/                ← OpenCode Desktop manages this
```

## What's Included

- **Antigravity plugin** (latest) -- Gemini 3 Pro/Flash, Claude Sonnet 4.5, Opus 4.5/4.6 via Google OAuth
- **Gemini CLI models** -- Gemini 2.5 Flash/Pro, 3 Flash/Pro Preview
- **LM Studio** -- local LLM support (auto-detects localhost vs LAN)
- **Context7 MCP** -- documentation lookup
- **Unified Toolbox MCP** -- Slack (read-only), Notion (read-only), n8n (full)

## Updating

Pull the latest changes and re-run setup:

```
git clone https://github.com/gustavonline/opencode-config.git
cd opencode-config
node setup.js
```

Your `.env` is preserved (never overwritten).

## Agent Setup

If using OpenCode, tell the agent:
> Read `.agent/SETUP.md` and configure this machine.
