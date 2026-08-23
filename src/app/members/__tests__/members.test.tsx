import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const findManyMock = vi.fn();

vi.mock('@/server/db', () => ({
  db: {
    user: {
      findMany: findManyMock,
    },
  },
}));

vi.mock('@/app/members/member-card', () => ({
  default: ({ member }: { member: { id: string; name: string } }) => (
    <div data-testid={`member-${member.id}`}>{member.name}</div>
  ),
}));

vi.mock('@/app/components/ui/ornamental-rule', () => ({
  default: () => <div data-testid="rule" />,
}));

describe('MembersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseMembers = [
    {
      id: '1',
      name: 'Alice',
      image: null,
      role: 'LEADER',
      profile: {
        name: null,
        bio: null,
        portrait: null,
        job: null,
        activities: null,
        playstyle: null,
      },
    },
    {
      id: '2',
      name: 'Bob',
      image: null,
      role: 'OFFICER',
      profile: {
        name: null,
        bio: null,
        portrait: null,
        job: null,
        activities: null,
        playstyle: null,
      },
    },
    {
      id: '3',
      name: 'Charlie',
      image: null,
      role: 'DRAGON',
      profile: {
        name: null,
        bio: null,
        portrait: null,
        job: null,
        activities: null,
        playstyle: null,
      },
    },
  ];

  it('renders member count correctly', async () => {
    findManyMock.mockResolvedValue(baseMembers);

    const { default: MembersPage } = await import('@/app/members/page');

    render(await MembersPage());

    expect(screen.getByText('3 adventurers call the Den home.')).toBeInTheDocument();
  });

  it('calls db with correct query', async () => {
    findManyMock.mockResolvedValue(baseMembers);

    const { default: MembersPage } = await import('@/app/members/page');

    await MembersPage();

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      where: {
        role: { in: ['ANCIENT', 'WYRM', 'DRAGON'] },
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        profile: {
          select: {
            name: true,
            bio: true,
            portrait: true,
            job: true,
            activities: true,
            playstyle: true,
          },
        },
      },
    });
  });

  it('renders leadership and regular sections when mixed roles exist', async () => {
    findManyMock.mockResolvedValue(baseMembers);

    const { default: MembersPage } = await import('@/app/members/page');

    render(await MembersPage());

    expect(screen.getByText('Leadership')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Members' })).toBeInTheDocument();
    expect(screen.getByTestId('member-1')).toBeInTheDocument();
    expect(screen.getByTestId('member-2')).toBeInTheDocument();
    expect(screen.getByTestId('member-3')).toBeInTheDocument();
  });

  it('renders only members section when no leadership exists', async () => {
    findManyMock.mockResolvedValue([
      {
        id: '3',
        name: 'Charlie',
        image: null,
        role: 'MEMBER',
        profile: {
          name: null,
          bio: null,
          portrait: null,
          job: null,
          activities: null,
          playstyle: null,
        },
      },
    ]);

    const { default: MembersPage } = await import('@/app/members/page');

    render(await MembersPage());

    expect(screen.queryByText('Leadership')).toBeNull();
    expect(screen.queryByText('Leadership')).toBeNull();
    expect(screen.getByTestId('member-3')).toBeInTheDocument();
  });

  it('renders empty state when no members exist', async () => {
    findManyMock.mockResolvedValue([]);

    const { default: MembersPage } = await import('@/app/members/page');

    render(await MembersPage());

    expect(screen.getByText(/no members yet/i)).toBeInTheDocument();
  });

  it('renders correct pluralization for member count', async () => {
    findManyMock.mockResolvedValue(baseMembers);

    const { default: MembersPage } = await import('@/app/members/page');

    render(await MembersPage());

    expect(screen.getByText(/3 adventurers call the den home/i)).toBeInTheDocument();
  });
});
