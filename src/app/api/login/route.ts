import { NextResponse } from 'next/server';
import { z } from 'zod';
import { config } from '@/config';

export async function POST(req: Request) {
  const body = z.object({ password: z.string() }).parse(await req.json());
  if (body.password !== config.ADMIN_PASSWORD) return NextResponse.json({ ok: false }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('dc_admin', '1', { httpOnly: true, sameSite: 'lax', path: '/' });
  return res;
}
