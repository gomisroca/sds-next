import { type Client, EmbedBuilder, type TextChannel } from 'discord.js';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

let running = false;

type ReminderEvent = {
  id: string;
  name: string;
  startsAt: string;
};

async function sendReminder(client: Client, event: ReminderEvent) {
  const channel = await client.channels.fetch(process.env.REMINDER_CHANNEL_ID!);

  if (!channel?.isTextBased()) return;

  const unix = Math.floor(new Date(event.startsAt).getTime() / 1000);

  const embed = new EmbedBuilder()
    .setTitle('⏰ Event Reminder')
    .setDescription(`**${event.name}** starts in about **24 hours**.`)
    .addFields({
      name: 'Starts',
      value: `<t:${unix}:F>\n(<t:${unix}:R>)`,
    })
    .setTimestamp();

  await (channel as TextChannel).send({
    embeds: [embed],
  });
}

export function startReminderScheduler(client: Client) {
  const poll = async () => {
    if (running) return;
    running = true;

    try {
      const res = await fetch(`${process.env.API_URL}/api/events/due-reminders`, {
        headers: {
          'x-bot-secret': process.env.BOT_SECRET!,
        },
      });

      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch reminders:', await res.text());
        return;
      }

      const events = (await res.json()) as ReminderEvent[];

      for (const event of events) {
        try {
          await sendReminder(client, event);

          await fetch(`${process.env.API_URL}/api/events/${event.id}/reminder-sent`, {
            method: 'POST',
            headers: {
              'x-bot-secret': process.env.BOT_SECRET!,
            },
          });
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`Failed reminder for event ${event.id}`, err);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Reminder scheduler failed:', err);
    } finally {
      running = false;
    }
  };

  // Run immediately
  void poll();

  // Then every 5 minutes
  setInterval(() => {
    void poll();
  }, POLL_INTERVAL);
}
