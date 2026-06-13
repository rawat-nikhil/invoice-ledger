# 🛠️ Monorepo Setup Guide (npm Workspaces + Express)

## 📌 Purpose

This file contains step-by-step instructions to set up the monorepo.

Use npm workspaces and follow all steps strictly.

Before configuring any library, use Context7 MCP with the official documentation links provided in context.md.

---

## ⚙️ Step 1: Initialize Root Project

npm init -y

Update package.json:

{
"private": true,
"workspaces": [
"apps/*",
"packages/*"
],
"scripts": {
"dev": "concurrently -n WEB,API -c blue,green \"npm run dev -w apps/web\" \"npm run dev -w apps/api\"",
"build": "npm run build -ws",
"lint": "npm run lint -ws"
}
}

Install root dev dependencies:

npm install -D concurrently typescript eslint

---

## 📁 Step 2: Folder Structure

apps/web  
apps/api

packages/types  
packages/eslint-config

---

## ⚙️ Step 3: Root TypeScript Config

Create tsconfig.base.json:

- strict: true
- target: ES2020
- module: CommonJS
- esModuleInterop: true
- skipLibCheck: true
- baseUrl: "."
- paths:
  "@repo/types/_": ["packages/types/_"]

---

## 🌐 Step 4: Frontend (apps/web - Next.js)

Create Next.js app (App Router + TypeScript)

Install:

- Tailwind CSS
- shadcn/ui
- recharts

Scripts:

- dev: next dev
- build: next build
- start: next start
- lint: next lint

Use Context7 MCP + Next.js docs for setup decisions.

---

## ⚙️ Step 5: Backend (apps/api - Express)

Initialize project:

npm init -y

Install dependencies:

npm install express jsonwebtoken bcrypt zod dotenv cors mongoose
npm install -D typescript tsx @types/node @types/express

---

### Create Express Server

- Setup express app
- Enable JSON parsing
- Add CORS middleware
- Read PORT from env

Add route:

GET /health → { status: "ok" }

---

### Dev Script

"dev": "tsx watch src/index.ts"

---

### Mongoose (MongoDB ORM)

Use Context7 MCP + Mongoose docs (via context.md) for setup decisions.

- Connect to MongoDB Atlas using `MONGO_URI` from env on server startup
- Create a db connection module (e.g. `src/db/connect.ts`)
- Define Mongoose schemas/models for `Invoice` and `LedgerEntry` (aligned with `packages/types`)
- Handle connection errors; disconnect gracefully on process exit
- Extend `GET /health` to reflect database connection status when connected

---

## 📦 Step 6: Shared Types (packages/types)

Create reusable types:

- Invoice
- LedgerEntry
- UserSession

Export and use via:
@repo/types

---

## 📏 Step 7: ESLint (STRICT SHARED CONFIG)

Rules:

- no-unused-vars → error
- no-console → warn
- eqeqeq → error
- consistent-return → error
- @typescript-eslint/no-explicit-any → error
- prefer-const → error

Extend in both apps.

---

## 🔐 Step 8: Authentication (Express)

POST /auth/login

Flow:

- accept password only
- compare with bcrypt hash
- if valid → return JWT

JWT:

- secret from env
- expiry: 7d

---

## 📄 Step 9: Playwright PDF

Install playwright in backend

Create utility:

generateInvoicePDF(html: string): Buffer

Use Chromium for rendering.

---

## 🌱 Step 10: Environment Variables

Create .env.example:

PORT=4000
MONGO_URI=
JWT_SECRET=

NEXT_PUBLIC_API_URL=
PLAYWRIGHT_CHROMIUM_PATH=

---

## 🧪 Step 11: Verify Setup

npm install  
npm run dev

Check:

- frontend loads
- backend /health works (includes MongoDB connection status)
- Mongoose connects to MongoDB Atlas via MONGO_URI
- no TS errors
- ESLint clean

---

## 🚀 Step 12: Deployment

Frontend:

- Vercel → apps/web

Backend:

- Render → apps/api

Build:
npm install && npm run build

---

## ⚠️ Constraints

- No SCSS
- No unnecessary dependencies
- Keep architecture simple
- Use Express only (no Fastify)

---

## 🧠 Final Rule

Always consult Context7 MCP + official docs before implementing library setup or configuration. Latest documentation link will be provided by context.md - use context7 to do so.
