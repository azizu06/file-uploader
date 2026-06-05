# File Uploader

A personal cloud-storage app — sign in, create folders, and upload files — built to
learn **Prisma ORM** alongside Supabase storage and session auth. Think of it as a small
personal "storage device" on the web.

## Preview

> **TODO — add a screenshot.** Running locally requires a PostgreSQL database, a Supabase
> storage bucket, and session config (see below), so a live capture isn't included yet.
> Once running, capture the file/folder view to `docs/assets/preview.png`.

## Features

- User authentication with **Passport** (local strategy) + `bcryptjs`.
- Folder creation and nested file organization.
- File uploads handled by **multer** and stored in **Supabase** storage.
- Data modeled and queried with **Prisma ORM** over PostgreSQL.
- Session storage backed by Prisma (`@quixo3/prisma-session-store`).
- Root-delete protection so the top-level folder can't be removed.

## Tech stack

Node.js · **Express** · **Prisma** (`@prisma/client`, `@prisma/adapter-pg`) ·
**PostgreSQL** · **Supabase** storage · `multer` · Passport · EJS · Tailwind CSS

## Getting started

```bash
npm install
npx prisma generate
npm run db:init      # initialize the schema
npm run dev          # Express server + Tailwind watch (concurrently)
```

### Environment variables

Set in a local `.env` (gitignored). Variable **names** only:

| Variable | Used for |
|---|---|
| `POSTGRES_URL` | PostgreSQL connection string (Prisma) |
| `SESSION_PASS` | Session secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side) |
| `SUPABASE_BUCKET` | Supabase storage bucket name |
| `PORT` | Server port (optional) |

## What I practiced

Modeling relational data with **Prisma**, integrating a third-party object store
(Supabase) for uploads via multer, session-based auth, and guarding destructive
operations (root-folder delete protection).

## License

Odin Project coursework — original implementation by Aziz Umarov.
