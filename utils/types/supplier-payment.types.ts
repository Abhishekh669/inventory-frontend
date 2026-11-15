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

// ---------- Supplier payments ----------

export interface SupplierPayment {
  id: string
  supplier_id: string
  amount: Decimal
  payment_date: string // ISO 8601
  payment_method: PaymentMethod
  payment_type: PaymentType
  reference_no: string | null
  note: string | null
  created_by: string | null
  created_at: string
}

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