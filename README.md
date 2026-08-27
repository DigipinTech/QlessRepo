# QLess — Hospital & Clinic Queue Management (Phase 1 demo)

QLess digitizes the hospital OPD queue: real-time doctor-wise tokens, a public
live display board, patient self-service, and the analytics a hospital
administrator actually needs. This app is a working demonstration of the
**Hospital & Clinic Queue Management module** described in the QLess BRD — the
first module of a planned multi-sector queue platform (restaurants, spas and
sports facilities are later phases; the same engine is designed to extend to
diagnostic labs too).

It's built as one Next.js app with two halves:

- A **marketing site** (`/`, `/solutions`, `/features`, `/pricing`, `/about`,
  `/contact`) explaining the product to hospitals, patients and labs, with a
  working "Request a demo" form.
- A **functional web app** — role-based dashboards, the token/queue engine,
  patient self-service, and a public display board — all running on real
  (seeded) data, not mockups.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — brand color tokens sampled from the DigiPin
  Technology / QLess mark, defined in `src/app/globals.css`
- **Prisma 7** + **SQLite** (via `@prisma/adapter-better-sqlite3`) for the
  data layer — see `prisma/schema.prisma` for the full domain model
- **jose** (JWT) + **bcryptjs** for auth — httpOnly cookie sessions, 5 roles
- **recharts** for the analytics dashboard, **zod** for input validation

## Getting started

```bash
npm install            # also runs `prisma generate` via postinstall
npm run db:migrate      # create prisma/dev.db and apply migrations
npm run db:seed         # load two demo hospitals with live sample data
npm run dev              # http://localhost:3000
```

Copy `.env.example` to `.env` first if it isn't already present, and set a
real `JWT_SECRET` before deploying anywhere beyond your own machine.

Whenever you change `prisma/schema.prisma`, run `npm run db:migrate` **and**
`npx prisma generate` — this Prisma version's `migrate dev` does not
regenerate the client automatically.

### Demo accounts

All seeded accounts use the password `Qless@123`.

| Role | Email | Where it lands |
|---|---|---|
| Super Admin | `superadmin@qless.app` | `/super-admin` — onboard hospitals, view platform metrics |
| Hospital Admin | `admin@sunrisehospital.example` | `/admin` — departments, doctors, staff, analytics |
| Doctor | `meera.nair@sunrisehospital.example` | `/doctor` — live queue, call next, consult |
| Receptionist | `reception@sunrisehospital.example` | `/reception` — generate tokens, manage today's queue |

Patients don't need an account: self-registration is at `/q/<hospital-slug>`
(try `/q/sunrise-hospital`) and the public live display board is at
`/display/<hospital-slug>`.

## Architecture notes

- **Auth**: `src/lib/auth/session.ts` issues a signed JWT stored in an
  httpOnly cookie. `src/proxy.ts` (Next 16 renamed `middleware.ts` to
  `proxy.ts`) redirects unauthenticated/wrong-role requests for page routes;
  every API route additionally calls `requireApiSession()` itself, since
  Proxy only covers the page-prefix matcher, not `/api/**`.
- **Queue engine**: `src/lib/queue/engine.ts` is the single source of truth
  for token generation, the FIFO/emergency-override call-next logic, the
  token state machine, pausing, day-end reset, and delay broadcasts — all
  wrapped in Prisma transactions with audit logging. Every role's UI (staff
  and public) calls the same engine functions through role-scoped API
  routes, so there's exactly one place queue business logic lives.
- **Notifications**: there's no real SMS/WhatsApp/push gateway in this demo.
  `src/lib/queue/notify.ts` logs every simulated send to `NotificationLog`,
  visible live at `/admin/notifications`.
- **Real-time updates**: BRD 7.5 calls for a 5-second auto-refresh on the
  live queue display. `src/hooks/use-polling.ts` implements that via
  interval polling (used by the doctor panel, reception queue view, patient
  tracker, and the public display board) rather than WebSockets, matching
  the BRD's stated cadence with far less infrastructure.
- **Multi-tenancy**: every domain row is scoped by `hospitalId`; staff roles
  other than Super Admin are pinned to their own hospital via
  `resolveHospitalScope()` / `loadDoctorForSession()` in
  `src/lib/api-helpers.ts`.

## Deploying

The SQLite file (`prisma/dev.db`) is fine for local development and demos,
but it lives on local disk — it will **not** survive on a serverless
platform like Vercel, where the filesystem is ephemeral per invocation. To
deploy for real:

1. Point `DATABASE_URL` at a hosted Postgres/MySQL/LibSQL database.
2. Swap the Prisma datasource `provider` and driver adapter
   (`@prisma/adapter-pg`, etc.) to match.
3. Re-run `prisma migrate deploy` against that database.
4. Set a strong, secret `JWT_SECRET` in your hosting environment.

For a quick persistent demo, a small VM or container host (Fly.io, Railway,
a Docker host with a volume) that keeps the SQLite file on disk needs no
code changes at all.

### One-click free deploy (Render)

`render.yaml` at the repo root is a ready-to-use Render Blueprint: it builds
the app, runs migrations, reseeds demo data, and starts the server on
Render's free web-service tier — no external database needed, since the
free tier's container disk lives for the life of that instance and
`npm run start:deploy` (`prisma migrate deploy && npm run db:seed && next
start`) rebuilds it fresh on every boot.

1. Go to `https://render.com/deploy?repo=https://github.com/DigipinTech/QlessRepo`
   (sign in / create a free Render account if you don't have one).
2. Grant Render access to the `DigipinTech` GitHub org if this repo is
   private, then in the blueprint wizard pick the branch you want to deploy.
3. Click **Apply**. Render provisions `JWT_SECRET` automatically
   (`generateValue: true`) and gives you a public `https://qless-*.onrender.com`
   URL once the build finishes (a few minutes).

Free-tier notes: the instance spins down after ~15 minutes idle and takes
~30–50s to wake on the next request, and demo data resets to the seeded
state on every restart — both are fine for a demo, not for a real deployment.
For a durable deployment, use Vercel (or any host) with `DATABASE_URL`
pointed at a real Postgres instance (e.g. Neon or Supabase's free tiers)
per the steps above instead.

## Project structure

```
prisma/schema.prisma        Domain model (Hospital, Doctor, Token, ...)
prisma/seed.ts               Demo data
src/lib/queue/engine.ts      Token/queue business logic
src/lib/auth/                Session, password hashing, RBAC helpers
src/app/(marketing)/         Public marketing site
src/app/{super-admin,admin,doctor,reception}/   Role dashboards
src/app/q/[slug]/            Patient self-service
src/app/display/[slug]/      Public live queue display board
src/app/api/                 Route handlers (staff + public)
```

## What's in scope (Phase 1 MVP)

Per the BRD: hospital onboarding, doctor management, token generation and
the full queue engine, real-time queue display, patient self-service,
simulated notifications, role-based access control, and analytics. EMR
integration, billing, insurance claims, pharmacy/lab management, and
multi-hospital centralized analytics are explicitly out of scope for this
phase.
