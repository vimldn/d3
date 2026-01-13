import { Worker } from 'bullmq';
import { connection } from '@/queue';
import { ingestDroplist } from '@/droplist/ingest';
import { scheduleUpcomingDrops } from '@/scheduler/schedule';
import { prisma } from '@/db';
import { EppClient } from '@/epp/eppClient';
import { xmlHello, xmlLogin, xmlDomainCreate } from '@/epp/nominet';
import { retrySteps, config, defaultNameservers } from '@/config';

async function heartbeat(details: string) {
  await prisma.workerHeartbeat.upsert({
    where: { name: 'main-worker' },
    create: { name: 'main-worker', lastSeen: new Date(), details },
    update: { lastSeen: new Date(), details }
  });
}
setInterval(() => { heartbeat('ok').catch(()=>{}); }, 30_000);

const epp = new EppClient();
let loggedIn = false;
let loginInFlight: Promise<void> | null = null;

async function ensureEppReady() {
  await epp.connect();
  if (!loggedIn) {
    if (!loginInFlight) {
      loginInFlight = (async () => { await epp.send(xmlLogin()); loggedIn = true; })().finally(()=>{ loginInFlight = null; });
    }
    await loginInFlight;
  }
}

function extractResult(xml: string): { code: string; msg: string } {
  const code = /<result code="(\d+)">/.exec(xml)?.[1] ?? '????';
  const msg  = /<msg[^>]*>([^<]+)<\/msg>/.exec(xml)?.[1] ?? '';
  return { code, msg };
}
function isTransient(code: string, msg: string) {
  if (code === '2302') return true;
  if (/not available|exists|in use/i.test(msg)) return true;
  return false;
}

new Worker('droplist', async () => ingestDroplist(), { connection });
new Worker('scheduler', async () => scheduleUpcomingDrops(24*60), { connection });

new Worker('catch', async (job) => {
  const { domainName } = job.data as { domainName: string };

  if (job.name === 'prep') {
    await prisma.domainDrop.update({ where: { domainName }, data: { status: 'queued' } });
    return;
  }

  if (job.name === 'arm') {
    await ensureEppReady();
    await epp.send(xmlHello());
    await prisma.domainDrop.update({ where: { domainName }, data: { status: 'armed' } });
    return;
  }

  if (job.name === 'fire') {
    await ensureEppReady();
    await prisma.domainDrop.update({ where: { domainName }, data: { status: 'firing' } });

    const winner = await prisma.backorder.findFirst({ where: { domainName }, orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }] });
    if (!winner) {
      await prisma.domainDrop.update({ where: { domainName }, data: { status: 'failed', lastErrorMsg: 'No backorder at fire time' } });
      return;
    }

    const payload = xmlDomainCreate({
      domain: domainName,
      registrantContactId: config.DEFAULT_REGISTRANT_CONTACT_ID,
      adminContactId: config.DEFAULT_ADMIN_CONTACT_ID,
      techContactId: config.DEFAULT_TECH_CONTACT_ID,
      nameservers: defaultNameservers,
      periodYears: config.DEFAULT_PERIOD_YEARS
    });

    const start = Date.now();
    let attemptNo = 0;

    for (const delayMs of retrySteps) {
      if (Date.now() - start > config.FIRE_RETRY_MS) break;
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));

      attemptNo++;
      const sentAt = new Date();
      const t0 = Date.now();
      let xml: string;
      try { xml = await epp.send(payload); }
      catch (e: any) {
        await prisma.domainDrop.update({ where: { domainName }, data: { status: 'failed', lastErrorMsg: `EPP send failed: ${String(e?.message ?? e)}` } });
        return;
      }

      const rtt = Date.now() - t0;
      const { code, msg } = extractResult(xml);

      await prisma.attempt.create({ data: { domainName, attemptNo, sentTimeUtc: sentAt, rttMs: rtt, resultCode: code, resultMsg: msg } });

      if (code === '1000' || code === '1001') {
        await prisma.domainDrop.update({ where: { domainName }, data: { status: 'caught', lastErrorCode: null, lastErrorMsg: null } });
        return;
      }

      if (!isTransient(code, msg)) {
        await prisma.domainDrop.update({ where: { domainName }, data: { status: 'failed', lastErrorCode: code, lastErrorMsg: msg } });
        return;
      }
    }

    await prisma.domainDrop.update({ where: { domainName }, data: { status: 'failed', lastErrorMsg: 'Retry window elapsed' } });
  }
}, { connection });

console.log('Worker started.');
heartbeat('starting').catch(()=>{});
