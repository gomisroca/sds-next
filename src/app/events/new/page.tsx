import { redirect } from 'next/navigation';

import { CreateEventWizard } from '@/app/events/event-wizard';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export default async function NewEventPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'MEMBER' && user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    redirect('/events');
  }

  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
          <h1 className="mb-2 text-3xl font-extralight tracking-wide text-white/85 uppercase md:text-4xl">New Event</h1>
          <p className="text-sm font-light text-white/35">
            Fill in the details, set the time, then choose whether to publish straight to Discord.
          </p>
        </div>

        <CreateEventWizard />
      </div>
    </main>
  );
}
