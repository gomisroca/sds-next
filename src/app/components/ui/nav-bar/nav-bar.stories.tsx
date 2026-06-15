import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import React from 'react';

import NavBar from '@/app/components/ui/nav-bar/nav-bar-client';

// Clear types for both the session data mock and the decorator function structure
const withSession = (sessionData: Partial<Session> | null) => {
  const DecoratorComponent = (Story: React.ComponentType) => (
    <SessionProvider session={sessionData as Session}>
      <Story />
    </SessionProvider>
  );

  DecoratorComponent.displayName = 'WithSessionDecorator';

  return DecoratorComponent;
};

const meta = {
  title: 'Base/NavBar',
  component: NavBar,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
  decorators: [withSession(null)],
};

export const AuthenticatedMember: Story = {
  decorators: [
    withSession({
      user: {
        id: 'user-123',
        name: 'Alphinaud Leveilleur',
        image: 'https://via.placeholder.com/150',
        role: 'MEMBER',
      },
    }),
  ],
};

export const AuthenticatedOfficer: Story = {
  decorators: [
    withSession({
      user: {
        id: 'user-456',
        name: 'Graha Tia',
        image: null,
        role: 'OFFICER',
      },
    }),
  ],
};
