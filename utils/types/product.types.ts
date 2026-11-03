
export type Decimal = string;
export type DecimalInput = string | number;

// ---------- Products ----------

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  unit_id: string;
  vat_rate: Decimal;
  cost_price: Decimal;
  cost_with_vat: Decimal;
  margin_percent: Decimal;
  selling_price: Decimal;
  profit_per_unit: Decimal;
  re_order_level: Decimal;
  current_stock: Decimal;
  is_active: boolean;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface ProductsListType {
  id: string;
  sku: string;
  name: string;

  category_id: string;
  category_name: string;
  category_slug: string;

  unit_id: string;
  unit_name: string;
  allow_decimal: boolean;

  vat_rate: Decimal;
  cost_price: Decimal;
  cost_with_vat: Decimal;

  margin_percent: Decimal;
  selling_price: Decimal;
  profit_per_unit: Decimal;

  re_order_level: Decimal;
  current_stock: Decimal;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequestType {
  sku: string;
  name: string;
  category_id: string;
  unit_id: string;
  vat_rate: DecimalInput;
  cost_price: DecimalInput;
  cost_with_vat: DecimalInput;
  margin_percent: DecimalInput;
  selling_price: DecimalInput;
  re_order_level: DecimalInput;
  current_stock: DecimalInput;
  is_active: boolean;
}

// POST body for create is an array
export type CreateProductsRequest = CreateProductRequestType[];

export interface UpdateProductRequestType extends CreateProductRequestType {
  id: string;
}

export interface DeleteProductRequestType {
  ids: string[];
}

// Query params for GET /product-service/get-products
export interface GetProductsParams {
  page?: number; // default 0
  limit?: number; // default 20, max 30
  from_date?: string; // YYYY-MM-DD or RFC3339
  to_date?: string; // YYYY-MM-DD or RFC3339
  name?: string;
  current_stock?: number;
  greater_than?: boolean;
}

export interface ProductsListTypeResponse {
  products: ProductsListType[];
  total: number;
  has_more: boolean;
  next_offset: number; // actually the next page number
}

// ---------- Product price history ----------

export interface ProductPriceHistory {
  id: string;
  product_id: string;
  purchase_item_id: string | null;
  unit_cost: Decimal;
  unit_cost_with_vat: Decimal;
  margin_percent: Decimal;
  selling_price: Decimal;
  profit_per_unit: Decimal;
  effective_date: string; // date, ISO 8601
  created_at: string;
}

export interface ProductPriceHistoryListType {
  id: string;
  product_id: string;
  product_sku: string;
  product_name: string;
  purchase_item_id: string | null;
  unit_cost: Decimal;
  unit_cost_with_vat: Decimal;
  margin_percent: Decimal;
  selling_price: Decimal;
  profit_per_unit: Decimal;
  effective_date: string;
  created_at: string;
}

export interface CreateProductPriceHistoryRequestType {
  product_id: string;
  purchase_item_id?: string | null;
  unit_cost: DecimalInput;
  unit_cost_with_vat: DecimalInput;
  margin_percent: DecimalInput;
  selling_price: DecimalInput;
  effective_date?: string | null; // omitted or null -> DB default (today)
}

export interface DeleteProductPriceHistoryRequestType {
  ids: string[];
}

export interface ProductPriceHistoryQueryType {
  product_id?: string | null;
  limit?: number;
  page?: number;
  from_date?: string | null;
  to_date?: string | null;
}

export interface ProductPriceHistoryListTypeResponse {
  history: ProductPriceHistoryListType[];
  total: number;
  has_more: boolean;
  next_offset: number;
}