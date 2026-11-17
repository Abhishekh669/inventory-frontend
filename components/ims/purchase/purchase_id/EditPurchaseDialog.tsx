"use client"

import { useMemo, useState, useTransition } from "react"
import Decimal from "decimal.js"
import { AlertCircle, ArrowLeft, Info, Loader2, Plus, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ProductsListType } from "@/utils/types/product.types"
import type { PurchaseByIdResponse } from "@/utils/types/purchase.types"
import { calcPurchase, formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"
import { BillTotals, dateOnly, Field } from "./PurchaseFormParts"
import { updatePurchase } from "@/utils/action/purchase/purchase.put"
import { PurchaseOrderProductPicker } from "../../purchase-order/PurchaseOrderProductPicker"
import { DetailRow } from "./PurchaseDetailsParts"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
}

type EditRow = {
  key: string
  productId: string
  name: string
  sku: string
  unit: string
  allowDecimal: boolean
  ordered: Decimal | null
  prevQty: Decimal | null // null for a product added in this edit
  prevRate: Decimal | null
  base: Decimal | null // what the new rate is compared with
  isNew: boolean
  addedLater: boolean // not on the purchase order
  qty: string
  rate: string
}

const newKey = (id: string) => `new:${id}`

export function EditPurchaseDialog({ open, onOpenChange, data }: Props) {
  const purchase = data.purchase_data
  const items = data.purchase_items
  const hasOrder = !!data.purchase_order_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)

  // quantity already returned, per product on this purchase
  const returnedByProduct = useMemo(
    () => new Map(items.map((i) => [i.product_id, toDecimal(i.returned_qty)])),
    [items]
  )
  const returnedOf = (productId: string) => returnedByProduct.get(productId) ?? new Decimal(0)

  // order lines by product, so a product that is on the order links back to its order line
  const orderItemByProduct = useMemo(
    () => new Map(data.purchase_order_items.map((o) => [o.product_id, o])),
    [data.purchase_order_items]
  )

  const [step, setStep] = useState<"form" | "review">("form")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const [edits, setEdits] = useState<Record<string, { qty: string; rate: string }>>({})
  const [removed, setRemoved] = useState<string[]>([]) // product ids taken off this purchase
  const [extras, setExtras] = useState<ProductsListType[]>([])
  const [adding, setAdding] = useState(false)

  const [form, setForm] = useState({
    supplier_bill_no: purchase.supplier_bill_no,
    purchase_date: dateOnly(purchase.purchase_date),
    due_date: dateOnly(purchase.due_date),
    excise_duty: toDecimal(purchase.excise_duty).toString(),
    special_discount: toDecimal(purchase.special_discount).toString(),
    discount: toDecimal(purchase.discount).toString(),
    vat_rate: toDecimal(purchase.vat_rate).toString(),
    freight_charge: toDecimal(purchase.freight_charge).toString(),
    note: purchase.note ?? "",
  })
  const setField =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const rows: EditRow[] = useMemo(() => {
    const existing: EditRow[] = items
      .filter((i) => !removed.includes(i.product_id))
      .map((i) => {
        const e = edits[i.product_id]
        const prevRate = toDecimal(i.rate)
        return {
          key: i.product_id,
          productId: i.product_id,
          name: i.product_name,
          sku: i.product_sku,
          unit: i.unit_name,
          allowDecimal: i.allow_decimal,
          ordered: i.qty_ordered !== null ? toDecimal(i.qty_ordered) : null,
          prevQty: toDecimal(i.qty),
          prevRate,
          base: prevRate,
          isNew: false,
          addedLater: hasOrder && i.poi_id === null, // e.g. cement added while purchasing
          qty: e?.qty ?? toDecimal(i.qty).toString(),
          rate: e?.rate ?? prevRate.toString(),
        }
      })

    const added: EditRow[] = extras.map((p) => {
      // a product on the order that was left out of the purchase links back to its order line
      const po = orderItemByProduct.get(p.id)
      const cost = toDecimal(p.cost_price)
      const expected = po?.expected_unit_cost != null ? toDecimal(po.expected_unit_cost) : cost
      const e = edits[newKey(p.id)]
      return {
        key: newKey(p.id),
        productId: p.id,
        name: p.name,
        sku: p.sku,
        unit: p.unit_name,
        allowDecimal: p.allow_decimal,
        ordered: po ? toDecimal(po.qty_ordered) : null,
        prevQty: null,
        prevRate: null,
        base: expected,
        isNew: true,
        addedLater: hasOrder && !po,
        qty: e?.qty ?? (po ? toDecimal(po.qty_ordered).toString() : "1"),
        rate: e?.rate ?? (expected.gt(0) ? expected.toString() : ""),
      }
    })
    return [...existing, ...added]
  }, [items, removed, extras, edits, hasOrder, orderItemByProduct])

  const setRow = (row: EditRow, patch: Partial<{ qty: string; rate: string }>) =>
    setEdits((prev) => {
      const base = prev[row.key] ?? { qty: row.qty, rate: row.rate }
      return { ...prev, [row.key]: { ...base, ...patch } }
    })

  const removeRow = (row: EditRow) => {
    if (row.isNew) setExtras((prev) => prev.filter((p) => newKey(p.id) !== row.key))
    else setRemoved((prev) => [...prev, row.productId])
  }

  const usedProductIds = useMemo(() => new Set(rows.map((r) => r.productId)), [rows])

  function addProduct(p: ProductsListType) {
    if (removed.includes(p.id)) setRemoved((prev) => prev.filter((id) => id !== p.id))
    else setExtras((prev) => [...prev, p])
    setAdding(false)
  }

  const paid = toDecimal(purchase.paid_amount)
  const oldTotal = toDecimal(purchase.total)

  const calc = useMemo(
    () =>
      calcPurchase(
        rows.map((r) => ({ key: r.key, qty: toDecimal(r.qty), rate: toDecimal(r.rate), expected: r.base })),
        {
          excise: toDecimal(form.excise_duty),
          special: toDecimal(form.special_discount),
          discount: toDecimal(form.discount),
          vatRate: toDecimal(form.vat_rate),
          freight: toDecimal(form.freight_charge),
        }
      ),
    [rows, form]
  )

  const rowByKey = useMemo(() => new Map(rows.map((r) => [r.key, r])), [rows])
  const totalChange = calc.total.sub(oldTotal)
  const priceChangedRows = rows.filter((r) => r.prevRate !== null && !toDecimal(r.rate).eq(r.prevRate)).length
  const stockChangedRows = rows.filter((r) => !toDecimal(r.qty).eq(r.prevQty ?? 0)).length + removed.length

  function validate(): string | null {
    if (!form.supplier_bill_no.trim()) return "Supplier bill number is required."
    if (rows.length === 0) return "A purchase needs at least one item. Delete the purchase instead."
    for (const r of rows) {
      const qty = toDecimal(r.qty)
      if (qty.lte(0)) return `${r.name}: enter a quantity, or remove the item.`
      if (!r.allowDecimal && !qty.isInteger()) return `${r.name}: quantity must be a whole number.`
      if (toDecimal(r.rate).lte(0)) return `${r.name}: enter the purchase rate.`
      const returned = returnedOf(r.productId)
      if (returned.gt(0) && qty.lt(returned))
        return `${r.name}: ${returned.toString()} already returned, so the quantity cannot be lower.`
    }
    for (const k of ["excise_duty", "special_discount", "discount", "freight_charge"] as const) {
      if (toDecimal(form[k]).lt(0)) return "Amounts cannot be negative."
    }
    const vat = toDecimal(form.vat_rate)
    if (vat.lt(0) || vat.gt(100)) return "VAT rate must be between 0 and 100."
    if (calc.gross.add(calc.excise).sub(calc.special).sub(calc.discount).lt(0))
      return "Discounts are larger than the gross amount."
    if (calc.total.lt(paid)) return `The new total is less than the ${formatMoney(paid)} already paid.`
    if (form.due_date && form.due_date < form.purchase_date) return "Due date cannot be before the purchase date."
    return null
  }

  function goReview() {
    const msg = validate()
    setError(msg)
    if (!msg) setStep("review")
  }

  function submit() {
    const msg = validate()
    if (msg) return setError(msg)
    setError(null)
    startTransition(async () => {
      const res = await updatePurchase(purchase.id, {
        supplier_bill_no: form.supplier_bill_no.trim(),
        purchase_date: form.purchase_date,
        due_date: form.due_date || null,
        excise_duty: toDecimal(form.excise_duty).toString(),
        special_discount: toDecimal(form.special_discount).toString(),
        discount: toDecimal(form.discount).toString(),
        vat_rate: toDecimal(form.vat_rate).toString(),
        freight_charge: toDecimal(form.freight_charge).toString(),
        note: form.note.trim() || null,
        items: calc.lines.map((l) => ({
          product_id: rowByKey.get(l.key)!.productId,
          qty: l.qty.toString(),
          rate: l.rate.toString(),
        })),
      })
      if (!res.success) return setError(res.error ?? "Could not update the purchase.")
      refresh()
      onOpenChange(false)
    })
  }

  const productCell = (r: EditRow) => {
    const returned = returnedOf(r.productId)
    return (
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{r.name}</p>
          {r.addedLater && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              Added later
            </span>
          )}
          {r.isNew && !r.addedLater && (
            <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {hasOrder ? "Back on order" : "New"}
            </span>
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {r.sku} · {r.unit}
        </p>
        {returned.gt(0) && <p className="text-[11px] text-amber-600">{returned.toString()} returned</p>}
      </TableCell>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {step === "form" ? "Edit purchase" : "Review changes"} · Bill {purchase.supplier_bill_no}
          </DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Change quantities, rates, items and bill details. Stock and prices are corrected when you save."
              : "Check what will change before saving."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {step === "form" ? (
            <>
              <section className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Items ({rows.length})</h3>
                  <div className="flex items-center gap-2">
                    {removed.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setRemoved([])}>
                        <Undo2 className="mr-1.5 size-4" /> Restore {removed.length} removed
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setAdding((v) => !v)}>
                      <Plus className="mr-1.5 size-4" /> Add product
                    </Button>
                  </div>
                </div>

                {adding && (
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <PurchaseOrderProductPicker addedIds={usedProductIds} onAdd={addProduct} />
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                  <Table className="min-w-[820px]">
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Ordered</TableHead>
                        <TableHead className="w-32">Purchase qty</TableHead>
                        <TableHead className="text-right">Previous rate</TableHead>
                        <TableHead className="w-32">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => {
                        const line = calc.lines.find((l) => l.key === r.key)
                        const hasReturns = returnedOf(r.productId).gt(0)
                        return (
                          <TableRow key={r.key}>
                            {productCell(r)}
                            <TableCell className="text-right tabular-nums">{r.ordered?.toString() ?? "-"}</TableCell>
                            <TableCell>
                              <Input
                                inputMode="decimal"
                                value={r.qty}
                                onChange={(e) => setRow(r, { qty: e.target.value })}
                              />
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {r.prevRate ? formatMoney(r.prevRate) : "-"}
                            </TableCell>
                            <TableCell>
                              <Input
                                inputMode="decimal"
                                value={r.rate}
                                onChange={(e) => setRow(r, { rate: e.target.value })}
                              />
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {line ? formatMoney(line.lineValue) : "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                aria-label={`Remove ${r.name}`}
                                disabled={hasReturns}
                                title={hasReturns ? "This item has returns. Delete its returns first." : undefined}
                                onClick={() => removeRow(r)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Supplier bill no *">
                    <Input value={form.supplier_bill_no} onChange={setField("supplier_bill_no")} />
                  </Field>
                  <Field label="Purchase date">
                    <Input type="date" value={form.purchase_date} onChange={setField("purchase_date")} />
                  </Field>
                  <Field label="Due date">
                    <Input type="date" value={form.due_date} onChange={setField("due_date")} />
                  </Field>
                  <Field label="Excise duty">
                    <Input inputMode="decimal" value={form.excise_duty} onChange={setField("excise_duty")} />
                  </Field>
                  <Field label="Special discount">
                    <Input inputMode="decimal" value={form.special_discount} onChange={setField("special_discount")} />
                  </Field>
                  <Field label="Discount">
                    <Input inputMode="decimal" value={form.discount} onChange={setField("discount")} />
                  </Field>
                  <Field label="VAT rate (%)">
                    <Input inputMode="decimal" value={form.vat_rate} onChange={setField("vat_rate")} />
                  </Field>
                  <Field label="Freight charge">
                    <Input inputMode="decimal" value={form.freight_charge} onChange={setField("freight_charge")} />
                  </Field>
                  <div />
                  <Field label="Note" className="sm:col-span-3">
                    <Textarea rows={2} value={form.note} onChange={setField("note")} />
                  </Field>
                </div>

                <aside className="flex flex-col gap-3 lg:sticky lg:top-0 lg:self-start">
                  <div className="rounded-xl border p-4">
                    <p className="mb-2 text-sm font-semibold">Bill summary</p>
                    <BillTotals calc={calc} />
                  </div>
                  <div className="flex flex-col gap-1.5 rounded-xl border p-4">
                    <DetailRow label="Previous total" value={formatMoney(oldTotal)} />
                    <DetailRow
                      label="Change"
                      value={
                        <span className={cn(totalChange.gt(0) && "text-red-600", totalChange.lt(0) && "text-emerald-600")}>
                          {totalChange.gt(0) ? "+" : ""}
                          {formatMoney(totalChange)}
                        </span>
                      }
                    />
                    <DetailRow label="Already paid" value={formatMoney(paid)} />
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty (before → after)</TableHead>
                      <TableHead className="text-right">Rate (before → after)</TableHead>
                      <TableHead className="text-right">Cost + VAT</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calc.lines.map((l) => {
                      const r = rowByKey.get(l.key)!
                      const qtyChanged = r.prevQty === null || !l.qty.eq(r.prevQty)
                      const rateChanged = r.prevRate === null || !l.rate.eq(r.prevRate)
                      return (
                        <TableRow key={l.key}>
                          {productCell(r)}
                          <TableCell className={cn("text-right tabular-nums", qtyChanged && "font-medium text-amber-600")}>
                            {r.prevQty ? `${r.prevQty.toString()} → ` : ""}
                            {l.qty.toString()}
                          </TableCell>
                          <TableCell className={cn("text-right tabular-nums", rateChanged && "font-medium text-amber-600")}>
                            {r.prevRate ? `${formatMoney(r.prevRate)} → ` : ""}
                            {formatMoney(l.rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(l.unitCostWithVat)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatMoney(l.lineValue)}</TableCell>
                        </TableRow>
                      )
                    })}
                    {removed.map((pid) => {
                      const i = items.find((x) => x.product_id === pid)
                      if (!i) return null
                      return (
                        <TableRow key={`removed:${pid}`} className="opacity-60">
                          <TableCell>
                            <p className="font-medium line-through">{i.product_name}</p>
                            <p className="font-mono text-xs text-muted-foreground">{i.product_sku}</p>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{toDecimal(i.qty).toString()} → removed</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">-</TableCell>
                          <TableCell className="text-right">-</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    Stock changes for <strong>{stockChangedRows}</strong> item{stockChangedRows === 1 ? "" : "s"} (the
                    difference is added or taken off).
                  </li>
                  <li>
                    {priceChangedRows > 0
                      ? `${priceChangedRows} rate${priceChangedRows === 1 ? "" : "s"} changed. A product's cost and selling price follow the new rate only if it still carries this purchase's old price. Removed items go back to their earlier price.`
                      : "No rates changed, so product prices stay the same."}
                  </li>
                  <li>The order&apos;s received quantities and status are updated to match.</li>
                  <li>
                    The supplier balance changes by{" "}
                    <strong>
                      {totalChange.gt(0) ? "+" : ""}
                      {formatMoney(totalChange)}
                    </strong>
                    .
                  </li>
                </ul>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 rounded-xl border p-4">
                  <DetailRow label="Bill no" value={form.supplier_bill_no} />
                  <DetailRow label="Purchase date" value={form.purchase_date} />
                  <DetailRow label="Due date" value={form.due_date} />
                  <DetailRow label="Previous total" value={formatMoney(oldTotal)} />
                  <DetailRow label="New total" value={<strong>{formatMoney(calc.total)}</strong>} />
                  <DetailRow label="Already paid" value={formatMoney(paid)} />
                  <DetailRow label="New due" value={formatMoney(calc.total.sub(paid))} />
                  <DetailRow label="Note" value={form.note} />
                </div>
                <div className="rounded-xl border p-4">
                  <BillTotals calc={calc} />
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}
        </div>

        <DialogFooter>
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={goReview}>Review changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("form")} disabled={pending}>
                <ArrowLeft className="mr-1.5 size-4" /> Back
              </Button>
              <Button onClick={submit} disabled={pending}>
                {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                Save changes
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}