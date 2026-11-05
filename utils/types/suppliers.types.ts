// Decimal values come from Go (shopspring) as strings, e.g. "5000.00".
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  address: string | null;
  pan_no: string | null;
  opening_balance: string;
  balance: string; // amount we owe the supplier
  is_active: boolean;
  created_at: string;
}

export interface CreateSupplier {
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  pan_no?: string | null;
  opening_balance?: string;
}

// undefined = leave unchanged
export interface UpdateSupplier {
  id: string;
  name?: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  pan_no?: string | null;
  opening_balance?: string;
  is_active?: boolean;
}

export interface GetSuppliersParams {
  search?: string;
  active?: boolean;
}