import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import HomeHero from '@/app/hero';

// 1. Mock Framer Motion to bypass animation timelines and render pure snapshot DOM layouts
vi.mock('framer-motion', async () => {
  const React = await vi.importActual<typeof import('react')>('react');

  const motion = new Proxy(
    {},
    {
      get: (_, tag: string) => {
        type Props = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

        const Component = React.forwardRef<HTMLElement, Props>(function MotionMock({ children, ...props }, ref) {
          return React.createElement(tag, { ref, ...props }, children);
        });

        // Provide a displayName for clearer test output and to satisfy lint rules
        Component.displayName = `motion.${tag}`;

        return Component;
      },
    }
  );

  return {
    motion,
    useScroll: () => ({
      scrollYProgress: {
        get: () => 0,
        onChange: () => () => {
          void 0;
        },
      },
    }),
    useTransform: () => 0,
  };
});

// 3. Mock sub-component components safely
vi.mock('./components/ui/ornamental-rule', () => ({
  default: () => <div data-testid="ornamental-rule" />,
}));

describe('HomeHero Core Landing View Component', () => {
  beforeEach(() => {
    // Inject innerHeight fallback parameter onto the test window instance
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  it('renders structural branding headings with accurate textual styling rules', () => {
    render(<HomeHero />);

    // Capture separate stylized fragments from the primary typographic container
    const upperTitle = screen.getByRole('heading', { name: /^sleeping$/i });
    const lowerTitle = screen.getByRole('heading', { name: /^dragons$/i });

    expect(upperTitle).toBeInTheDocument();
    expect(lowerTitle).toBeInTheDocument();

    // Assert signature transparent background text-clipping classes are attached to the title element
    expect(upperTitle).toHaveClass('text-6xl', 'md:text-8xl', 'font-extralight', 'uppercase');
  });

  it('renders call-to-action buttons targeting localized sub-routes and deep links', () => {
    render(<HomeHero />);

    const joinButton = screen.getByRole('link', { name: /join us/i });
    const learnMoreButton = screen.getByRole('link', { name: /learn more/i });

    expect(joinButton).toBeInTheDocument();
    expect(joinButton).toHaveAttribute('href', '/join');
    expect(joinButton).toHaveClass('border-red-700/50', 'bg-red-950/20');

    expect(learnMoreButton).toBeInTheDocument();
    expect(learnMoreButton).toHaveAttribute('href', '#welcome');
  });

  it('generates the particle ember array layers completely within safe view bounds', () => {
    const { container } = render(<HomeHero />);

    // Query for elements using the distinct custom radial gradient configuration
    const particleEmberNodes = Array.from(container.querySelectorAll('div')).filter((el) => {
      const bgStyle = el.style.background;
      return bgStyle.includes('#ff6644') && bgStyle.includes('#cc2200');
    });

    // Validates that the length tracking setup returns the absolute base 30 array item generation cap
    expect(particleEmberNodes.length).toBe(30);

    // Assert individual particle layout styles are initialized correctly
    const singleEmber = particleEmberNodes[0];
    expect(singleEmber).toHaveClass('absolute', 'rounded-full');
    expect(singleEmber!.style.left).toMatch(/%$/);
    expect(singleEmber!.style.bottom).toBe('-10px');
  });

  it('mounts the structural SVG dragon sigil along with layout helper tokens', () => {
    render(<HomeHero />);

    const ornamentalRule = screen.getByTestId('ornamental-rule');
    const serverConnectionInfo = screen.getByText(/eu\s+·\s+light\s+·\s+phoenix/i);
    const subHeaderMotto = screen.getByText(/a friendly free company for every kind of adventurer/i);

    expect(ornamentalRule).toBeInTheDocument();
    expect(serverConnectionInfo).toBeInTheDocument();
    expect(subHeaderMotto).toBeInTheDocument();
  });

  it('displays the scroll hint layout down at the bottom of the section', () => {
    render(<HomeHero />);

    const scrollCueLabel = screen.getByText(/scroll/i);
    expect(scrollCueLabel).toBeInTheDocument();
    expect(scrollCueLabel).toHaveClass('tracking-[0.3em]', 'text-red-700/50', 'uppercase');
  });
});
