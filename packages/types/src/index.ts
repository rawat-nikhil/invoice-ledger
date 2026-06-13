export type ComplianceStatus = "pending" | "paid" | "not-generated";

export interface ComplianceItem {
  amount: number;
  status: ComplianceStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  monthYear: string;
  totalBill: number;
  serviceCharge: number;
  gst: ComplianceItem;
  esic: ComplianceItem;
  settled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  invoiceNumber: string;
  monthYear: string;
  totalBill: number;
  serviceCharge: number;
  gst: ComplianceItem;
  esic: ComplianceItem;
  settled: boolean;
}

export type UpdateInvoiceInput = Omit<CreateInvoiceInput, "invoiceNumber">;

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
