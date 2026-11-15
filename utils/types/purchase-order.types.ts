import type { Decimal, DecimalInput } from "./product.types"

export type PurchaseOrderStatus = "draft" | "sent" | "partial" | "received" | "cancelled"

export const PURCHASE_ORDER_STATUSES: PurchaseOrderStatus[] = [
  "draft",
  "sent",
  "partial",
  "received",
  "cancelled",
]


// ---------- Purchase orders by supplier ----------

export interface PurchaseOrderSummary {
  id: string
  po_no: string
  purchase_id : string | null
  title: string | null
  status: PurchaseOrderStatus
  note: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string // ISO 8601
}

export interface PurchaseOrderItemDetail {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  unit_name: string
  allow_decimal: boolean
  qty_ordered: Decimal
  qty_received: Decimal
  expected_unit_cost: Decimal | null
  line_total: Decimal | null
}


export interface PurchaseOrderFilterValues {
  status?: PurchaseOrderStatus
  search?: string // matches title or note
  from_date?: string
  to_date?: string
}

// Query params for GET /purchase-order-service/get-purchase-orders-by-supplier/:supplier_id
export interface GetPurchaseOrdersBySupplierParams extends PurchaseOrderFilterValues {
  supplier_id: string
  cursor?: string | null // opaque, comes from the previous page's next_cursor
  limit?: number // default 10, max 30
}


export interface PurchaseOrdersBySupplierResponse {
  purchase_orders: PurchaseOrderSummary[]
  total: number
  next_cursor: string | null
  has_more: boolean
}

export interface PurchaseOrderItemsResponse {
  items: PurchaseOrderItemDetail[]
}


// statuses a user can set by hand (partial and received come from receiving goods)
export type PurchaseOrderEditableStatus = "draft" | "sent" | "cancelled"

// ---------- Purchase orders by supplier ----------

export interface PurchaseOrderSummary {
  id: string
  po_no: string
  title: string | null
  status: PurchaseOrderStatus
  note: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string // ISO 8601
}

export interface PurchaseOrderItemDetail {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  unit_name: string
  allow_decimal: boolean
  qty_ordered: Decimal
  qty_received: Decimal
  expected_unit_cost: Decimal | null
  line_total: Decimal | null
}

export interface PurchaseOrderDetail {
  id: string
  po_no: string
  supplier_id: string
  title: string | null
  order_date: string // YYYY-MM-DD
  expected_date: string | null // YYYY-MM-DD
  status: PurchaseOrderStatus
  note: string | null
  created_by: string | null
  created_by_name: string | null
  created_at: string
  items: PurchaseOrderItemDetail[]
}

export interface PurchaseOrderFilterValues {
  status?: PurchaseOrderStatus
  from_date?: string // YYYY-MM-DD, created at
  to_date?: string // YYYY-MM-DD, created at, inclusive
}

// Query params for GET /purchase-order-service/get-purchase-orders-by-supplier/:supplier_id
export interface GetPurchaseOrdersBySupplierParams extends PurchaseOrderFilterValues {
  supplier_id: string
  cursor?: string | null // opaque, comes from the previous page's next_cursor
  limit?: number // default 10, max 30
}

export interface PurchaseOrdersBySupplierResponse {
  purchase_orders: PurchaseOrderSummary[]
  total: number
  next_cursor: string | null
  has_more: boolean
}

export interface PurchaseOrderItemsResponse {
  items: PurchaseOrderItemDetail[]
}

// ---------- Create / update / delete ----------

export interface PurchaseOrderItemRequestType {
  id?: string // set for an existing line when updating
  product_id: string
  qty_ordered: DecimalInput
  expected_unit_cost: DecimalInput | null
}

export interface PurchaseOrderRequestType {
  title: string | null
  order_date: string // YYYY-MM-DD
  expected_date: string | null
  status: PurchaseOrderEditableStatus
  note: string | null
  items: PurchaseOrderItemRequestType[]
}

export interface CreatePurchaseOrderRequestType extends PurchaseOrderRequestType {
  supplier_id: string
}

export interface UpdatePurchaseOrderRequestType extends PurchaseOrderRequestType {
  id: string
}

export interface DeletePurchaseOrdersRequestType {
  ids: string[]
}

export interface PurchaseOrderActionResult {
  success: boolean
  message?: string
  error?: string
  purchase_order?: PurchaseOrderDetail
}

