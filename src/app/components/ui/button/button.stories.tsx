import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import Button from '@/app/components/ui/button';

const meta = {
  title: 'Base/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn(), onError: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Basic Button',
    arialabel: 'Basic Button',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    arialabel: 'Disabled Button',
    disabled: true,
  },
};

export const CustomClass: Story = {
  args: {
    children: 'Custom Class Button',
    arialabel: 'Custom Class Button',
    className: 'bg-red-500 text-white',
  },
};
