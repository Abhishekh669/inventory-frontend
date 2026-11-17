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
import type { PurchaseByIdResponse } from "@/utils/types/purchase.types"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"
import { Field, todayStr } from "./PurchaseFormParts"
import { createPurchaseReturn } from "@/utils/action/purchase/purchase.post"
import { DetailRow } from "./PurchaseDetailsParts"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
}

export function CreateReturnDialog({ open, onOpenChange, data }: Props) {
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)

  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [qtys, setQtys] = useState<Record<string, string>>({})
  const [amounts, setAmounts] = useState<Record<string, string>>({}) // amounts typed by hand
  const [returnDate, setReturnDate] = useState(todayStr())
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")

  const lines = useMemo(
    () =>
      data.purchase_items
        .map((item) => {
          const returnable = toDecimal(item.qty).sub(toDecimal(item.returned_qty))
          const qty = toDecimal(qtys[item.id])
          // suggested credit: the purchase value of the returned quantity
          const suggested = qty.mul(toDecimal(item.unit_cost_with_vat)).toDecimalPlaces(2)
          const amount = amounts[item.id] !== undefined ? toDecimal(amounts[item.id]) : suggested
          return { item, returnable, qty, suggested, amount }
        })
        .filter((l) => l.returnable.gt(0)),
    [data.purchase_items, qtys, amounts]
  )

  const active = lines.filter((l) => l.qty.gt(0))
  const total = active.reduce((sum, l) => sum.add(l.amount), new Decimal(0))

  const due = toDecimal(purchase.total).sub(toDecimal(purchase.paid_amount)).sub(toDecimal(purchase.returned_amount))
  const dueAfter = due.sub(total)

  function validate(): string | null {
    if (active.length === 0) return "Enter a return quantity for at least one item."
    for (const l of active) {
      if (l.qty.gt(l.returnable)) return `${l.item.product_name}: only ${l.returnable.toString()} left to return.`
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
      const res = await createPurchaseReturn(purchase.id, {
        return_date: returnDate,
        note: note.trim() || null,
        items: active.map((l) => ({
          purchase_item_id: l.item.id,
          qty: l.qty.toString(),
          amount: l.amount.toString(),
          reason: reason.trim() || null,
        })),
      })
      if (!res.success) return setError(res.error ?? "Could not create the return.")
      refresh()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Return items to supplier</DialogTitle>
          <DialogDescription>
            Choose what goes back. The returned quantity is taken off stock and recorded on this purchase.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="overflow-x-auto rounded-xl border">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Purchased</TableHead>
                  <TableHead className="text-right">Returned</TableHead>
                  <TableHead className="text-right">Can return</TableHead>
                  <TableHead className="w-32">Return qty</TableHead>
                  <TableHead className="w-36">Credit amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.item.id}>
                    <TableCell>
                      <p className="font-medium">{l.item.product_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {l.item.unit_name}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatQuantity(l.item.qty, l.item.allow_decimal)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatQuantity(l.item.returned_qty, l.item.allow_decimal)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{l.returnable.toString()}</TableCell>
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
                  </TableRow>
                ))}
                {lines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Everything on this purchase has already been returned.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            The credit amount starts as quantity × cost with VAT. Change it to any amount you want to record.
          </p>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Return date">
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </Field>
              <Field label="Reason (applies to all returned items)">
                <Input value={reason} maxLength={250} onChange={(e) => setReason(e.target.value)} />
              </Field>
              <Field label="Note" className="sm:col-span-2">
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
            </div>

            <div className="flex flex-col gap-1.5 rounded-xl border p-4">
              <DetailRow label="Return total" value={<strong>{formatMoney(total)}</strong>} />
              <Separator />
              <DetailRow label="Due before" value={formatMoney(due)} />
              <DetailRow
                label="Due after"
                value={
                  <span className={dueAfter.lt(0) ? "text-emerald-600" : ""}>
                    {dueAfter.lt(0) ? `${formatMoney(dueAfter.abs())} credit` : formatMoney(dueAfter)}
                  </span>
                }
              />
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              A return takes the quantity off stock and updates this purchase&apos;s returned amount. It does not change
              the supplier&apos;s balance, credit or summaries.
              {dueAfter.lt(0) && " The return is larger than what is still due, so this purchase will show a credit."}
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
          <Button onClick={submit} disabled={pending || lines.length === 0}>
            {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Create return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}