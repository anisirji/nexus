# Nexus

One AI assistant for your whole Google account: Gmail, Calendar, Drive, Tasks and Forms.

A one-day build from September 2025. The Google side works: sign-in with offline access, a service for each Google API, and two combined workflows. The AI chat that would call them as tools was never connected.

## What works

- **Google sign-in** with offline access; tokens are stored and refreshed automatically
- **Gmail** (search, send, drafts, attachments), **Calendar** (Meet links, free-slot finder), **Drive**, **Tasks** and **Forms**, one service per API
- **Interview scheduler**: creates a Meet event, then a feedback form, then sends the email
- **Daily briefing**: today's events, tasks and unread mail, fetched in parallel

Not built: the AI chat on top. The newest unfinished work is on the `latest-local-work` branch.

## Stack

Next.js 15, React 19, TypeScript, NextAuth, Prisma, PostgreSQL, Google APIs, Tailwind.

## Run it

1. Create a Google OAuth client with the Gmail, Calendar, Drive, Tasks and Forms scopes.
2. In `.env.local`, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL` (Postgres) and `NEXTAUTH_SECRET`.
3. `npm install`, `npx prisma migrate dev`, `npm run dev`.

## Portfolio

More about this project: https://theani.me/work/nexus
