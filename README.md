# Invoice Ledger

Internal invoice ledger app for 2 users: invoice creation, ledger tracking, PDF generation, and
basic charts/analytics.

## Tech stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend**: Node.js, Express, TypeScript, JWT auth, bcrypt, Playwright (PDF generation)
- **Database**: MongoDB Atlas (free tier), Mongoose

## Monorepo layout

```
apps/web       Next.js frontend
apps/api       Express backend
packages/types           shared TypeScript types
packages/payroll         shared payroll calculation logic
packages/eslint-config   shared ESLint config
```

## Local setup

Prerequisites: Node.js, npm, a MongoDB Atlas connection string.

```bash
npm install
```

Copy the env templates and fill them in:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local   # if present, else create manually
```

`apps/api/.env`:

```
PORT=4000
MONGO_URI=<your mongodb connection string>
JWT_SECRET=<random string>
PASSWORD_HASH=<bcrypt hash, see below>
WEB_ORIGIN=http://localhost:3000
```

`apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Generate `PASSWORD_HASH` from a plaintext password:

```bash
npm run hash-password -w apps/api -- '<your password>'
```

Run both apps:

```bash
npm run dev
```

## Scripts

- `npm run dev` — run `apps/web` and `apps/api` concurrently
- `npm run build` — build both apps
- `npm run lint` — lint both apps
- `npm run hash-password -w apps/api -- '<password>'` — bcrypt-hash a password for `PASSWORD_HASH`

## Deployment

Two environments, driven by git branch — see [`CLAUDE.md`](./CLAUDE.md) for the full mapping:

| Branch | Environment | Frontend | Backend | Database |
|---|---|---|---|---|
| `develop` | Staging | Vercel (staging project) | Render (`invoice-ledger-api-staging`) | `invoice_ledger_dev` |
| `master` | Production | Vercel (prod project) | Render (`invoice-ledger-api-prod`) | `invoice_ledger_prod` |

- **Frontend** deploys to Vercel (Hobby/free), root directory `apps/web`.
- **Backend** deploys to Render (free web service) — chosen over Vercel serverless functions
  because PDF generation needs a full headless Chromium via Playwright, which doesn't fit
  Vercel's free serverless function constraints.
- **Database** is a single free MongoDB Atlas M0 cluster; staging and production use separate
  database names on the same cluster.

Both platforms auto-deploy on push to their respective branch. See the deployment runbook
provided alongside this repo's setup for exact dashboard steps and environment variables.
