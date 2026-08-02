You are working in a monorepo:

apps/web → Next.js (App Router + shadcn)
apps/api → Express + MongoDB

We are building the **Salary Slip Listing Module**.

---

# 🧱 STEP 1 — DATA SOURCE

Salary slips are already stored during invoice generation.

Each record includes:

- employeeCode
- employeeName
- basicAmount
- adjustmentAllowanceAmount
- washingAllowanceAmount
- otAmount
- gradeAmount
- pf
- esi
- payableAmount
- invoiceMonthYear (IMPORTANT for filtering)

---

# ⚙️ STEP 2 — BACKEND API

Create:

GET /salary-slips

Query params:
- monthYear (required)

Example:
GET /salary-slips?monthYear=Jan-2026

Response:
- list of salary slips for that month

---

# 🌐 STEP 3 — FRONTEND PAGE

Create route:

app/(protected)/salary-slip/page.tsx

---

# 📅 STEP 4 — MONTH/YEAR SELECTOR

Instead of full calendar:

Use:
- Dropdown for Month
- Dropdown for Year

OR
- shadcn Select component

---

## Behavior:

- Initially no table visible
- Once monthYear selected → fetch salary slips
- Show table

---

# 📊 STEP 5 — TABLE UI

Reuse existing table system (from employee + invoice)

---

## Columns:

1. Employee Code
2. Employee Name

---

## CREDIT SECTION (Earnings):

- Basic Pay
- Adjustment Allowance
- Washing Allowance
- OT Amount
- Grade Amount

---

## DEDUCTIONS:

- PF
- ESI

---

## FINAL:

- Total Payable

---

# 🧠 TABLE STRUCTURE (IMPORTANT)

Group columns visually:

| Employee | CREDIT | DEDUCTIONS | FINAL |

Use:
- section headers
- subtle column grouping
- consistent spacing

---

# 🎨 UI RULES

- credits → normal text
- deductions → red tone
- payable → bold / highlight

---

# 📄 STEP 6 — SALARY SLIP HTML TEMPLATE

Create file:

apps/api/templates/salary-slip.html

---

## TEMPLATE STRUCTURE

### HEADER:

- Company Name (dummy: "R.S Engineering Pvt Ltd")
- Address (dummy text)
- Title: "Salary Slip"

---

### EMPLOYEE INFO:

- Employee Code
- Employee Name
- Month-Year

---

### TABLE:

## Earnings:

- Basic Pay
- Adjustment Allowance
- Washing Allowance
- OT Amount
- Grade Amount

---

## Deductions:

- PF
- ESI

---

## TOTAL:

- Net Payable

---

### FOOTER:

- Employer Signature (right aligned)
- Placeholder text:
  "Authorized Signatory"

---

# ⚙️ STEP 7 — PLAYWRIGHT INTEGRATION

Create utility:

generateSalarySlipPDF(slipData)

- Load HTML template
- Inject dynamic values
- Generate PDF
- Return buffer

---

# 🌐 STEP 8 — DOWNLOAD API

Create endpoint:

GET /salary-slips/:id/download

- Fetch salary slip
- Generate PDF via Playwright
- Return file

---

# 🎛️ STEP 9 — FRONTEND DOWNLOAD

In table:

- Add download icon per row
- On click:
  - call API
  - trigger PDF download

---

# 🚫 CONSTRAINTS

- Reuse existing table system
- No new UI libraries
- Keep UI clean and minimal
- No SCSS
- No over-engineering grouping UI

---

# 📦 STEP 10 — EXPECTED OUTCOME

After implementation:

- Month/year filter works
- Salary slips fetched correctly
- Table displays grouped data
- Credit vs deduction visually separated
- PDF template generated correctly
- Download works per employee
- UI consistent with rest of app

---

# 🧠 FINAL RULE

This is part of payroll system.

Ensure:
- calculations already stored are used (no recalculation here)
- UI is readable and structured
- template is editable for future changes