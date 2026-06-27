import type { ClientSession } from "mongoose";
import { InvoiceModel } from "../models/invoice";

const INVOICE_NUMBER_PREFIX = "INV-";

export async function getNextInvoiceNumber(
  session?: ClientSession,
): Promise<string> {
  const latest = await InvoiceModel.findOne(
    { invoiceNumber: { $regex: /^INV-\d+$/ } },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 }, session },
  );

  if (!latest?.invoiceNumber) {
    return `${INVOICE_NUMBER_PREFIX}001`;
  }

  const match = latest.invoiceNumber.match(/^INV-(\d+)$/);
  const current = match ? Number.parseInt(match[1], 10) : 0;
  const next = current + 1;

  return `${INVOICE_NUMBER_PREFIX}${String(next).padStart(3, "0")}`;
}
