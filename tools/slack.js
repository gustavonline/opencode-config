import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;

async function slackFetch(endpoint, options = {}) {
  const url = `https://slack.com/api/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${SLACK_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Slack API error (${endpoint}): ${data.error}`);
  }
  return data;
}

export async function listChannels() {
  return await slackFetch('conversations.list?types=public_channel,private_channel&limit=1000');
}

export async function getHistory(channelId, limit = 20) {
  return await slackFetch(`conversations.history?channel=${channelId}&limit=${limit}`);
}

export async function getThreadReplies(channelId, threadTs) {
  return await slackFetch(`conversations.replies?channel=${channelId}&ts=${threadTs}`);
}

export async function listUsers() {
  return await slackFetch('users.list?limit=1000');
}

// CLI handling if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, cmd, ...args] = process.argv;
  try {
    if (cmd === 'list-channels') console.log(JSON.stringify(await listChannels(), null, 2));
    if (cmd === 'history') console.log(JSON.stringify(await getHistory(args[0], args[1]), null, 2));
    if (cmd === 'users') console.log(JSON.stringify(await listUsers(), null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
