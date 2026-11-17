"use client"

import { useState, useTransition } from "react"
import Decimal from "decimal.js"
import { AlertCircle, Banknote, Loader2, PiggyBank } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import type { PaymentMethod, PaymentSource, PurchaseByIdResponse } from "@/utils/types/purchase.types"
import { useGetSupplier } from "@/utils/hooks/tanstack/suppliers/use-get-supplier-by-id"
import { createPurchasePayment } from "@/utils/action/purchase/purchase.post"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"
import { DetailRow } from "./PurchaseDetailsParts"
import { Field, todayStr } from "./PurchaseFormParts"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
}

export function AddPaymentDialog({ open, onOpenChange, data }: Props) {
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)
  const { data: supplierData, isLoading: loadingSupplier } = useGetSupplier(purchase.supplier_id)

  const due = toDecimal(purchase.due_amount)
  const credit = toDecimal(supplierData?.supplier?.credit_balance)
  const hasCredit = credit.gt(0)

  const [source, setSource] = useState<PaymentSource>("regular")
  const [amount, setAmount] = useState(due.gt(0) ? due.toString() : "")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [paymentDate, setPaymentDate] = useState(todayStr())
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const maxAmount = source === "advance" ? Decimal.min(due, credit) : due
  const amountValue = toDecimal(amount)

  function chooseSource(next: PaymentSource) {
    setSource(next)
    setError(null)
    // never leave more than the chosen source can cover in the box
    const cap = next === "advance" ? Decimal.min(due, credit) : due
    if (toDecimal(amount).gt(cap)) setAmount(cap.toString())
  }

  function validate(): string | null {
    if (!due.gt(0)) return "This purchase has nothing left to pay."
    if (amountValue.lte(0)) return "Enter an amount greater than zero."
    if (amountValue.gt(due)) return `The amount is more than the ${formatMoney(due)} due.`
    if (source === "advance" && amountValue.gt(credit))
      return `Only ${formatMoney(credit)} of advance credit is available.`
    return null
  }

  function submit() {
    const msg = validate()
    setError(msg)
    if (msg) return
    startTransition(async () => {
      const res = await createPurchasePayment(purchase.id, {
        amount: amountValue.toString(),
        payment_date: paymentDate,
        source,
        payment_method: method,
        note: note.trim() || null,
      })
      if (!res.success) return setError(res.error ?? "Could not record the payment.")
      refresh()
      onOpenChange(false)
    })
  }

  const SourceButton = ({
    value,
    title,
    description,
    icon: Icon,
  }: {
    value: PaymentSource
    title: string
    description: string
    icon: typeof Banknote
  }) => (
    <button
      type="button"
      aria-pressed={source === value}
      onClick={() => chooseSource(value)}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-left transition",
        source === value ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "hover:bg-muted/40"
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add payment · Bill {purchase.supplier_bill_no}</DialogTitle>
          <DialogDescription>Pay what is due on this bill.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/20 p-4">
            <DetailRow label="Total" value={formatMoney(toDecimal(purchase.total))} />
            <DetailRow label="Paid" value={formatMoney(toDecimal(purchase.paid_amount))} />
            <DetailRow label="Returned" value={formatMoney(toDecimal(purchase.returned_amount))} />
            <DetailRow label="Due" value={<strong className="text-red-600">{formatMoney(due)}</strong>} />
          </div>

          {loadingSupplier ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="grid gap-2">
              <p className="text-xs text-muted-foreground">How do you want to pay?</p>
              <SourceButton
                value="regular"
                title="Pay manually"
                description="Record a new payment (cash, bank, cheque or online)."
                icon={Banknote}
              />
              {hasCredit && (
                <SourceButton
                  value="advance"
                  title="Pay from advance already given"
                  description={`${formatMoney(credit)} of advance credit is available with this supplier.`}
                  icon={PiggyBank}
                />
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`Amount (max ${formatMoney(maxAmount)})`}>
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Payment date">
              <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
            </Field>
            {source === "regular" && (
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
            <Field label="Note" className="sm:col-span-2">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>

          {source === "advance" && (
            <p className="text-xs text-muted-foreground">
              This uses the supplier&apos;s advance. Their credit balance and what you owe both go down by{" "}
              {formatMoney(amountValue)}.
            </p>
          )}

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
          <Button onClick={submit} disabled={pending || loadingSupplier}>
            {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Record payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}