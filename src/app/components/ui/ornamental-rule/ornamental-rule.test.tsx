import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';

describe('OrnamentalRule', () => {
  it('renders the OrnamentalRule container correctly', () => {
    const { container } = render(<OrnamentalRule />);

    // Select the wrapper div using its base Tailwind classes
    const wrapper = container.querySelector('.flex.w-full.items-center');

    expect(wrapper).toBeInTheDocument();
  });

  it('applies custom className properties correctly', () => {
    const customClass = 'mt-8 custom-test-class';
    const { container } = render(<OrnamentalRule className={customClass} />);

    const wrapper = container.querySelector('.flex.w-full.items-center');

    expect(wrapper).toHaveClass('mt-8');
    expect(wrapper).toHaveClass('custom-test-class');
  });

  it('renders all 5 decorative elements in order', () => {
    const { container } = render(<OrnamentalRule />);

    // Select the main wrapper div
    const wrapper = container.querySelector('.flex.w-full.items-center');

    // Ensure all 5 child lines and diamonds are rendered
    expect(wrapper?.children).toHaveLength(5);
  });
});
