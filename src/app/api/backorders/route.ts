import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db';

export async function POST(req: Request) {
  const body = z.object({
    domainName: z.string().min(3).transform(s => s.toLowerCase().trim()),
    customerId: z.string().min(1),
    priority: z.number().int().min(0).max(100).optional()
  }).parse(await req.json());

  await prisma.domainDrop.upsert({
    where: { domainName: body.domainName },
    create: { domainName: body.domainName, dropTimeUtc: new Date(Date.now() + 3650*24*3600*1000), lastSeenOnDroplist: new Date(0), status: 'new' },
    update: {}
  });

  const bo = await prisma.backorder.create({ data: { domainName: body.domainName, customerId: body.customerId, priority: body.priority ?? 0 } });
  return NextResponse.json(bo);
}
