export interface Setting {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    pan_no: string | null;
    vat_no: string | null;
    default_vat_rate: number;
    low_stock_default: number;
    bill_footer: string | null;
    created_at: string;
  }
  
  export interface UpdateSettingRequest {
    name: string;
    address: string | null;
    phone: string | null;
    pan_no: string | null;
    vat_no: string | null;
    default_vat_rate: number;
    low_stock_default: number;
    bill_footer: string | null;
  }


 export interface Unit {
  id: string
  name: string
  allow_decimal: boolean
}

export interface CreateUnit {
  name: string
  allow_decimal: boolean
}

export interface UpdateUnit {
  id: string
  name: string
  allow_decimal: boolean
}