import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import NotFound from '@/app/not-found';

// Mock next/link completely to safeguard path transitions
vi.mock('next/link', () => {
  return {
    default: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
      <a href={href} className={className}>
        {children}
      </a>
    ),
  };
});

describe('NotFound Global 404 Component', () => {
  it('renders structural 404 text blocks alongside semantic content definitions', () => {
    render(<NotFound />);

    // Assert the core typographic focal elements are present
    const errorCode = screen.getByText('404');
    const statusHeader = screen.getByRole('heading', { name: /page not found/i });
    const descriptiveText = screen.getByText(/this page doesn't exist or has been moved/i);

    expect(errorCode).toBeInTheDocument();
    expect(statusHeader).toBeInTheDocument();
    expect(descriptiveText).toBeInTheDocument();
  });

  it('renders a configured return navigation link pointing directly to the root home route', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /return home/i });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    // Assert signature aesthetic styles are loaded onto the navigation button
    expect(homeLink).toHaveClass('uppercase', 'tracking-[0.25em]', 'text-red-400/85');
  });

  it('contains structural background layers and decorative design elements', () => {
    const { container } = render(<NotFound />);

    // Verify main container node has correct semantic layout bounds
    const mainWrapper = screen.getByRole('main');
    expect(mainWrapper).toHaveClass('min-h-screen', 'text-white', 'bg-[#060404]');

    // Confirm custom decorative font rules are injected inline
    expect(mainWrapper).toHaveStyle({
      fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif",
    });

    // Check for the presence of the decorative background container cells
    const backgroundLayers = container.querySelectorAll('main > div');

    // The first two divs represent the fixed gradient overlay rings
    expect(backgroundLayers.length).toBeGreaterThanOrEqual(2);
    expect(backgroundLayers[0]).toHaveClass('fixed', 'inset-0', 'pointer-events-none');
    expect(backgroundLayers[1]).toHaveStyle({
      backgroundSize: '60px 60px',
    });
  });

  it('incorporates design system assets safely with accessible attributes', () => {
    const { container } = render(<NotFound />);

    // Query for the SVG sigil ring block
    const svgElement = container.querySelector('svg');

    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveAttribute('aria-hidden', 'true'); // Prevents screen readers from getting tripped up on styling lines
    expect(svgElement).toHaveAttribute('viewBox', '0 0 80 80');

    // Validate individual inner vector paths exist inside the stub sigil container
    const circles = container.querySelectorAll('svg > circle');
    expect(circles).toHaveLength(2);
    expect(circles[0]).toHaveAttribute('stroke-dasharray', '8 4');
  });
});
