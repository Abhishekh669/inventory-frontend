"use client"

import { useState, useTransition } from "react"
import Decimal from "decimal.js"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import type { PaymentMethod, PurchaseByIdResponse, PurchasePayment } from "@/utils/types/purchase.types"
import { updatePurchasePayment } from "@/utils/action/purchase/purchase.put"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"
import { DetailRow } from "./PurchaseDetailsParts"
import { Field, dateOnly } from "./PurchaseFormParts"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
  payment: PurchasePayment
}

export function EditPaymentDialog({ open, onOpenChange, data, payment }: Props) {
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)

  const fromAdvance = payment.payment_type === "advance"
  const current = toDecimal(payment.amount)
  const due = toDecimal(purchase.due_amount)
  // the most this payment can become: what it is now plus what is still due
  const maxAmount = current.add(Decimal.max(due, 0))

  const [amount, setAmount] = useState(current.toString())
  const [paymentDate, setPaymentDate] = useState(dateOnly(payment.payment_date))
  const [method, setMethod] = useState<PaymentMethod>(payment.payment_method)
  const [note, setNote] = useState(payment.note ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const amountValue = toDecimal(amount)

  function validate(): string | null {
    if (amountValue.lte(0)) return "Enter an amount greater than zero. Delete the payment to remove it."
    if (amountValue.gt(maxAmount)) return `The amount cannot be more than ${formatMoney(maxAmount)}.`
    return null
  }

  function submit() {
    const msg = validate()
    setError(msg)
    if (msg) return
    startTransition(async () => {
      const res = await updatePurchasePayment(purchase.id, payment.id, {
        amount: amountValue.toString(),
        payment_date: paymentDate,
        payment_method: method,
        note: note.trim() || null,
      })
      if (!res.success) return setError(res.error ?? "Could not update the payment.")
      refresh()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit payment · Bill {purchase.supplier_bill_no}</DialogTitle>
          <DialogDescription>
            {fromAdvance
              ? "This payment was taken from the supplier's advance. Only the amount applied to this bill can change."
              : "Change the amount, date, method or note of this payment."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/20 p-4">
            <DetailRow label="Bill total" value={formatMoney(toDecimal(purchase.total))} />
            <DetailRow label="Paid so far" value={formatMoney(toDecimal(purchase.paid_amount))} />
            <DetailRow label="This payment now" value={formatMoney(current)} />
            <DetailRow label="Due" value={formatMoney(due)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`Amount (max ${formatMoney(maxAmount)})`}>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Payment date">
              <Input
                type="date"
                value={paymentDate}
                disabled={fromAdvance}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </Field>
            {!fromAdvance && (
              <Field label="Payment method" className="sm:col-span-2">
                <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            {!fromAdvance && (
              <Field label="Note" className="sm:col-span-2">
                <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>
              {fromAdvance
                ? "A higher amount uses more of the supplier's advance credit, and a lower amount gives the difference back to it."
                : "The supplier's balance follows the change: a higher amount means you owe less, a lower amount means you owe more."}
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
            Save payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}