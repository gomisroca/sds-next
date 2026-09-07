import { redirect } from 'next/navigation';

import { PageShell } from '@/app/components/ui/page-shell';
import { CreateEventWizard } from '@/app/events/event-wizard';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?toast=unauthorized');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'MEMBER' && user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    redirect('/events');
  }

  return (
    <PageShell>
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
          <h1 className="mb-2 text-3xl font-extralight tracking-wide text-white/90 uppercase md:text-4xl">New Event</h1>
          <p className="text-sm font-light text-white/60">
            Fill in the details, set the time, then choose whether to publish straight to Discord.
          </p>
        </div>

        <CreateEventWizard />
      </div>
    </PageShell>
  );
}
