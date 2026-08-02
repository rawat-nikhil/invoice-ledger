export type ComplianceStatus = "pending" | "paid" | "not-generated";

export interface ComplianceItem {
  amount: number;
  status: ComplianceStatus;
}

export interface EmployeeInvoiceInput {
  employeeId: string;
  present: number;
  otHours: number;
  gradeDays: number;
  canteenBill: number;
}

export interface EmployeePayrollBreakdown extends EmployeeInvoiceInput {
  adjustmentAllowance: number;
  washingAllowance: number;
  employeeName: string;
  employeeCode: string;
  basicPay: number;
  gradeRate: number;
  basicAmount: number;
  washingAllowanceAmount: number;
  adjustmentAllowanceAmount: number;
  gradeAmount: number;
  otAmount: number;
  totalKr: number;
  pf: number;
  esi: number;
  payableAmount: number;
}

export interface InvoiceTotals {
  totalPf: number;
  totalEsi: number;
  serviceCharge: number;
  total: number;
  sgst: number;
  cgst: number;
  totalPayable: number;
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
  invoiceDate?: string;
  totals?: InvoiceTotals;
  employeeBreakdown?: EmployeePayrollBreakdown[];
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

export interface GenerateInvoiceInput {
  invoiceDate: string;
  employeeInputs: EmployeeInvoiceInput[];
}

export interface SalarySlip extends EmployeePayrollBreakdown {
  id: string;
  employeeId: string;
  invoiceId: string;
  monthYear: string;
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

export type EmployeeCategory = typeof EmployeeCategoryEnum[keyof typeof EmployeeCategoryEnum];
export enum EmployeeCategoryEnum {
  SKILLED = "skilled",
  SEMI_SKILLED = "semi-skilled",
  UNSKILLED = "un-skilled",
}
export type EmployeeGrade = typeof EmployeeGradeEnum[keyof typeof EmployeeGradeEnum];
export enum EmployeeGradeEnum {
  A = "A",
  B = "B",
  C = "C",
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  category: EmployeeCategory;
  grade: EmployeeGrade;
  department: string;
  gradeRate: number;
  basicPay: number;
  adjustmentAllowance: number;
  washingAllowance: number;
  isActive: boolean;
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
  adjustmentAllowance: number;
  washingAllowance: number;
}

export type UpdateEmployeeInput = Omit<CreateEmployeeInput, "employeeCode">;

export interface UpdateEmployeeStatusInput {
  isActive: boolean;
}
