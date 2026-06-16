import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';

const meta = {
  title: 'Base/OrnamentalRule',
  component: OrnamentalRule,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OrnamentalRule>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomClass: Story = {
  args: {
    className: 'max-w-2xl opacity-70',
  },
};
