import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const countMock = vi.fn();
const settingsMock = vi.fn();

// Mock Prisma DB
vi.mock('@/server/db', () => ({
  db: {
    user: {
      count: countMock,
    },
  },
}));

// Mock settings util
vi.mock('@/utils/settings', () => ({
  getSettings: settingsMock,
}));

// Mock OrnamentalRule (safe stub)
vi.mock('@/app/components/ui/ornamental-rule', () => ({
  default: () => <div data-testid="rule" />,
}));

describe('JoinPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders member count and pluralization (1 member)', async () => {
    countMock.mockResolvedValue(1);
    settingsMock.mockResolvedValue({
      subtitle: 'Test FC',
      welcomeText: 'Welcome to the FC',
      discordInvite: 'https://discord.gg/test',
    });

    const { default: JoinPage } = await import('@/app/join/page');

    render(await JoinPage());

    expect(screen.getByText('1 member and counting.')).toBeInTheDocument();
  });

  it('renders plural members correctly', async () => {
    countMock.mockResolvedValue(5);
    settingsMock.mockResolvedValue({
      subtitle: 'Test FC',
      welcomeText: 'Welcome',
      discordInvite: 'https://discord.gg/test',
    });

    const { default: JoinPage } = await import('@/app/join/page');

    render(await JoinPage());

    expect(screen.getByText('5 members and counting.')).toBeInTheDocument();
  });

  it('shows Discord CTA when invite exists', async () => {
    countMock.mockResolvedValue(2);
    settingsMock.mockResolvedValue({
      subtitle: 'Test FC',
      welcomeText: 'Welcome',
      discordInvite: 'https://discord.gg/test',
    });

    const { default: JoinPage } = await import('@/app/join/page');

    render(await JoinPage());

    expect(screen.getByRole('link', { name: /join our discord/i })).toHaveAttribute('href', 'https://discord.gg/test');
  });

  it('shows fallback CTA when invite is missing', async () => {
    countMock.mockResolvedValue(2);
    settingsMock.mockResolvedValue({
      subtitle: 'Test FC',
      welcomeText: 'Welcome',
      discordInvite: null,
    });

    const { default: JoinPage } = await import('@/app/join/page');

    render(await JoinPage());

    expect(screen.getByText(/discord invite coming soon/i)).toBeInTheDocument();
  });

  it('renders WHAT_WE_OFFER cards', async () => {
    countMock.mockResolvedValue(2);
    settingsMock.mockResolvedValue({
      subtitle: 'Test FC',
      welcomeText: 'Welcome',
      discordInvite: null,
    });

    const { default: JoinPage } = await import('@/app/join/page');

    render(await JoinPage());

    expect(screen.getByText(/all content, all skill levels/i)).toBeInTheDocument();
    expect(screen.getByText(/a real community/i)).toBeInTheDocument();
    expect(screen.getByText(/a safe, friendly space/i)).toBeInTheDocument();
  });

  it('renders settings text content', async () => {
    countMock.mockResolvedValue(3);
    settingsMock.mockResolvedValue({
      subtitle: 'The Wolves Den',
      welcomeText: 'A welcoming free company',
      discordInvite: null,
    });

    const { default: JoinPage } = await import('@/app/join/page');

    render(await JoinPage());

    expect(screen.getByText('The Wolves Den')).toBeInTheDocument();
    expect(screen.getByText('A welcoming free company')).toBeInTheDocument();
  });
});
