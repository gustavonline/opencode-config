import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import * as slack from './slack.js';
import * as notion from './notion.js';
import * as n8n from './n8n.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env: check same dir first (installed location), then parent dir (fallback)
const envCandidates = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
];
const envPath = envCandidates.find(p => fs.existsSync(p));
dotenv.config({ path: envPath || envCandidates[0] });

const server = new Server({
  name: "unified-toolbox",
  version: "1.0.0",
}, {
  capabilities: { tools: {} },
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "slack_list_channels",
      description: "List all public and private channels the bot has access to",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "slack_get_history",
      description: "Get message history for a channel",
      inputSchema: {
        type: "object",
        properties: {
          channelId: { type: "string", description: "The ID of the channel" },
          limit: { type: "number", description: "Number of messages to retrieve (default 20)" },
        },
        required: ["channelId"],
      },
    },
    {
      name: "slack_get_thread_replies",
      description: "Get replies for a specific message thread",
      inputSchema: {
        type: "object",
        properties: {
          channelId: { type: "string" },
          threadTs: { type: "string", description: "The timestamp (ts) of the parent message" },
        },
        required: ["channelId", "threadTs"],
      },
    },
    {
      name: "slack_list_users",
      description: "List all users in the workspace to find names and IDs",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "notion_search",
      description: "Search Notion pages",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
        required: ["query"],
      },
    },
    {
      name: "notion_get_page",
      description: "Retrieve a specific Notion page by ID",
      inputSchema: {
        type: "object",
        properties: {
          pageId: { type: "string" },
        },
        required: ["pageId"],
      },
    },
    {
      name: "notion_get_database",
      description: "Retrieve a specific Notion database by ID",
      inputSchema: {
        type: "object",
        properties: {
          databaseId: { type: "string" },
        },
        required: ["databaseId"],
      },
    },
    {
      name: "n8n_list_workflows",
      description: "List local n8n workflows",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "n8n_get_workflow",
      description: "Get details of a specific n8n workflow",
      inputSchema: {
        type: "object",
        properties: {
          workflowId: { type: "string" },
        },
        required: ["workflowId"],
      },
    },
    {
      name: "n8n_trigger_webhook",
      description: "Trigger an n8n workflow via webhook",
      inputSchema: {
        type: "object",
        properties: {
          webhookId: { type: "string" },
          data: { type: "object" },
        },
        required: ["webhookId"],
      },
    }
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    if (name === "slack_list_channels") {
      return { content: [{ type: "text", text: JSON.stringify(await slack.listChannels()) }] };
    }
    if (name === "slack_get_history") {
      return { content: [{ type: "text", text: JSON.stringify(await slack.getHistory(args.channelId, args.limit)) }] };
    }
    if (name === "slack_get_thread_replies") {
      return { content: [{ type: "text", text: JSON.stringify(await slack.getThreadReplies(args.channelId, args.threadTs)) }] };
    }
    if (name === "slack_list_users") {
      return { content: [{ type: "text", text: JSON.stringify(await slack.listUsers()) }] };
    }
    if (name === "notion_search") {
      return { content: [{ type: "text", text: JSON.stringify(await notion.search(args.query)) }] };
    }
    if (name === "notion_get_page") {
      return { content: [{ type: "text", text: JSON.stringify(await notion.getPage(args.pageId)) }] };
    }
    if (name === "notion_get_database") {
      return { content: [{ type: "text", text: JSON.stringify(await notion.getDatabase(args.databaseId)) }] };
    }
    if (name === "n8n_list_workflows") {
      return { content: [{ type: "text", text: JSON.stringify(await n8n.listWorkflows()) }] };
    }
    if (name === "n8n_get_workflow") {
      return { content: [{ type: "text", text: JSON.stringify(await n8n.getWorkflow(args.workflowId)) }] };
    }
    if (name === "n8n_trigger_webhook") {
      return { content: [{ type: "text", text: JSON.stringify(await n8n.triggerWorkflow(args.webhookId, args.data)) }] };
    }
  } catch (error) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
