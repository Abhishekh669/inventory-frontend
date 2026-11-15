import Decimal from "decimal.js"

export const toDecimal = (v: unknown): Decimal => {
  const s = String(v ?? "").trim()
  if (!s) return new Decimal(0)
  try {
    return new Decimal(s)
  } catch {
    return new Decimal(0)
  }
}

export const formatMoney = (d: Decimal) =>
  d.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

export interface CalcLineInput {
  key: string
  qty: Decimal
  rate: Decimal
  expected: Decimal | null
}

export interface CalcCharges {
  excise: Decimal
  special: Decimal
  discount: Decimal
  vatRate: Decimal
  freight: Decimal
}

// same values the server stores for each purchase item
export interface CalcLine extends CalcLineInput {
  lineValue: Decimal // qty x rate (shown as Amount)
  vat: Decimal // qty x rate x VAT%
  unitCost: Decimal // the rate
  unitCostWithVat: Decimal // rate x (1 + VAT%)
  diff: Decimal | null // rate - expected
  diffPct: Decimal | null
  priceChanged: boolean
}

export interface CalcResult {
  lines: CalcLine[]
  gross: Decimal
  excise: Decimal
  special: Decimal
  discount: Decimal
  taxable: Decimal
  vatRate: Decimal
  vat: Decimal
  freight: Decimal
  total: Decimal
}

const r2 = (d: Decimal) => d.toDecimalPlaces(2)
const r4 = (d: Decimal) => d.toDecimalPlaces(4)

// discount and excise are applied once, on the bill, after the gross amount
export function calcPurchase(inputs: CalcLineInput[], c: CalcCharges): CalcResult {
  const vatFactor = new Decimal(1).add(c.vatRate.div(100))

  const lines: CalcLine[] = inputs
    .filter((l) => l.qty.gt(0))
    .map((l) => {
      const lineValue = r4(l.qty.mul(l.rate))
      const diff = l.expected ? l.rate.sub(l.expected) : null
      return {
        ...l,
        lineValue,
        vat: r4(lineValue.mul(c.vatRate).div(100)),
        unitCost: l.rate,
        unitCostWithVat: r4(l.rate.mul(vatFactor)),
        diff,
        diffPct: diff && l.expected && l.expected.gt(0) ? diff.div(l.expected).mul(100) : null,
        priceChanged: diff ? !diff.isZero() : false,
      }
    })

  const gross = r2(lines.reduce((a, l) => a.add(l.lineValue), new Decimal(0)))
  const taxable = r2(gross.add(c.excise).sub(c.special).sub(c.discount))
  const vat = r2(taxable.mul(c.vatRate).div(100))

  return {
    lines,
    gross,
    excise: c.excise,
    special: c.special,
    discount: c.discount,
    taxable,
    vatRate: c.vatRate,
    vat,
    freight: c.freight,
    total: r2(taxable.add(vat).add(c.freight)),
  }
}