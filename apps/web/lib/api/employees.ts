import type {
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from "@repo/types";

import { apiFetch } from "../api";

export type GetEmployeesParams = {
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  status?: "active" | "inactive" | "all";
};

export async function getEmployees(
  params: GetEmployeesParams = {},
): Promise<Employee[]> {
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

  const query = searchParams.toString();
  const path = query ? `/employees?${query}` : "/employees";

  return apiFetch<Employee[]>(path);
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
