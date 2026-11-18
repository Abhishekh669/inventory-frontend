// NEW FILE: utils/types/stock-movement.types.ts

export type StockMovementType =
  | "opening"
  | "purchase"
  | "sale"
  | "purchase_return"
  | "sale_return"
  | "adjustment"

export interface StockMovementItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  type: StockMovementType
  qty_change: string
  balance_after: string
  ref_type: string | null
  ref_id: string | null
  note: string | null
  user_id: string | null
  user_name: string | null
  movement_date: string // YYYY-MM-DD
  created_at: string
}

// what the filter bar holds; product_id is sent to the server, the name is only for the UI
export interface StockMovementFilterValues {
  product_id?: string
  type?: StockMovementType
  from_date?: string
  to_date?: string
}

export interface GetStockMovementsParams extends StockMovementFilterValues {
  limit?: number
  cursor?: string | null
}

export interface GetStockMovementsResponse {
  items: StockMovementItem[]
  total: number
  next_cursor: string | null
  has_more: boolean
}