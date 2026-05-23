// ── Types ─────────────────────────────────────────────────────────────────────
export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  image?: { url: string };
  fields?: EmbedField[];
  footer?: { text: string };
  timestamp?: string;
}

// ── RSVP button row ───────────────────────────────────────────────────────────
export function renderRSVPButtons(eventId: string, isClosed: boolean) {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          label: '✅ Attend',
          style: 3,
          custom_id: `rsvp:${eventId}:ATTENDING`,
          disabled: isClosed,
        },
        {
          type: 2,
          label: '❓ Maybe',
          style: 2,
          custom_id: `rsvp:${eventId}:MAYBE`,
          disabled: isClosed,
        },
        {
          type: 2,
          label: '❌ Not attending',
          style: 4,
          custom_id: `rsvp:${eventId}:NOT_ATTENDING`,
          disabled: isClosed,
        },
      ],
    },
  ];
}

// ── Attendance status labels ──────────────────────────────────────────────────
const ATTENDANCE_LABELS: Record<string, string> = {
  ATTENDING: '✅ Attending',
  NOT_ATTENDING: '❌ Not Attending',
  MAYBE: '❓ Maybe',
};

export function labelAttendanceStatus(status: string): string {
  return ATTENDANCE_LABELS[status] ?? status;
}
