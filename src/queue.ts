import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '@/config';

export const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });

export const droplistQueue = new Queue('droplist', { connection });
export const schedulerQueue = new Queue('scheduler', { connection });
export const catchQueue = new Queue('catch', { connection });
