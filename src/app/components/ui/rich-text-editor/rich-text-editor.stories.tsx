import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import RichTextEditor from '@/app/components/ui/rich-text-editor';

const meta = {
  title: 'Base/RichTextEditor',
  component: RichTextEditor,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: null,
    placeholder: 'Share your journey with the guild...',
  },
};

export const PreFilledContent: Story = {
  args: {
    placeholder: 'Write something…',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Free Company Directives' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'All active phoenix members must report to the frontlines.' }],
        },
      ],
    },
  },
};
