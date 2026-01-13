import { NextResponse } from 'next/server';
import { droplistQueue } from '@/queue';

export async function POST(req: Request) {
  await droplistQueue.add('ingest', {}, { jobId: `ingest-${Date.now()}` });
  const url = new URL(req.url);
  return NextResponse.redirect(new URL('/dashboard', url));
}
