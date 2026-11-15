import Decimal from "decimal.js"

export type PurchaseOrderStatus = "draft" | "sent" | "partial" | "received" | "cancelled"
export type PurchaseStatus = "draft" | "posted" | "cancelled"
export type PaymentStatus = "unpaid" | "partial" | "paid"
export type PaymentMethod = "cash" | "bank" | "cheque" | "online"

export interface PurchaseOrderData {
  purchase_order_id: string
  purchase_order_number: string
  supplier_id: string
  supplier_name: string
  purchase_order_by_name: string | null
  purchase_ordered_at: string
  purchase_order_status: PurchaseOrderStatus
  purchase_order_title: string | null
}

export interface PurchaseData {
  purchase_id: string
  supplier_bill_no: string
  purchase_date: string
  total: string
  paid_amount: string
  returned_amount: string
  due_amount: string
  purchase_status: PurchaseStatus
  payment_status: PaymentStatus
  purchase_created_at: string
  purchase_note: string | null
}

export interface PurchaseListItem {
  purchase_order_data: PurchaseOrderData
  purchase_data: PurchaseData | null
}

export interface GetAllPurchasesResponse {
  items: PurchaseListItem[]
  total: number
  next_cursor: string | null
  has_more: boolean
}

export interface PurchaseListFilterValues {
  purchase_order_status?: PurchaseOrderStatus
  po_number?: string
  purchase_status?: PurchaseStatus
  payment_status?: PaymentStatus
  search?: string
  from_date?: string
  to_date?: string
}

export interface GetAllPurchasesParams extends PurchaseListFilterValues {
  limit?: number
  cursor?: string | null
}

export interface PurchaseOrderForCreatePurchase {
  purchase_order_id: string
  purchase_order_status: PurchaseOrderStatus
  purchase_order_title: string
  purchase_order_note: string
  purchase_order_ordered_date: string
  purchase_order_number: string
}

// ---------- create purchase (from a purchase order) ----------

// one line sent to the server
export interface CreatePurchaseItemInput {
  purchase_order_item_id: string | null // null = product added in the dialog
  product_id: string
  qty: string // quantity the supplier actually sent
  rate: string
}

export interface CreatePurchaseInput {
  purchase_order_id: string
  supplier_bill_no: string
  purchase_date: string // YYYY-MM-DD
  due_date: string | null
  excise_duty: string
  special_discount: string
  discount: string
  vat_rate: string
  freight_charge: string
  paid_amount: string
  payment_method: PaymentMethod
  note: string | null
  items: CreatePurchaseItemInput[]
}

export interface CreatePurchaseResult {
  success: boolean
  message?: string
  error?: string
  purchase_id?: string
}

// one editable row in the create purchase dialog
export interface PurchaseFormRow {
  key: string
  poiId: string | null // null = product added in the dialog
  productId: string
  name: string
  sku: string
  unit: string
  allowDecimal: boolean
  ordered: Decimal | null // quantity ordered from the supplier (null for an added product)
  expected: Decimal | null // PO expected cost, or the product's current cost for an added product
  isNew: boolean
  qty: string // quantity the supplier sent
  rate: string
}