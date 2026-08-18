import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PastEvents from '@/app/events/past-events';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

const fetchMock = vi.fn();

const firstPage = {
  events: [
    {
      id: '1',
      name: 'Treasure Hunt',
      description: 'Maps and loot!',
      location: 'Gridania',
      imageUrl: null,
      startsAt: '2026-05-12T18:00:00.000Z',
      endsAt: null,
      _count: { attendances: 12 },
    },
    {
      id: '2',
      name: 'Extreme Trial',
      description: null,
      location: 'Limsa Lominsa',
      imageUrl: null,
      startsAt: '2026-05-20T19:00:00.000Z',
      endsAt: null,
      _count: { attendances: 7 },
    },
  ],
  nextCursor: 'cursor-2',
  hasMore: true,
};

describe('PastEvents', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('loads and renders past events on mount', async () => {
    fetchMock.mockResolvedValue({
      json: async () => firstPage,
    });

    render(<PastEvents />);

    expect(await screen.findByRole('heading', { name: 'Treasure Hunt' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Extreme Trial' })).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('filters events whose ids are already present in upcomingIds', async () => {
    fetchMock.mockResolvedValue({
      json: async () => firstPage,
    });

    render(<PastEvents upcomingIds={['1']} />);

    expect(await screen.findByRole('heading', { name: 'Extreme Trial' })).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: 'Treasure Hunt' })).toBeNull();
  });

  it('groups events beneath month headings', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        events: [
          {
            ...firstPage.events[0],
            startsAt: '2026-05-01T18:00:00.000Z',
          },
          {
            ...firstPage.events[1],
            startsAt: '2026-06-05T19:00:00.000Z',
          },
        ],
        nextCursor: null,
        hasMore: false,
      }),
    });

    render(<PastEvents />);

    const monthHeadings = await screen.findAllByTestId('month-heading');

    const months = monthHeadings.map((el) => el.textContent);

    expect(months).toContain('May 2026');
    expect(months).toContain('June 2026');
  });

  it('loads additional pages when clicking Load more', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: async () => firstPage,
      })
      .mockResolvedValueOnce({
        json: async () => ({
          events: [
            {
              id: '3',
              name: 'Mount Farm',
              description: null,
              location: 'Mor Dhona',
              imageUrl: null,
              startsAt: '2026-04-01T20:00:00.000Z',
              endsAt: null,
              _count: { attendances: 20 },
            },
          ],
          nextCursor: null,
          hasMore: false,
        }),
      });

    render(<PastEvents />);

    const button = await screen.findByRole('button', {
      name: /load more/i,
    });

    fireEvent.click(button);

    expect(await screen.findByRole('heading', { name: 'Mount Farm' })).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when no past events are returned', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        events: [],
        nextCursor: null,
        hasMore: false,
      }),
    });

    const { container } = render(<PastEvents />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('handles failed fetches without crashing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

    fetchMock.mockRejectedValue(new Error('Network error'));

    render(<PastEvents />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('shows completion message when all pages have been loaded', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        events: firstPage.events,
        nextCursor: null,
        hasMore: false,
      }),
    });

    render(<PastEvents />);

    expect(await screen.findByText(/that's all of them/i)).toBeInTheDocument();
  });

  it('renders links to each event detail page', async () => {
    fetchMock.mockResolvedValue({
      json: async () => firstPage,
    });

    render(<PastEvents />);

    const links = await screen.findAllByRole('link');

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/events/1');
    expect(links[1]).toHaveAttribute('href', '/events/2');
  });

  it('renders attendance counts and locations', async () => {
    fetchMock.mockResolvedValue({
      json: async () => firstPage,
    });

    render(<PastEvents />);

    expect(await screen.findByText('Gridania')).toBeInTheDocument();
    expect(screen.getByText('Limsa Lominsa')).toBeInTheDocument();

    const firstEvent = screen.getByRole('link', { name: /treasure hunt/i });

    expect(within(firstEvent).getByTestId('event-attendance')).toHaveTextContent('12');
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
