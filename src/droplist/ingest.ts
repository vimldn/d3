import zlib from 'node:zlib';
import { prisma } from '@/db';
import { config } from '@/config';
import { parseDroplist } from './parse';

export async function ingestDroplist(): Promise<{ upserted: number }> {
  const res = await fetch(config.DROPLIST_URL);
  if (!res.ok) throw new Error(`Droplist fetch failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const csv = zlib.gunzipSync(buf).toString('utf8');

  const rows = parseDroplist(csv);
  const now = new Date();

  let upserted = 0;
  for (const r of rows) {
    await prisma.domainDrop.upsert({
      where: { domainName: r.domainName },
      create: { domainName: r.domainName, dropTimeUtc: r.dropTimeUtc, lastSeenOnDroplist: now, status: 'new' },
      update: { dropTimeUtc: r.dropTimeUtc, lastSeenOnDroplist: now }
    });
    upserted++;
  }
  return { upserted };
}
