"use client"

import { useMemo, useState, useTransition } from "react"
import Decimal from "decimal.js"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatQuantity } from "@/utils/helper/format"
import { formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import type { PurchaseByIdResponse, PurchaseReturnDetail } from "@/utils/types/purchase.types"
import { updatePurchaseReturn } from "@/utils/action/purchase/purchase.put"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"
import { DetailRow } from "./PurchaseDetailsParts"
import { Field, dateOnly } from "./PurchaseFormParts"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
  ret: PurchaseReturnDetail
}

export function EditReturnDialog({ open, onOpenChange, data, ret }: Props) {
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)

  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // start from what this return holds now
  const [qtys, setQtys] = useState<Record<string, string>>(() =>
    Object.fromEntries(ret.items.map((i) => [i.purchase_item_id, toDecimal(i.qty).toString()]))
  )
  // an amount is kept as typed only when it differs from quantity × cost with VAT,
  // so changing the quantity of an untouched line also updates its amount
  const [amounts, setAmounts] = useState<Record<string, string>>(() => {
    const result: Record<string, string> = {}
    for (const i of ret.items) {
      const item = data.purchase_items.find((p) => p.id === i.purchase_item_id)
      const suggested = toDecimal(i.qty).mul(toDecimal(item?.unit_cost_with_vat)).toDecimalPlaces(2)
      const current = toDecimal(i.amount)
      if (!current.eq(suggested)) result[i.purchase_item_id] = current.toString()
    }
    return result
  })
  const [reasons, setReasons] = useState<Record<string, string>>(() =>
    Object.fromEntries(ret.items.map((i) => [i.purchase_item_id, i.reason ?? ""]))
  )
  const [returnDate, setReturnDate] = useState(dateOnly(ret.return_date))
  const [note, setNote] = useState(ret.note ?? "")

  const lines = useMemo(
    () =>
      data.purchase_items
        .map((item) => {
          const current = ret.items.find((i) => i.purchase_item_id === item.id)
          // what the other returns of this line already took
          const others = toDecimal(item.returned_qty).sub(current ? toDecimal(current.qty) : 0)
          const maxQty = toDecimal(item.qty).sub(others)
          const qty = toDecimal(qtys[item.id])
          const suggested = qty.mul(toDecimal(item.unit_cost_with_vat)).toDecimalPlaces(2)
          const amount = amounts[item.id] !== undefined ? toDecimal(amounts[item.id]) : suggested
          return { item, maxQty, qty, suggested, amount }
        })
        .filter((l) => l.maxQty.gt(0)),
    [data.purchase_items, ret.items, qtys, amounts]
  )

  const active = lines.filter((l) => l.qty.gt(0))
  const total = active.reduce((sum, l) => sum.add(l.amount), new Decimal(0))
  const oldTotal = toDecimal(ret.total)
  const change = total.sub(oldTotal)

  // the purchase's due already counts this return as it was
  const due = toDecimal(purchase.total).sub(toDecimal(purchase.paid_amount)).sub(toDecimal(purchase.returned_amount))
  const dueAfter = due.add(oldTotal).sub(total)

  function validate(): string | null {
    if (active.length === 0) return "A return needs at least one item. Delete the return instead."
    for (const l of active) {
      if (l.qty.gt(l.maxQty)) return `${l.item.product_name}: at most ${l.maxQty.toString()} can be returned.`
      if (!l.item.allow_decimal && !l.qty.isInteger()) return `${l.item.product_name}: quantity must be a whole number.`
      if (l.amount.lt(0)) return `${l.item.product_name}: credit amount cannot be negative.`
    }
    return null
  }

  function submit() {
    const msg = validate()
    setError(msg)
    if (msg) return
    startTransition(async () => {
      const res = await updatePurchaseReturn(purchase.id, ret.id, {
        return_date: returnDate,
        note: note.trim() || null,
        items: active.map((l) => ({
          purchase_item_id: l.item.id,
          qty: l.qty.toString(),
          amount: l.amount.toString(),
          reason: reasons[l.item.id]?.trim() || null,
        })),
      })
      if (!res.success) return setError(res.error ?? "Could not update the return.")
      refresh()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Edit return · {ret.return_no}</DialogTitle>
          <DialogDescription>
            Make the quantities or amounts higher or lower. Set a quantity to 0 to take an item off this return.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="overflow-x-auto rounded-xl border">
            <Table className="min-w-[820px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                  <TableHead className="text-right">Can return</TableHead>
                  <TableHead className="w-28">Return qty</TableHead>
                  <TableHead className="w-32">Credit amount</TableHead>
                  <TableHead className="w-48">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.item.id}>
                    <TableCell>
                      <p className="font-medium">{l.item.product_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {l.item.product_sku} · {l.item.unit_name}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(l.item.qty, l.item.allow_decimal)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{l.maxQty.toString()}</TableCell>
                    <TableCell>
                      <Input
                        inputMode="decimal"
                        placeholder="0"
                        value={qtys[l.item.id] ?? ""}
                        onChange={(e) => setQtys((prev) => ({ ...prev, [l.item.id]: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        inputMode="decimal"
                        disabled={l.qty.lte(0)}
                        value={l.qty.gt(0) ? (amounts[l.item.id] ?? l.suggested.toString()) : ""}
                        onChange={(e) => {
                          const v = e.target.value
                          setAmounts((prev) => {
                            const next = { ...prev }
                            if (v === "") delete next[l.item.id]
                            else next[l.item.id] = v
                            return next
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={reasons[l.item.id] ?? ""}
                        maxLength={250}
                        disabled={l.qty.lte(0)}
                        onChange={(e) => setReasons((prev) => ({ ...prev, [l.item.id]: e.target.value }))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Return date">
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </Field>
              <div />
              <Field label="Note" className="sm:col-span-2">
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
            </div>

            <div className="flex flex-col gap-1.5 rounded-xl border p-4">
              <DetailRow label="Previous total" value={formatMoney(oldTotal)} />
              <DetailRow label="New total" value={<strong>{formatMoney(total)}</strong>} />
              <DetailRow
                label="Change"
                value={
                  <span className={change.gt(0) ? "text-emerald-600" : change.lt(0) ? "text-red-600" : ""}>
                    {change.gt(0) ? "+" : ""}
                    {formatMoney(change)}
                  </span>
                }
              />
              <Separator />
              <DetailRow
                label="Due after"
                value={dueAfter.lt(0) ? `${formatMoney(dueAfter.abs())} credit` : formatMoney(dueAfter)}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              Only this return changes. Returning more takes more off stock, and returning less puts the difference back.
              This purchase&apos;s returned amount follows the new total. The supplier&apos;s balance, credit and
              summaries are not touched.
            </p>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Save return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}