import { createHmac } from 'crypto';
import { NextResponse } from 'next/server';

function createAccessToken() {
  return createHmac('sha256', process.env.DISCORD_ACCESS_TOKEN_SECRET!).update('discord-access').digest('hex');
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  let password: string | undefined;

  if (typeof body === 'object' && body !== null && 'password' in body) {
    const value = (body as Record<string, unknown>).password;
    if (typeof value === 'string') {
      password = value;
    }
  }

  if (!process.env.DISCORD_ACCESS_PASSWORD || password !== process.env.DISCORD_ACCESS_PASSWORD) {
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set('discord-access', createAccessToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
