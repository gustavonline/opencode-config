import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const N8N_URL = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
const N8N_KEY = process.env.N8N_API_KEY;

export async function listWorkflows() {
  const response = await fetch(`${N8N_URL}/workflows`, {
    headers: { 'X-N8N-API-KEY': N8N_KEY },
  });
  return response.json();
}

export async function getWorkflow(workflowId) {
  const response = await fetch(`${N8N_URL}/workflows/${workflowId}`, {
    headers: { 'X-N8N-API-KEY': N8N_KEY },
  });
  return response.json();
}

export async function triggerWorkflow(webhookId, data = {}) {
  const url = `${N8N_URL.replace('/api/v1', '')}/webhook/${webhookId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.text();
}

// CLI handling
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, cmd, arg1, arg2] = process.argv;
  if (cmd === 'list') console.log(JSON.stringify(await listWorkflows(), null, 2));
  if (cmd === 'get') console.log(JSON.stringify(await getWorkflow(arg1), null, 2));
}
