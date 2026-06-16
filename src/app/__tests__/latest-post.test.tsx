import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LatestBlogPost from '@/app/latest-post';

// 1. Establish independent lambda trackers to handle internal DB method monitoring
const findFirstMock = vi.fn();

// 2. Mock the central Prisma Database Layer
vi.mock('@/server/db', () => ({
  db: {
    post: {
      findFirst: findFirstMock,
    },
  },
}));

// 3. Completely mock Next.js routing Link components to native HTML anchors
vi.mock('next/link', () => {
  return {
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
      <a href={href} className={className}>
        {children}
      </a>
    ),
  };
});

describe('LatestBlogPost Async Server Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing (null) when no published posts exist in the database', async () => {
    findFirstMock.mockResolvedValueOnce(null);

    // Resolve the async RSC element wrapper node before letting testing-library mount it
    const Component = await LatestBlogPost();

    // If an RSC returns null, render nothing or check that the container is empty
    const { container } = render(Component);
    expect(container.firstChild).toBeNull();
  });

  it('renders a stylized blog card preview complete with fallback translation labels', async () => {
    const mockPostData = {
      id: 'post_xyz',
      title: 'Echoes of the Dragonsong',
      slug: 'echoes-of-the-dragonsong',
      excerpt: 'A comprehensive study of historical Ishgardian campaigns and battlefields.',
      coverImage: 'https://cdn.example.com/dragonsong.png',
      publishedAt: new Date('2026-03-24T10:00:00.000Z'),
      author: { name: 'Estinien' },
    };

    findFirstMock.mockResolvedValueOnce(mockPostData);

    const Component = await LatestBlogPost();
    render(Component);

    // Validate that the underlying findFirst query filtered properly
    expect(findFirstMock).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    });

    // Check link routing structure path setup
    const wrapperLink = screen.getByRole('link');
    expect(wrapperLink).toHaveAttribute('href', '/blog/echoes-of-the-dragonsong');

    // Confirm typography displays accurately (en-GB date pattern: '24 March 2026')
    expect(screen.getByRole('heading', { name: 'Echoes of the Dragonsong' })).toBeInTheDocument();
    expect(screen.getByText(/24 March 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Estinien/i)).toBeInTheDocument();
    expect(
      screen.getByText('A comprehensive study of historical Ishgardian campaigns and battlefields.')
    ).toBeInTheDocument();

    // Validate cover image rendering properties
    const coverImage = screen.getByRole('img', { name: 'Echoes of the Dragonsong' });
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', 'https://cdn.example.com/dragonsong.png');
  });

  it('gracefully handles missing optional metadata fields like coverImage and excerpt', async () => {
    const minimalisticPost = {
      id: 'post_abc',
      title: 'Short Update Note',
      slug: 'short-update-note',
      excerpt: null,
      coverImage: null,
      publishedAt: new Date('2026-06-15T09:00:00.000Z'),
      author: { name: null },
    };

    findFirstMock.mockResolvedValueOnce(minimalisticPost);

    const Component = await LatestBlogPost();
    render(Component);

    // Structural elements should render correctly
    expect(screen.getByRole('heading', { name: 'Short Update Note' })).toBeInTheDocument();
    expect(screen.getByText(/15 June 2026/i)).toBeInTheDocument();

    // Check that missing values do not leave dangling elements or render crash artifacts
    expect(screen.queryByRole('img')).toBeNull();
    // Confirm metadata lines are scrubbed cleanly when author name properties return null
    expect(screen.queryByText(/·/)).toBeNull();
  });
});
