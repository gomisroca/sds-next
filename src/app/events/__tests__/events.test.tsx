import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';

import EventsPage from '@/app/events/page';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

type EventData = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  startsAt: Date;
  endsAt: Date | null;
  status: 'PUBLISHED' | 'DRAFT';
  createdById: string;
  createdBy: { name: string };
  _count: { attendances: number };
};

type AuthResponse = {
  user: {
    id: string;
    role: 'DRAGON' | 'GUEST';
  };
};

vi.mock('generated/prisma', () => ({
  EventStatus: {
    PUBLISHED: 'PUBLISHED',
    DRAFT: 'DRAFT',
  },
}));

vi.mock('@/server/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/server/db', () => ({
  db: {
    event: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/app/components/ui/ornamental-rule', () => ({
  default: () => <div data-testid="ornamental-rule" />,
}));

vi.mock('@/app/events/event-row', () => ({
  default: ({ event }: { event: Pick<EventData, 'id' | 'name'> }) => (
    <div data-testid={`event-${event.id}`}>{event.name}</div>
  ),
}));

vi.mock('@/app/events/past-events', () => ({
  default: ({ upcomingIds }: { upcomingIds: string[] }) => (
    <div data-testid="past-events">{JSON.stringify(upcomingIds)}</div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

function mockEvent(overrides: Partial<EventData> = {}): EventData {
  return {
    id: '1',
    name: 'Test Event',
    description: null,
    location: null,
    imageUrl: null,
    startsAt: new Date('2026-07-01T10:00:00Z'),
    endsAt: null,
    status: 'PUBLISHED',
    createdById: 'user-1',
    createdBy: { name: 'Alice' },
    _count: { attendances: 5 },
    ...overrides,
  };
}

function getAuthMock() {
  return vi.mocked(auth as unknown as MockedFunction<() => Promise<AuthResponse>>);
}

function getFindManyMock() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return vi.mocked(db.event.findMany as unknown as MockedFunction<() => Promise<EventData[]>>);
}

describe('EventsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no events exist', async () => {
    const authMock = getAuthMock();
    const findManyMock = getFindManyMock();

    authMock.mockResolvedValue({ user: { id: 'u1', role: 'DRAGON' } });
    findManyMock.mockResolvedValue([]);

    const page = await EventsPage();
    render(page);

    expect(screen.getByText(/no upcoming events/i)).toBeInTheDocument();
  });

  it('renders event schedule when events exist', async () => {
    const authMock = getAuthMock();
    const findManyMock = getFindManyMock();

    authMock.mockResolvedValue({ user: { id: 'u1', role: 'DRAGON' } });
    findManyMock.mockResolvedValue([mockEvent({ id: '1', name: 'Alpha' }), mockEvent({ id: '2', name: 'Beta' })]);

    const page = await EventsPage();
    render(page);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('shows Create Event button only for non-guest users', async () => {
    const authMock = getAuthMock();
    const findManyMock = getFindManyMock();

    authMock.mockResolvedValue({ user: { id: 'u1', role: 'DRAGON' } });
    findManyMock.mockResolvedValue([mockEvent()]);

    const page = await EventsPage();
    render(page);

    expect(screen.getByText(/create event/i)).toBeInTheDocument();
  });

  it('hides Create Event button for guests', async () => {
    const authMock = getAuthMock();
    const findManyMock = getFindManyMock();

    authMock.mockResolvedValue({ user: { id: 'u1', role: 'GUEST' } });
    findManyMock.mockResolvedValue([mockEvent()]);

    const page = await EventsPage();
    render(page);

    expect(screen.queryByText(/create event/i)).toBeNull();
  });

  it('passes upcomingIds into PastEvents', async () => {
    const authMock = getAuthMock();
    const findManyMock = getFindManyMock();

    authMock.mockResolvedValue({ user: { id: 'u1', role: 'DRAGON' } });
    findManyMock.mockResolvedValue([mockEvent({ id: 'a' }), mockEvent({ id: 'b' })]);

    const page = await EventsPage();
    render(page);

    const past = screen.getByTestId('past-events');
    expect(past.textContent).toContain('a');
    expect(past.textContent).toContain('b');
  });
});
