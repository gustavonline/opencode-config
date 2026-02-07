#!/usr/bin/env node

/**
 * OpenCode Config Setup Script
 *
 * Installs MCP tools and generates opencode.json into ~/.config/opencode/
 * This repo can be deleted after running this script.
 *
 * Usage:
 *   node setup.js              (interactive)
 *   node setup.js --force      (overwrite existing files without asking)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import readline from 'readline';

const REPO_DIR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const CONFIG_DIR = path.join(os.homedir(), '.config', 'opencode');
const TOOLS_TARGET = path.join(CONFIG_DIR, 'tools');
const ENV_TARGET = path.join(TOOLS_TARGET, '.env');
const CONFIG_TARGET = path.join(CONFIG_DIR, 'opencode.json');
const FORCE = process.argv.includes('--force');

const isWindows = process.platform === 'win32';

// Files to copy from tools/ into the target
const TOOL_FILES = [
  'toolbox-proxy.js',
  'slack.js',
  'notion.js',
  'n8n.js',
  'package.json',
];

function toForwardSlash(p) {
  return p.replace(/\\/g, '/');
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function log(msg) { console.log(`  ${msg}`); }
function logStep(step, msg) { console.log(`\n[${step}] ${msg}`); }

async function main() {
  console.log('\n=== OpenCode Config Setup ===\n');
  console.log(`  Repo:    ${REPO_DIR}`);
  console.log(`  Target:  ${CONFIG_DIR}`);
  console.log(`  OS:      ${process.platform}`);

  // ── Step 1: Create target directories ──
  logStep(1, 'Creating directories...');

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    log(`Created ${CONFIG_DIR}`);
  }

  if (!fs.existsSync(TOOLS_TARGET)) {
    fs.mkdirSync(TOOLS_TARGET, { recursive: true });
    log(`Created ${TOOLS_TARGET}`);
  } else {
    log(`${TOOLS_TARGET} already exists`);
  }

  // ── Step 2: Copy tool files ──
  logStep(2, 'Copying MCP tool files...');

  const toolsSrc = path.join(REPO_DIR, 'tools');
  for (const file of TOOL_FILES) {
    const src = path.join(toolsSrc, file);
    const dst = path.join(TOOLS_TARGET, file);
    if (!fs.existsSync(src)) {
      log(`SKIP ${file} (not found in repo)`);
      continue;
    }
    if (fs.existsSync(dst) && !FORCE) {
      const answer = await ask(`  ${file} already exists in target. Overwrite? [y/N] `);
      if (answer !== 'y') {
        log(`SKIP ${file}`);
        continue;
      }
    }
    fs.copyFileSync(src, dst);
    log(`Copied ${file}`);
  }

  // ── Step 3: Set up .env ──
  logStep(3, 'Setting up .env...');

  if (fs.existsSync(ENV_TARGET)) {
    log(`.env already exists at ${ENV_TARGET} (keeping existing)`);
  } else {
    const exampleSrc = path.join(REPO_DIR, '.env.example');
    if (fs.existsSync(exampleSrc)) {
      fs.copyFileSync(exampleSrc, ENV_TARGET);
      log(`Created .env from template at ${ENV_TARGET}`);
      log(`Edit this file to add your API keys (Slack, Notion, n8n)`);
    } else {
      log('WARNING: .env.example not found in repo, skipping .env creation');
    }
  }

  // ── Step 4: Install npm dependencies ──
  logStep(4, 'Installing MCP tool dependencies...');

  try {
    execSync('npm install --production', {
      cwd: TOOLS_TARGET,
      stdio: 'inherit',
    });
    log('Dependencies installed successfully');
  } catch (err) {
    log('ERROR: npm install failed. You may need to run it manually:');
    log(`  cd "${TOOLS_TARGET}" && npm install`);
  }

  // ── Step 5: Generate opencode.json ──
  logStep(5, 'Generating opencode.json...');

  const templatePath = path.join(REPO_DIR, 'config', 'opencode.json.template');
  if (!fs.existsSync(templatePath)) {
    log('ERROR: config/opencode.json.template not found!');
    process.exit(1);
  }

  let config = fs.readFileSync(templatePath, 'utf-8');

  // Replace CONFIG_DIR placeholder (always use forward slashes)
  const configDirForJson = toForwardSlash(CONFIG_DIR);
  config = config.replace(/\{\{CONFIG_DIR\}\}/g, configDirForJson);

  // Replace LM_STUDIO_URL based on platform
  const lmStudioUrl = isWindows
    ? 'http://localhost:1234/v1'
    : 'http://192.168.1.38:1234/v1';
  config = config.replace(/\{\{LM_STUDIO_URL\}\}/g, lmStudioUrl);

  if (fs.existsSync(CONFIG_TARGET) && !FORCE) {
    log(`opencode.json already exists at ${CONFIG_TARGET}`);
    const answer = await ask('  Overwrite? [y/N] ');
    if (answer !== 'y') {
      log('SKIP opencode.json (keeping existing)');
      logStep('Done', 'Setup complete (config not updated).');
      return;
    }
  }

  // Safety check: don't overwrite OpenCode Desktop's package.json
  const ocPackageJson = path.join(CONFIG_DIR, 'package.json');
  if (fs.existsSync(ocPackageJson)) {
    const content = fs.readFileSync(ocPackageJson, 'utf-8');
    if (content.includes('@opencode-ai')) {
      log('Detected OpenCode Desktop package.json (not touching it)');
    }
  }

  fs.writeFileSync(CONFIG_TARGET, config, 'utf-8');
  log(`Written to ${CONFIG_TARGET}`);

  // ── Done ──
  logStep('Done', 'Setup complete!\n');
  console.log('  Next steps:');
  console.log(`  1. Edit ${ENV_TARGET} with your API keys`);
  console.log('  2. Restart OpenCode Desktop to pick up the new config');
  console.log('  3. Run /connect in OpenCode to authenticate Antigravity (if needed)');
  console.log('  4. You can now delete this repo folder - everything is installed.\n');
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
