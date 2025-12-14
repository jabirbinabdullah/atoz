# atoz — starter Next.js app

This project is a minimal starter created with Next.js (App Router), TypeScript and Tailwind CSS.

Quick start (PowerShell / Windows):

```powershell
# install dependencies (already run by the scaffold CLI)
npm install

# start dev server
npm run dev

# build for production
npm run build

# run production server locally
npm start
```

What we added so far
- Next.js with TypeScript
- Tailwind CSS
- ESLint config
- A small `Header` component at `src/components/Header.tsx`

What's next
- Add pages, components and a simple API route
- Add basic tests and CI
- Pick a feature to implement (todo list, auth, CRUD, etc.) and iterate

Persistence (localStorage)
--------------------------

What I implemented in the Todo feature:

- Client-side persistence: todos are saved to `localStorage` under the key `atoz:todos`.
- Server-side in-memory store: API handlers live at `src/app/api/todos/route.ts` and keep an in-memory array while the dev server runs.
- UI: `src/components/TodoList.tsx` is a client component (React) that:
	- Loads cached todos from `localStorage` immediately on mount for instant UI.
	- Fetches the canonical list from the server (`GET /api/todos`) and replaces the UI state with the server list.
	- Writes todos to `localStorage` whenever the local UI state changes.
	- Performs optimistic updates for add/toggle/delete and then calls the API (POST/PUT/DELETE).

Why this approach and technologies used
- localStorage (Web API): lightweight client-only persistence that survives browser reloads. No backend DB required. Good for learning and quick iteration.
- Next.js App Router API routes: `src/app/api/todos/route.ts` demonstrates how to add server-side handlers inside the App Router. The server store is ephemeral (memory only) but shows the server<->client flow.
- React "client" components: `TodoList` is a client component (uses "use client") that performs data fetching and UI interactions.

Files touched/created for persistence
- `src/components/TodoList.tsx` — updated to load/save to `localStorage` and sync with `/api/todos` (important file to read to understand behavior).
- `src/app/api/todos/route.ts` — server side in-memory API handlers (GET/POST/PUT/DELETE).
- `src/app/todos/page.tsx` — UI page that mounts the `TodoList` component.

Behavior notes and tradeoffs
- The server is the canonical source for the running dev session; when the server returns data it replaces the client cache. The `localStorage` cache is mainly for resilience across browser reloads or short server restarts.
- If you want true persistence across server restarts or multi-user sharing, the next step is to plug in a database (SQLite via Prisma is a simple next step).

If you'd like, I can now:
- Add `localStorage` as a fallback only (keep server as primary) — currently the implementation caches locally and then reconciles with server automatically.
- Swap the in-memory server for SQLite + Prisma and keep the same UI.
- Add inline edit for todo text, or tests + CI.


If you'd like, tell me which feature you want to build next and I'll implement it step-by-step.

SQLite + Prisma (persistent DB)
--------------------------------

What I added for persistent storage:

- Prisma & SQLite: I installed `prisma` (dev) and `@prisma/client` and added a schema at `prisma/schema.prisma` defining a `Todo` model.
- Environment: a `.env` file was added with `DATABASE_URL="file:./dev.db"` so Prisma uses a local SQLite database at `./dev.db`.
- Prisma client helper: `src/lib/prisma.ts` exports a singleton Prisma client instance to avoid creating multiple connections while Next.js hot-reloads.
- Database migration: I ran `npx prisma migrate dev --name init` which created `prisma/migrations/*` and a SQLite file `dev.db` in the project root.
- API: `src/app/api/todos/route.ts` was updated to use Prisma queries (create, read, update, delete) instead of the earlier in-memory array.

Why Prisma?
- Prisma provides a typesafe query API and works well with Next.js. SQLite is an excellent lightweight choice for local development and learning.

Files of interest (persistent DB)
- `prisma/schema.prisma` — the Prisma schema (data model & datasource).
- `.env` — database connection string.
- `prisma/migrations/` — migrations created by Prisma.
- `src/lib/prisma.ts` — Prisma client singleton.
- `src/app/api/todos/route.ts` — API handlers now persist to SQLite.

If you'd like, I can now:
- Add migration scripts to `package.json` and helper npm scripts (e.g., `prisma:migrate`).
- Add basic integration tests that run against the SQLite DB in CI (requires setting up a DB lifecycle in the workflow).
- Add a small admin page for inspecting the DB contents or export/import functionality.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
What's next
- Add pages, components and a simple API route
How to set up DB (MongoDB) and sync schema:
# .env example (MongoDB running locally on default port)
# DATABASE_URL="mongodb://localhost:27017/atoz"

# Generate Prisma client
npx prisma generate

# Push schema to MongoDB (Prisma Migrate is not used for MongoDB)
npx prisma db push
- Marriages (spouse A–B): `src/app/api/relationships/marriages/route.ts`.
- Members page: `src/app/members/page.tsx` (list + add).

Prisma schema additions:
- `Member`, `ParentChild`, `Marriage` with helpful indexes and constraints in `prisma/schema.prisma`.

How to set up DB and migrate:
```powershell
# Ensure DATABASE_URL is set (MySQL is configured in prisma/schema.prisma)
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


Try the API locally:
```powershell
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
