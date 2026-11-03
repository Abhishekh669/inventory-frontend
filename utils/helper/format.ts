import Decimal from "decimal.js"
import { format } from "date-fns"

export const toDecimal = (v: string | number | null | undefined): Decimal => {
  try {
    return new Decimal(v ?? 0)
  } catch {
    return new Decimal(0)
  }
}

// "Rs 12,500.50" with Indian digit grouping (lakh / crore)
export function formatMoney(v: string | number | null | undefined) {
  const fixed = toDecimal(v).toFixed(2)
  const negative = fixed.startsWith("-")
  const [intPart, frac] = (negative ? fixed.slice(1) : fixed).split(".")

  const last3 = intPart.slice(-3)
  const rest = intPart.slice(0, -3)
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${last3}` : last3

  return `Rs ${negative ? "-" : ""}${grouped}.${frac}`
}

// whole numbers for units that don't allow decimals, up to 3 places otherwise
export function formatQuantity(v: string | number | null | undefined, allowDecimal: boolean) {
  return toDecimal(v)
    .toDecimalPlaces(allowDecimal ? 3 : 0)
    .toFixed()
}

export const formatDate = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? "-" : format(d, "dd MMM yyyy")
}