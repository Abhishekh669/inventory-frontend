import Decimal from "decimal.js"
import { PurchaseOrderItemDetail } from "./purchase-order.types"

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



// ---------- purchase details page ----------

export interface PurchaseSupplier {
  id: string
  name: string
  contact_person: string | null
  phone: string | null
  address: string | null
  pan_no: string | null
  is_active: boolean
}

export interface PurchaseDetail {
  id: string
  supplier_id: string
  purchase_order_id: string | null
  supplier_bill_no: string
  purchase_date: string
  excise_duty: string
  special_discount: string
  discount: string
  vat_rate: string
  freight_charge: string
  gross_amount: string
  taxable_amount: string
  vat_amount: string
  total: string
  paid_amount: string
  returned_amount: string
  due_amount: string
  payment_status: PaymentStatus
  due_date: string | null
  status: PurchaseStatus
  note: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string
}

export interface PurchaseItemDetail {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  unit_name: string
  allow_decimal: boolean
  poi_id: string | null
  qty: string // quantity the supplier sent
  rate: string
  vat_amount: string
  unit_cost: string
  unit_cost_with_vat: string
  line_value: string // qty x rate
  qty_ordered: string | null // null for a product added to the purchase
  expected_unit_cost: string | null

  returned_qty: string
}

export interface PurchaseOrderInfo {
  id: string
  po_no: string
  title: string | null
  order_date: string
  expected_date: string | null
  status: PurchaseOrderStatus
  note: string | null
  created_by_name: string | null
  created_at: string
}

export interface PurchasePayment {
  id: string
  amount: string
  payment_date: string
  payment_method: PaymentMethod
  payment_type: "advance" | "regular"
  note: string | null
  created_by_name: string | null
  created_at: string
}

export interface PurchaseByIdResponse {
  supplier_data: PurchaseSupplier
  purchase_data: PurchaseDetail
  purchase_items: PurchaseItemDetail[]
  purchase_order_data: PurchaseOrderInfo | null
  purchase_order_items: PurchaseOrderItemDetail[]
  payments: PurchasePayment[]
  returns: PurchaseReturnDetail[]
}


export type PaymentSource = "regular" | "advance"


export interface PurchaseReturnItemDetail {
  id: string
  purchase_item_id: string
  product_id: string
  product_name: string
  product_sku: string
  unit_name: string
  allow_decimal: boolean
  qty: string
  amount: string
  reason: string | null
}


export interface PurchaseReturnDetail {
  id: string
  return_no: string
  return_date: string
  total: string
  note: string | null
  created_by_name: string | null
  created_at: string
  items: PurchaseReturnItemDetail[]
}



export type UpdatePurchaseItemInput = Omit<CreatePurchaseItemInput, "purchase_order_item_id">

export interface UpdatePurchaseInput {
  supplier_bill_no: string
  purchase_date: string
  due_date: string | null
  excise_duty: string
  special_discount: string
  discount: string
  vat_rate: string
  freight_charge: string
  note: string | null
  items: UpdatePurchaseItemInput[]
}

export interface CreatePurchaseReturnInput {
  return_date: string
  note: string | null
  items: { purchase_item_id: string; qty: string; amount: string; reason: string | null }[]
}

export interface CreatePurchasePaymentInput {
  amount: string
  payment_date: string
  source: PaymentSource
  payment_method: PaymentMethod
  note: string | null
}

export interface PurchaseActionResult {
  success: boolean
  message?: string
  error?: string
}



export interface UpdatePurchasePaymentInput {
  amount: string
  payment_date: string
  payment_method: PaymentMethod
  note: string | null
}