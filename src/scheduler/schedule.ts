import { prisma } from '@/db';
import { catchQueue } from '@/queue';

export async function scheduleUpcomingDrops(windowMinutes = 24 * 60) {
  const now = new Date();
  const max = new Date(now.getTime() + windowMinutes * 60_000);

  const targets = await prisma.domainDrop.findMany({
    where: { dropTimeUtc: { gte: now, lte: max }, backorders: { some: {} }, status: { in: ['new','queued'] } },
    select: { domainName: true, dropTimeUtc: true }
  });

  for (const t of targets) {
    const dropMs = t.dropTimeUtc.getTime();
    const prepDelay = Math.max(0, dropMs - Date.now() - 60_000);
    const armDelay  = Math.max(0, dropMs - Date.now() - 5_000);
    const fireDelay = Math.max(0, dropMs - Date.now());

    await catchQueue.add('prep', { domainName: t.domainName }, { jobId: `prep:${t.domainName}:${dropMs}`, delay: prepDelay });
    await catchQueue.add('arm',  { domainName: t.domainName }, { jobId: `arm:${t.domainName}:${dropMs}`,  delay: armDelay  });
    await catchQueue.add('fire', { domainName: t.domainName }, { jobId: `fire:${t.domainName}:${dropMs}`, delay: fireDelay });

    await prisma.domainDrop.update({ where: { domainName: t.domainName }, data: { status: 'queued' } });
  }
  return { scheduled: targets.length };
}
