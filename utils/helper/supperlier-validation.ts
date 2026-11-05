import { CreateSupplier } from "@/utils/types/suppliers.types";

export interface SupplierFormValues {
  name: string;
  contact_person: string;
  phone: string;
  pan_no: string;
  address: string;
  opening_balance: string;
}

export type SupplierErrors = Partial<Record<keyof SupplierFormValues, string>>;

export const PAN_LENGTH = 9;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;
const AMOUNT_REGEX = /^-?\d{1,12}(\.\d{1,2})?$/;

export const emptySupplier = (): SupplierFormValues => ({
  name: "",
  contact_person: "",
  phone: "",
  pan_no: "",
  address: "",
  opening_balance: "0",
});

export const hasErrors = (e: SupplierErrors) => Object.keys(e).length > 0;

export function validateSupplier(v: SupplierFormValues): SupplierErrors {
  const e: SupplierErrors = {};
  const name = v.name.trim();
  const phone = v.phone.trim();
  const pan = v.pan_no.trim();
  const amount = v.opening_balance.trim();

  if (!name) e.name = "Supplier name is required";
  else if (name.length < 2) e.name = "Name must be at least 2 characters";
  else if (name.length > 150) e.name = "Name must be 150 characters or less";

  if (v.contact_person.trim().length > 100) e.contact_person = "Maximum 100 characters";

  if (phone && !PHONE_REGEX.test(phone)) e.phone = "Enter a valid phone number (7-15 digits)";

  if (pan && !/^\d+$/.test(pan)) e.pan_no = "PAN must contain digits only";
  else if (pan && pan.length !== PAN_LENGTH) e.pan_no = `PAN must be exactly ${PAN_LENGTH} digits`;

  if (v.address.trim().length > 250) e.address = "Maximum 250 characters";

  if (amount && !AMOUNT_REGEX.test(amount)) e.opening_balance = "Enter a valid amount (max 2 decimals)";

  return e;
}

export const toCreatePayload = (v: SupplierFormValues): CreateSupplier => ({
  name: v.name.trim(),
  contact_person: v.contact_person.trim() || null,
  phone: v.phone.trim() || null,
  pan_no: v.pan_no.trim() || null,
  address: v.address.trim() || null,
  opening_balance: v.opening_balance.trim() || "0",
});