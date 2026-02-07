import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function search(query) {
  return await notion.search({ query });
}

export async function getPage(pageId) {
  return await notion.pages.retrieve({ page_id: pageId });
}

export async function getDatabase(databaseId) {
  return await notion.databases.retrieve({ database_id: databaseId });
}

// CLI handling
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [,, cmd, arg] = process.argv;
  if (cmd === 'search') console.log(JSON.stringify(await search(arg), null, 2));
}
