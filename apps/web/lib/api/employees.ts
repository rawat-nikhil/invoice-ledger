import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from "@repo/types";

import { ApiError, apiFetch } from "../api";
import { getToken } from "../auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type GetEmployeesParams = {
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: "active" | "inactive" | "all";
};

function toEmployeeQuery(params: GetEmployeesParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.order) {
    searchParams.set("order", params.order);
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }

  return searchParams.toString();
}

export async function getEmployees(
  params: GetEmployeesParams = {},
): Promise<Employee[]> {
  const query = toEmployeeQuery(params);
  const path = query ? `/employees?${query}` : "/employees";

  return apiFetch<Employee[]>(path);
}

export async function fetchEmployeeListDocument(
  params: GetEmployeesParams = {},
): Promise<string> {
  const query = toEmployeeQuery(params);
  const path = query ? `/employees/export?${query}` : "/employees/export";
  const headers = new Headers();
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (!response.ok) {
    let message = "Failed to export employees";

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

  return response.text();
}

export async function createEmployee(
  data: CreateEmployeeInput,
): Promise<Employee> {
  return apiFetch<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(
  id: string,
  data: UpdateEmployeeInput,
): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateEmployeeStatus(
  id: string,
  isActive: boolean,
): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
