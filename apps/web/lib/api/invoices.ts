import type {
  CreateInvoiceInput,
  GenerateInvoiceInput,
  Invoice,
  UpdateInvoiceInput,
} from "@repo/types";

import { ApiError, apiFetch } from "../api";
import { getToken } from "../auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getInvoices(): Promise<Invoice[]> {
  return apiFetch<Invoice[]>("/invoices");
}

export async function generateInvoice(
  data: GenerateInvoiceInput,
): Promise<Invoice> {
  return apiFetch<Invoice>("/invoices/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createInvoice(
  data: CreateInvoiceInput,
): Promise<Invoice> {
  return apiFetch<Invoice>("/invoices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInvoice(
  id: string,
  data: UpdateInvoiceInput,
): Promise<Invoice> {
  return apiFetch<Invoice>(`/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  return apiFetch<void>(`/invoices/${id}`, {
    method: "DELETE",
  });
}

function parseFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return "invoice.pdf";
  }

  const match = contentDisposition.match(/filename="?([^";\n]+)"?/i);
  return match?.[1] ?? "invoice.pdf";
}

export async function downloadInvoice(id: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/invoices/${id}/download`, {
    headers,
  });

  if (!response.ok) {
    let message = "Failed to download invoice";

    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // ignore JSON parse errors
    }

    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const filename = parseFilename(response.headers.get("Content-Disposition"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
