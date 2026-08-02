# CLAUDE.md

Guidance for any AI agent (Claude Code or otherwise) working in this repo. Read this file first.

## Project

Internal invoice ledger for 2 users: invoice creation, ledger tracking, PDF generation, charts,
hardcoded financial quotes. Priorities, in order: simplicity, zero cost, maintainability.

## Tech stack

**Frontend** (`apps/web`) — Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts.

**Backend** (`apps/api`) — Node.js, Express, TypeScript, JWT auth, bcrypt, Playwright (PDF
generation via headless Chromium), Mongoose (MongoDB ODM).

**Database** — MongoDB Atlas, free M0 cluster, Mongoose as the sole data-access layer (no raw
driver unless required).

## Monorepo layout

```
apps/web      → Next.js frontend
apps/api      → Express backend
packages/types      → shared TypeScript types
packages/payroll     → shared payroll calculation logic
packages/eslint-config → shared ESLint config
```

## Environments

Two parallel environments, driven by git branch:

| Branch | Environment | Vercel project | Render service | Mongo database |
|---|---|---|---|---|
| `develop` | Staging | `invoice-ledger` (staging) | `invoice-ledger-api-staging` | `invoice_ledger_dev` |
| `master` | Production | `invoice-ledger` (prod) | `invoice-ledger-api-prod` | `invoice_ledger_prod` |

Both environments share one Atlas cluster; only the database name in `MONGO_URI` differs.
Each environment has its own `JWT_SECRET` and `PASSWORD_HASH`. See `README.md` for the full
deployment runbook.

## Authentication

Single shared password login (2 users). bcrypt-hashed password compared server-side, JWT issued
on success, 7-day expiry. Generate a hash with `npm run hash-password -w apps/api`.

## Development rules

- Always follow existing patterns in the codebase before introducing new ones.
- Keep the backend lightweight — Express + Mongoose only.
- Mongoose is the sole database layer; don't add the raw MongoDB driver unless required.
- Prefer simplicity over abstraction. No over-engineering, no extra frameworks/libraries unless
  clearly required.
- No SCSS. No Fastify — Express only.

## Library documentation

When adding or configuring a library, use Context7 MCP against these official sources:

- Frontend: https://nextjs.org/docs · https://react.dev/reference · https://tailwindcss.com/docs
  · https://ui.shadcn.com/docs · https://lucide.dev/guide/packages/lucide-react ·
  https://recharts.org/en-US/api
- Backend: https://expressjs.com/ · https://nodejs.org/en/docs
- Auth: https://jwt.io/introduction · https://github.com/kelektiv/node.bcrypt.js
- Database: https://www.mongodb.com/docs/atlas/ ·
  https://www.mongodb.com/docs/drivers/node/current/ · https://mongoosejs.com/docs/
- Tooling: https://www.typescriptlang.org/docs/ · https://eslint.org/docs/latest/ ·
  https://playwright.dev/docs/intro

## AI agent behavior rule

1. Read this file first.
2. Use Context7 MCP for any library setup or API lookup.
3. Follow existing architecture strictly — don't introduce new patterns without justification.
4. Never commit secrets. `MONGO_URI`, `JWT_SECRET`, and `PASSWORD_HASH` are environment
   variables only (see `.env.example`); real values live in Render's dashboard per environment.
