import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

import { db } from '@/server/db';
import { env } from '@/env';
import { type Character, type Group } from 'generated/prisma';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      characters: Character[];
      ownedGroups: Group[];
      groups: Group[];
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    async session({ session, user }) {
      if (!user?.id) return session;

      // Fetch user with related data
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: {
          characters: true,
          ownedGroups: true,
          groups: true,
        },
      });

      if (!dbUser) return session;

      return {
        ...session,
        user: {
          ...session.user,
          id: dbUser.id,
          characters: dbUser.characters,
          ownedGroups: dbUser.ownedGroups,
          groups: dbUser.groups,
        },
      };
    },
  },
} satisfies NextAuthConfig;
