import { NextResponse } from 'next/server';
import { prisma } from '@/db';

type DomainListItem = {
  domainName: string;
  dropTimeUtc: Date;
  status: string;
  backorders: { id: string }[];
};

export async function GET() {
  const items: DomainListItem[] = await prisma.domainDrop.findMany({
    orderBy: { dropTimeUtc: 'asc' },
    take: 200,
    select: { domainName: true, dropTimeUtc: true, status: true, backorders: { select: { id: true } } }
  });

  return NextResponse.json({
    items: items.map((i: DomainListItem) => ({
      domainName: i.domainName,
      dropTimeUtc: i.dropTimeUtc,
      status: i.status,
      backordersCount: i.backorders.length
    }))
  });
}
