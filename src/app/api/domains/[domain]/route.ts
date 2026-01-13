import { NextResponse } from 'next/server';
import { prisma } from '@/db';

export async function GET(_req: Request, ctx: { params: { domain: string } }) {
  const domainName = decodeURIComponent(ctx.params.domain).toLowerCase().trim();
  const d = await prisma.domainDrop.findUnique({ where: { domainName }, include: { backorders: true, attempts: { orderBy: { createdAt: 'asc' } } } });
  if (!d) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(d);
}
