import { PrismaAdapter } from '@auth/prisma-adapter';
import { createHmac } from 'crypto';
import { cookies } from 'next/headers';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import DiscordProvider from 'next-auth/providers/discord';

import { env } from '@/env';
import { db } from '@/server/db';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
  }
}

function createAccessToken() {
  return createHmac('sha256', env.DISCORD_ACCESS_TOKEN_SECRET).update('discord-access').digest('hex');
}

export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
    }),
  ],

  adapter: PrismaAdapter(db) as Adapter,

  callbacks: {
    async signIn() {
      const cookieStore = await cookies();
      const accessCookie = cookieStore.get('discord-access');

      if (accessCookie?.value !== createAccessToken()) {
        return false;
      }

      return true;
    },

    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as { role?: string }).role ?? 'MEMBER';

      return session;
    },
  },
} satisfies NextAuthConfig;
