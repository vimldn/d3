import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  ADMIN_PASSWORD: z.string().min(1),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),

  DROPLIST_URL: z.string(),

  EPP_HOST: z.string(),
  EPP_PORT: z.coerce.number().default(700),
  EPP_CLIENT_CERT_PATH: z.string(),
  EPP_CLIENT_KEY_PATH: z.string(),
  EPP_CA_PATH: z.string(),
  EPP_USERNAME: z.string(),
  EPP_PASSWORD: z.string(),
  EPP_TAG: z.string().optional(),

  FIRE_RETRY_MS: z.coerce.number().default(2000),
  FIRE_RETRY_STEPS_MS: z.string().default("0,120,250,400,650,900,1200,1600"),

  DEFAULT_REGISTRANT_CONTACT_ID: z.string(),
  DEFAULT_ADMIN_CONTACT_ID: z.string(),
  DEFAULT_TECH_CONTACT_ID: z.string(),
  DEFAULT_NAMESERVERS: z.string(),
  DEFAULT_PERIOD_YEARS: z.coerce.number().default(1)
});
export const config = schema.parse(process.env);

export const retrySteps = config.FIRE_RETRY_STEPS_MS.split(',').map(s=>Number(s.trim())).filter(n=>Number.isFinite(n)&&n>=0);
export const defaultNameservers = config.DEFAULT_NAMESERVERS.split(',').map(s=>s.trim()).filter(Boolean);
