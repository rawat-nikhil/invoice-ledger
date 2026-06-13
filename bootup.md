# 🧾 Invoice Ledger Application — Bootup Context

## 📌 Project Overview

Internal invoice ledger system for 2 users.

Features:
- Invoice creation
- Ledger tracking
- PDF generation
- Charts and analytics
- Hardcoded financial quotes

Focus: simplicity, zero cost, maintainability.

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript
- JWT authentication
- bcrypt
- Playwright (PDF generation)
- Mongoose (MongoDB ODM)

### Database
- MongoDB Atlas (free tier)
- Mongoose for schemas, models, and queries

---

## 📁 Monorepo Structure

apps/web → Next.js frontend (Vercel)  
apps/api → Express backend (Render)  
packages/types → shared TypeScript types  
packages/eslint-config → shared ESLint config  

---

## 🚀 Hosting Plan

- Frontend → Vercel
- Backend → Render
- DB → MongoDB Atlas

---

## 🔐 Authentication

- Single password login
- bcrypt hashed password
- JWT issued on success
- 7-day expiry

---

## 📄 Core Features

- Invoice management
- Ledger tracking
- PDF generation via Playwright
- Charts via Recharts
- Hardcoded financial quotes

---

## ⚙️ Development Rules

- Always follow existing patterns
- Do not introduce unnecessary libraries
- Keep backend lightweight (Express + Mongoose only)
- Use Mongoose as the sole database layer (no raw MongoDB driver unless required)
- Prefer simplicity over abstraction

---

## ⚠️ Constraints

- No SCSS
- No Fastify (Express only)
- No over-engineering
- No extra frameworks unless required

---

## 🧠 AI Behavior Rule

Any AI agent working on this repo must:

1. Check bootup.md first
2. Use Context7 MCP for library setup
3. Follow existing architecture strictly
4. Avoid introducing new patterns without justification