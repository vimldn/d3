import { NextResponse } from 'next/server';
import { prisma } from '@/db';

export async function GET() {
  const hb = await prisma.workerHeartbeat.findUnique({ where: { name: 'main-worker' } });
  return NextResponse.json({ ok: !!hb, lastSeen: hb?.lastSeen ?? null, details: hb?.details ?? null });
}
