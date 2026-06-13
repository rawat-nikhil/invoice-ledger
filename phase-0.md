You are working in a Next.js (App Router) + Tailwind CSS project using shadcn/ui.

Your task is to implement a scalable **Atomic Design System** for this invoice ledger application.

The system must follow:
- Atoms → visual primitives (shadcn-based wrappers)
- Molecules → business-level reusable components
- Organisms → full UI sections (optional, future phase)

DO NOT over-engineer. DO NOT break shadcn architecture.

---

# 📁 Required Folder Structure

Create the following structure:

components/
  ui/        → original shadcn components (DO NOT modify logic heavily)
  atoms/     → styled primitives (visual variants only)
  molecules/ → business-level components
  organisms/ → page sections (optional, minimal for now)

---

# 🧱 1. ATOMS (Visual Primitives Only)

Create atom wrappers for:

## Button Atom
- Base: shadcn Button
- Allowed variants (visual only):
  - default
  - secondary
  - ghost
  - outline
  - destructive
  - success

- Allowed sizes:
  - sm
  - md
  - lg

RULE:
- NO business logic inside atoms
- NO naming like "primaryCTA" or "deleteInvoice"
- Only styling + layout concerns

---

## Input Atom
Standardize:
- height 40px default
- consistent border radius
- focus ring using theme primary color
- error state support
- disabled opacity

---

## Badge Atom (if needed)
- status colors only:
  - default
  - success
  - warning
  - destructive

---

# 🟡 2. MOLECULES (Business Meaning Components)

Molecules are composed using atoms.

They MUST represent business actions or UI meaning.

---

## Create these molecules:

### PrimaryCTA
- uses Button atom
- always uses size "lg"
- variant "default"

### SecondaryCTA
- uses Button atom
- variant "secondary"

### MarkAsPaidButton
- uses Button atom
- variant "success"

### DeleteInvoiceButton
- uses Button atom
- variant "destructive"

### InvoiceStatusBadge
- uses Badge atom
- maps invoice status → UI state

---

RULES:
- Molecules MUST NOT expose raw styling props unnecessarily
- Molecules MUST represent intent (what it does, not how it looks)

---

# 🧠 3. DESIGN PRINCIPLES

- Atoms = visual system only
- Molecules = business meaning
- No duplicate abstraction layers
- No over-wrapping shadcn components

---

# 🎨 4. THEME CONSISTENCY RULES

All components must respect global theme:
- Tailwind tokens (primary, accent, destructive, muted)
- Light + dark mode support
- No hardcoded colors

---

# 🚫 CONSTRAINTS

- Do NOT introduce new UI libraries
- Do NOT use SCSS
- Do NOT create unnecessary abstraction layers
- Do NOT duplicate shadcn logic
- Keep system minimal and scalable

---

# 🧪 EXPECTED OUTCOME

After implementation:

- atoms/ contains reusable styled primitives
- molecules/ contains business-level UI components
- UI is consistent across invoice system
- Components are reusable without duplication
- Clean separation of:
  → styling (atoms)
  → meaning (molecules)

---

# 🧠 FINAL RULE

If unsure where a component belongs:
- If it answers “how does it look?” → ATOM
- If it answers “what does it do?” → MOLECULE