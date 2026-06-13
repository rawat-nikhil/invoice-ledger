export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
}

export type LedgerEntryType = "debit" | "credit";

export interface LedgerEntry {
  id: string;
  invoiceId?: string;
  description: string;
  amount: number;
  currency: string;
  type: LedgerEntryType;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserSession {
  token: string;
  expiresAt: string;
}

export type EmployeeCategory = "skilled" | "semi-skilled";
export type EmployeeGrade = "A" | "B" | "C";

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  category: EmployeeCategory;
  grade: EmployeeGrade;
  department: string;
  gradeRate: number;
  basicPay: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeInput {
  employeeCode: string;
  name: string;
  category: EmployeeCategory;
  grade: EmployeeGrade;
  department?: string;
  gradeRate: number;
  basicPay: number;
}

export type UpdateEmployeeInput = Omit<CreateEmployeeInput, "employeeCode">;
