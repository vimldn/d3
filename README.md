# Nominet Dropcatch Dashboard (Next.js + Worker)

This repo is designed so the **website can deploy on Vercel**, while the **worker runs separately** (VPS/Fly/Render),
because EPP needs a long-lived TLS socket.

## What runs where
- **Vercel (Next.js dashboard + API)**: UI, backorders, view statuses, enqueue jobs to Redis
- **Worker (Node process)**: droplist ingest + scheduling + EPP catching

You can still run everything locally.

## Local quick start
1) `docker compose up -d`
2) `npm install`
3) `cp .env.example .env` then edit it
4) `npx prisma migrate dev`
5) Terminal 1: `npm run dev`
6) Terminal 2: `npm run worker`

Open http://localhost:3000

## Vercel
- Deploy the repo to Vercel (it will build now).
- Set env vars in Vercel: `DATABASE_URL`, `REDIS_URL`, `ADMIN_PASSWORD`
- Do NOT run EPP worker on Vercel. Run `npm run worker` on a server with access to Redis+Postgres+cert files.
