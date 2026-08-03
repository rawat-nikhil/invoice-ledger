import type { SalarySlip } from "@repo/types";

import { ApiError, apiFetch } from "../api";
import { getToken } from "../auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getSalarySlips(monthYear: string): Promise<SalarySlip[]> {
  const params = new URLSearchParams({ monthYear });
  return apiFetch<SalarySlip[]>(`/salary-slips?${params.toString()}`);
}

function parseFilename(
  contentDisposition: string | null,
  fallback: string,
): string {
  if (!contentDisposition) {
    return fallback;
  }

  const match = contentDisposition.match(/filename="?([^";\n]+)"?/i);
  return match?.[1] ?? fallback;
}

async function downloadBlobResponse(
  response: Response,
  fallbackFilename: string,
  defaultErrorMessage: string,
): Promise<void> {
  if (!response.ok) {
    let message = defaultErrorMessage;

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
  const filename = parseFilename(
    response.headers.get("Content-Disposition"),
    fallbackFilename,
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function downloadSalarySlip(id: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/salary-slips/${id}/download`, {
    headers,
  });

  await downloadBlobResponse(response, "salary-slip.pdf", "Failed to download salary slip");
}

export async function downloadSalarySlipsZip(monthYear: string): Promise<void> {
  const token = getToken();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const params = new URLSearchParams({ monthYear });
  const response = await fetch(
    `${API_BASE_URL}/salary-slips/download?${params.toString()}`,
    { headers },
  );

  await downloadBlobResponse(
    response,
    "salary-slips.zip",
    "Failed to download salary slips",
  );
}
