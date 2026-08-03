Add 3 more pages to the invoice PDF, matching the "Pay Register" design (reference file: `Invoice Attachment - Pay Register.dc.html`, attached — a static HTML mockup). These become pages 2–4 of the generated invoice PDF, printed after the existing `apps/api/templates/invoice.html` page.

## Where this lives
- Template: `apps/api/templates/invoice.html` (currently a single page — the summary invoice).
- Renderer: `apps/api/src/utils/pdf-generator.ts` — `buildInvoiceHtml()` loads the template, does flat `{{key}}` string replacement (`replacePlaceholders`, no loop support today), then `renderPdfFromHtml()` prints it to PDF via Playwright (`page.pdf({ format: "A4", printBackground: true })`).
- Data: `Invoice.employeeBreakdown` (array, one entry per employee) and `Invoice.totals` (already typed in `apps/api/src/models/payroll-schemas.ts`).

## The 3 new pages
Reuse the exact header band, accent color (`oklch(0.55 0.15 250)`), zebra-striped tables, and total-row styling from `Invoice Attachment - Pay Register.dc.html`. Landscape orientation (the existing invoice page is portrait A4 — these 3 pages should render landscape; add `@page { size: landscape }` scoped to just these sections, or split the print call — see "Rendering" below).

**Page 2 — Employee Attendance & Wage Calculation**
Table columns ← `employeeBreakdown[]`: #, `employeeCode`, `employeeName`, `present`, `otHours`, `gradeDays`, `gradeRate`, `basicAmount`, `washingAllowanceAmount`, `adjustmentAllowanceAmount`. Bold TOTAL row summing each numeric column across all employees.

**Page 3 — Calculated Billing Details**
Table columns ← `employeeBreakdown[]`: `employeeName`, `basicAmount`, `washingAllowanceAmount`, `adjustmentAllowanceAmount`, `gradeAmount`, `otAmount`, `totalKr`, `pf`, `esi`, `canteenBill`, `payableAmount`. Bold TOTAL row.

**Page 4 — Final Bill Summary**
Left column, itemized rows from `Invoice.totals`: base billing amount (sum of `totalKr` across employees, or `totals.total` if that's the same figure — confirm against `invoices.ts` route), `totalPf`, `totalEsi`, `serviceCharge`, Subtotal (shaded), `cgst`, `sgst`, Grand Total = `totalPayable` (shaded, bold, accent border-top).
Right column: large accent-colored card, "Grand Total Payable" + `totals.totalPayable` in big type.

All currency via the existing `formatInr()` in `pdf-generator.ts` (Indian grouping, ₹ symbol) — don't introduce a new formatter.

## Rendering the employee rows
`replacePlaceholders` only does flat key→string swaps, so build each page's `<tbody>` HTML (rows + total row) as a string in `pdf-generator.ts` and inject it via a new placeholder each, e.g. `{{employeeAttendanceRows}}`, `{{billingDetailRows}}`, `{{finalBillRows}}` — same pattern already used for every other value, just pre-render the loop server-side before calling `replacePlaceholders`.

## Multi-page / mixed orientation PDF
Since page 1 is portrait and pages 2–4 are landscape, either:
(a) generate two separate Playwright PDFs (portrait page 1, landscape pages 2-4) and merge them into one PDF buffer (e.g. with `pdf-lib`), or
(b) keep everything portrait if mixed orientation in one Playwright PDF proves unreliable — flag this trade-off back to the user before committing to one approach.
Use `break-before: page` (not old `page-break-before`) between the 3 new page sections so each starts on a fresh sheet.

## Data check before building
Confirm whether `totals.total` already equals `sum(employeeBreakdown[].totalKr)` — read `apps/api/src/routes/invoices.ts` to see how `totals` is computed, so page 4's "base billing amount" row sources the right field instead of re-deriving it.
