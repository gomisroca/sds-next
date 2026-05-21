import { type Client, Events, type Interaction } from 'discord.js';

import { labelAttendanceStatus } from './embed.js';

export function registerInteractionHandler(client: Client, frontendUrl: string, botSecret: string): void {
  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteraction(interaction, frontendUrl, botSecret);
  });
}

async function handleInteraction(interaction: Interaction, frontendUrl: string, botSecret: string): Promise<void> {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('rsvp:')) return;

  const parts = interaction.customId.split(':');
  const eventId = parts[1];
  const status = parts[2];
  const discordUserId = interaction.user.id;

  if (!eventId || !status) return;

  try {
    await interaction.deferUpdate();

    await interaction.followUp({
      content: `Your RSVP has been set to **${labelAttendanceStatus(status)}**.`,
      ephemeral: true,
    });

    void updateRsvp(frontendUrl, botSecret, { eventId, discordUserId, status });
  } catch (err) {
    logError('[interaction] Handler error:', err);
  }
}

type RsvpPayload = {
  eventId: string;
  discordUserId: string;
  status: string;
};

async function updateRsvp(frontendUrl: string, botSecret: string, payload: RsvpPayload): Promise<void> {
  try {
    const res = await fetch(`${frontendUrl}/api/discord/rsvp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-secret': botSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      logError(`[rsvp] Failed for user ${payload.discordUserId} on event ${payload.eventId}:`, body);
    }
  } catch (err) {
    logError('[rsvp] Network error:', err);
  }
}

function logError(...args: unknown[]): void {
  process.stderr.write(args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ') + '\n');
}
