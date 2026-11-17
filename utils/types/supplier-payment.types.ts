import type { DecimalInput, Decimal } from "./product.types"

export type PaymentMethod = "cash" | "bank" | "cheque" | "online"

export type PaymentType = "advance" | "regular"

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "bank", "cheque", "online"]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank: "Bank transfer",
  cheque: "Cheque",
  online: "Online payment",
}


export type SupplierLedgerEntryType =
  | "purchase"
  | "advance"
  | "payment"
  | "advance_allocation"
  | "return"


export interface PurchasePaymentAllocation {
  id: string
  supplier_payment_id: string
  purchase_id: string
  amount: Decimal
  created_at: string
}

// POST body for /supplier-payment-service/create-advance-payment
// (the payment date is set by the server, to today)
export interface CreateAdvancePaymentRequestType {
  supplier_id: string
  amount: DecimalInput
  payment_method: PaymentMethod
  note: string | null
}

export interface SupplierPaymentActionResult {
  success: boolean
  message?: string
  error?: string
}



export type SupplierPaymentStatus = "unallocated" | "partial" | "allocated"

export type SupplierPaymentFilterValues = {
  status?: SupplierPaymentStatus
  from_date?: string
  to_date?: string
}

export type GetSupplierPaymentsParams = SupplierPaymentFilterValues & {
  supplier_id: string
  cursor?: string | null
  limit?: number
}

// decimals arrive from the backend as strings
export type SupplierPaymentAllocation = {
  purchase_id: string
  supplier_bill_no: string
  purchase_date: string
  purchase_total: string
  allocated_amount: string
}

export type SupplierPayment = {
  id: string
  supplier_id: string
  amount: string
  payment_date: string
  payment_method: "cash" | "bank" | "cheque" | "online"
  payment_type: "advance" | "regular"
  note: string | null
  allocated_amount: string
  unallocated_amount: string
  allocations: SupplierPaymentAllocation[]
  created_by: string | null
  created_by_name: string | null
  created_at: string
}

export type SupplierFinancialSummary = {
  total_purchases: string
  total_payments: string
  total_returns: string
  unallocated_payments: string
  allocated_payments: string
  total_due: string
}

export type SupplierPaymentsResponse = {
  payments: SupplierPayment[]
  total: number
  has_more: boolean
  next_cursor: string | null
  summary: SupplierFinancialSummary
}


export type GetSupplierLedgerParams = {
  supplier_id: string
  cursor?: string | null
  limit?: number
  from_date?: string
  to_date?: string
}

// decimals arrive from the backend as strings
export type SupplierLedgerEntry = {
  id: string
  entry_type: SupplierLedgerEntryType
  entry_date: string
  reference: string | null
  description: string
  note: string | null
  amount: string
  balance: string // we owe the supplier after this line
  credit: string // advance the supplier holds for us after this line
  created_at: string
}

export type SupplierLedgerResponse = {
  supplier: { id: string; name: string; opening_balance: string }
  opening_balance: string
  opening_credit: string
  total_purchases: string
  total_payments: string
  total_advances: string
  total_returns: string
  closing_balance: string
  closing_credit: string
  entries: SupplierLedgerEntry[]
  total: number
  has_more: boolean
  next_cursor: string | null
}
export type SupplierLedgerFilterValues = {
  from_date?: string
  to_date?: string
}