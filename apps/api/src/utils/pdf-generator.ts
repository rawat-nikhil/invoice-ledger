import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Browser } from "playwright";
import type {
  BusinessProfile,
  Client,
  EmployeePayrollBreakdown,
  Invoice,
  InvoiceTotals,
  SalarySlip,
} from "@repo/types";

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

function rowBg(index: number): string {
  return index % 2 === 0 ? "white" : "oklch(0.98 0.003 250)";
}

function buildEmployeeAttendanceRows(
  employeeBreakdown: EmployeePayrollBreakdown[],
): string {
  const rows = employeeBreakdown
    .map(
      (row, index) => `<tr style="background:${rowBg(index)};">
        <td>${index + 1}</td>
        <td>${row.employeeCode}</td>
        <td>${row.employeeName}</td>
        <td>${row.present}</td>
        <td>${row.otHours}</td>
        <td>${row.gradeDays}</td>
        <td>${row.gradeRate}</td>
        <td>${formatInr(row.basicAmount)}</td>
        <td>${formatInr(row.washingAllowanceAmount)}</td>
        <td>${formatInr(row.adjustmentAllowanceAmount)}</td>
      </tr>`,
    )
    .join("");

  const sum = (key: keyof EmployeePayrollBreakdown) =>
    employeeBreakdown.reduce((total, row) => total + Number(row[key]), 0);

  const totalRow = `<tr class="pr-total-row">
    <td colspan="3">TOTAL</td>
    <td>${sum("present")}</td>
    <td>${sum("otHours")}</td>
    <td>${sum("gradeDays")}</td>
    <td>${sum("gradeRate")}</td>
    <td>${formatInr(sum("basicAmount"))}</td>
    <td>${formatInr(sum("washingAllowanceAmount"))}</td>
    <td>${formatInr(sum("adjustmentAllowanceAmount"))}</td>
  </tr>`;

  return rows + totalRow;
}

function buildBillingDetailRows(
  employeeBreakdown: EmployeePayrollBreakdown[],
): string {
  const rows = employeeBreakdown
    .map(
      (row, index) => `<tr style="background:${rowBg(index)};">
        <td style="text-align:left;">${row.employeeName}</td>
        <td>${formatInr(row.basicAmount)}</td>
        <td>${formatInr(row.washingAllowanceAmount)}</td>
        <td>${formatInr(row.adjustmentAllowanceAmount)}</td>
        <td>${formatInr(row.gradeAmount)}</td>
        <td>${formatInr(row.otAmount)}</td>
        <td>${formatInr(row.totalKr)}</td>
        <td>${formatInr(row.pf)}</td>
        <td>${formatInr(row.esi)}</td>
        <td>${formatInr(row.canteenBill)}</td>
        <td style="font-weight:600;">${formatInr(row.payableAmount)}</td>
      </tr>`,
    )
    .join("");

  const sum = (key: keyof EmployeePayrollBreakdown) =>
    employeeBreakdown.reduce((total, row) => total + Number(row[key]), 0);

  const totalRow = `<tr class="pr-total-row">
    <td style="text-align:left;">TOTAL</td>
    <td>${formatInr(sum("basicAmount"))}</td>
    <td>${formatInr(sum("washingAllowanceAmount"))}</td>
    <td>${formatInr(sum("adjustmentAllowanceAmount"))}</td>
    <td>${formatInr(sum("gradeAmount"))}</td>
    <td>${formatInr(sum("otAmount"))}</td>
    <td>${formatInr(sum("totalKr"))}</td>
    <td>${formatInr(sum("pf"))}</td>
    <td>${formatInr(sum("esi"))}</td>
    <td>${formatInr(sum("canteenBill"))}</td>
    <td>${formatInr(sum("payableAmount"))}</td>
  </tr>`;

  return rows + totalRow;
}

function buildFinalBillRows(totals: InvoiceTotals, subtotal: number): string {
  const rows: {
    label: string;
    amount: string;
    bold?: boolean;
    shaded?: boolean;
  }[] = [
    {
      label: "Base billing amount (wages, allowances, OT)",
      amount: formatInr(subtotal),
    },
    { label: "PF", amount: formatInr(totals.totalPf) },
    { label: "ESI", amount: formatInr(totals.totalEsi) },
    { label: "Service charge", amount: formatInr(totals.serviceCharge) },
    {
      label: "Subtotal",
      amount: formatInr(totals.total),
      bold: true,
      shaded: true,
    },
    { label: "CGST", amount: formatInr(totals.cgst) },
    { label: "SGST", amount: formatInr(totals.sgst) },
    {
      label: "Grand Total",
      amount: formatInr(totals.totalPayable),
      bold: true,
      shaded: true,
    },
  ];

  return rows
    .map((row, index) => {
      const isLast = index === rows.length - 1;
      const borderTop =
        index === 0 ? "none" : "1px solid oklch(0.92 0.005 250)";
      const style = [
        `background:${row.shaded ? "oklch(0.97 0.008 250)" : "white"}`,
        `font-weight:${row.bold ? 700 : 400}`,
        `border-top:${isLast ? "2px solid oklch(0.55 0.15 250)" : borderTop}`,
      ].join(";");

      return `<div class="pr-final-row" style="${style};">
        <span>${row.label}</span>
        <span>${row.amount}</span>
      </div>`;
    })
    .join("");
}

function formatStatus(status: string): string {
  if (status === "not-generated") {
    return "Not Generated";
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getTemplatePath(): string {
  return join(process.cwd(), "templates", "invoice.html");
}

function getSalarySlipTemplatePath(): string {
  return join(process.cwd(), "templates", "salary-slip.html");
}

function replacePlaceholders(
  template: string,
  replacements: Record<string, string>,
): string {
  return Object.entries(replacements).reduce(
    (html, [key, value]) =>
      html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value),
    template,
  );
}

function formatInvoiceDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getIndianFinancialYear(month: number, year: number): string {
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

function getIndianFinancialYearFromIsoDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (match) {
    return getIndianFinancialYear(Number(match[2]), Number(match[1]));
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getIndianFinancialYear(date.getMonth() + 1, date.getFullYear());
}

function getIndianFinancialYearFromMonthYear(monthYear: string): string {
  const date = new Date(`1 ${monthYear.replace("-", " ")}`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return getIndianFinancialYear(date.getMonth() + 1, date.getFullYear());
}

function resolveInvoiceFinancialYear(invoice: Invoice): string {
  if (invoice.invoiceDate) {
    return getIndianFinancialYearFromIsoDate(invoice.invoiceDate);
  }

  return getIndianFinancialYearFromMonthYear(invoice.monthYear);
}

function buildLegacyInvoiceHtml(invoice: Invoice): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1a1a1a;
      padding: 48px;
      font-size: 14px;
      line-height: 1.5;
    }
    h1 { font-size: 24px; font-weight: 600; margin-bottom: 4px; }
    .subtitle { color: #666; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { font-weight: 600; background: #f9f9f9; width: 40%; }
    td { font-weight: 400; }
    .settled-yes { color: #16a34a; font-weight: 600; }
    .settled-no { color: #dc2626; font-weight: 600; }
    .footer { margin-top: 48px; color: #999; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <h1>Invoice</h1>
  <p class="subtitle">${invoice.invoiceNumber} · ${invoice.monthYear}</p>
  <table>
    <tr><th>Invoice Number</th><td>${invoice.invoiceNumber}</td></tr>
    <tr><th>Month-Year</th><td>${invoice.monthYear}</td></tr>
    <tr><th>Total Bill</th><td>${formatInr(invoice.totalBill)}</td></tr>
    <tr><th>Service Charge</th><td>${formatInr(invoice.serviceCharge)}</td></tr>
    <tr><th>GST Amount</th><td>${formatInr(invoice.gst.amount)}</td></tr>
    <tr><th>GST Status</th><td>${formatStatus(invoice.gst.status)}</td></tr>
    <tr><th>ESIC Amount</th><td>${formatInr(invoice.esic.amount)}</td></tr>
    <tr><th>ESIC Status</th><td>${formatStatus(invoice.esic.status)}</td></tr>
    <tr>
      <th>Settled</th>
      <td class="${invoice.settled ? "settled-yes" : "settled-no"}">
        ${invoice.settled ? "Yes" : "No"}
      </td>
    </tr>
  </table>
  <p class="footer">Generated by Invoice Ledger</p>
</body>
</html>`;
}

function buildInvoiceHtml(
  invoice: Invoice,
  business: BusinessProfile,
  client: Client,
): string {
  if (!invoice.totals || !invoice.employeeBreakdown?.length) {
    return buildLegacyInvoiceHtml(invoice);
  }

  const template = readFileSync(getTemplatePath(), "utf-8");
  const { totals, employeeBreakdown } = invoice;
  const subtotal = employeeBreakdown.reduce((sum, row) => sum + row.totalKr, 0);

  return replacePlaceholders(template, {
    invoiceNumber: invoice.invoiceNumber,
    financialYear: resolveInvoiceFinancialYear(invoice),
    invoiceDate: invoice.invoiceDate
      ? formatInvoiceDate(invoice.invoiceDate)
      : invoice.monthYear,
    monthYear: invoice.monthYear,
    employeeCount: String(employeeBreakdown.length),
    employeeAttendanceRows: buildEmployeeAttendanceRows(employeeBreakdown),
    billingDetailRows: buildBillingDetailRows(employeeBreakdown),
    finalBillRows: buildFinalBillRows(totals, subtotal),
    subtotal: formatInr(subtotal),
    totalPf: formatInr(totals.totalPf),
    totalEsi: formatInr(totals.totalEsi),
    serviceCharge: formatInr(totals.serviceCharge),
    sgst: formatInr(totals.sgst),
    cgst: formatInr(totals.cgst),
    totalPayable: formatInr(totals.totalPayable),
    businessName: business.name,
    businessGstin: business.gstin,
    businessLine1: business.line1,
    businessLine2: business.line2,
    businessCityStateCountry: `${business.city}, ${business.state}, ${business.country}`,
    businessPincode: business.pincode,
    businessEmail: business.email,
    businessPhone: business.phone,
    businessHsnCode: business.hsnCode,
    businessPanNumber: business.panNumber,
    clientName: client.name,
    clientGstin: client.gstin,
    clientLine1: client.line1,
    clientLine2: client.line2,
    clientCityStatePincode: `${client.city}, ${client.state}, ${client.pincode}`,
  });
}

export async function generateInvoicePDF(
  invoice: Invoice,
  business: BusinessProfile,
  client: Client,
): Promise<Buffer> {
  const html = buildInvoiceHtml(invoice, business, client);
  return renderPdfFromHtml(html);
}

function buildSalarySlipHtml(
  slip: SalarySlip,
  business: BusinessProfile,
): string {
  const template = readFileSync(getSalarySlipTemplatePath(), "utf-8");

  return replacePlaceholders(template, {
    employeeCode: slip.employeeCode,
    employeeName: slip.employeeName,
    monthYear: slip.monthYear,
    basicAmount: formatInr(slip.basicAmount),
    adjustmentAllowanceAmount: formatInr(slip.adjustmentAllowanceAmount),
    washingAllowanceAmount: formatInr(slip.washingAllowanceAmount),
    otAmount: formatInr(slip.otAmount),
    gradeAmount: formatInr(slip.gradeAmount),
    pf: formatInr(slip.pf),
    esi: formatInr(slip.esi),
    payableAmount: formatInr(slip.payableAmount),
    businessName: business.name,
    businessGstin: business.gstin,
    businessPanNumber: business.panNumber,
    businessHsnCode: business.hsnCode,
    businessEmail: business.email,
    businessPhone: business.phone,
    businessLine1: business.line1,
    businessLine2: business.line2,
    businessCityStatePincode: `${business.city}, ${business.state} - ${business.pincode}`,
  });
}

function getSalarySlipFilename(slip: SalarySlip): string {
  return `salary-slip-${slip.employeeCode}-${slip.monthYear}.pdf`;
}

export async function generateSalarySlipPDF(
  slip: SalarySlip,
  business: BusinessProfile,
): Promise<Buffer> {
  const html = buildSalarySlipHtml(slip, business);
  return renderPdfFromHtml(html);
}

export async function generateSalarySlipPDFs(
  slips: SalarySlip[],
  business: BusinessProfile,
): Promise<{ filename: string; buffer: Buffer }[]> {
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  
  try {
    const results: { filename: string; buffer: Buffer }[] = [];

    for (const slip of slips) {
      const html = buildSalarySlipHtml(slip, business);
      const buffer = await renderPdfFromHtmlWithBrowser(browser, html);
      results.push({
        filename: getSalarySlipFilename(slip),
        buffer,
      });
    }

    return results;
  } finally {
    await browser.close();
  }
}

async function renderPdfFromHtmlWithBrowser(
  browser: Browser,
  html: string,
): Promise<Buffer> {
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

async function renderPdfFromHtml(html: string): Promise<Buffer> {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

  const browser = await chromium.launch(
    executablePath ? { executablePath } : undefined,
  );

  try {
    return await renderPdfFromHtmlWithBrowser(browser, html);
  } finally {
    await browser.close();
  }
}
