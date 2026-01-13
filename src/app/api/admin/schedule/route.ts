import { NextResponse } from 'next/server';
import { schedulerQueue } from '@/queue';

export async function POST(req: Request) {
  await schedulerQueue.add('run', {}, { jobId: `schedule-${Date.now()}` });
  const url = new URL(req.url);
  return NextResponse.redirect(new URL('/dashboard', url));
}
