import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';

import { registerInteractionHandler } from './discord.js';
import { registerRoutes } from './routes.js';

// ── Env validation ────────────────────────────────────────────────────────────
const { DISCORD_BOT_TOKEN, BOT_SECRET, FRONTEND_URL, PORT = '3001' } = process.env;

if (!DISCORD_BOT_TOKEN) throw new Error('Missing DISCORD_BOT_TOKEN');
if (!BOT_SECRET) throw new Error('Missing BOT_SECRET');
if (!FRONTEND_URL) throw new Error('Missing FRONTEND_URL');

// ── Discord client ────────────────────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', (c) => {
  // eslint-disable-next-line no-console
  console.log(`🤖 Logged in as ${c.user.tag}`);
});

registerInteractionHandler(client, FRONTEND_URL, BOT_SECRET);

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

registerRoutes(app, client, BOT_SECRET);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(parseInt(PORT, 10), '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Bot API listening on port ${PORT}`);
});

client.login(DISCORD_BOT_TOKEN).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('❌ Discord login failed:', err);
  process.exit(1);
});
