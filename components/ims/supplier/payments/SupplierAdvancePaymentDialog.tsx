"use client"

import { useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Decimal from "decimal.js"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { getActionError } from "@/utils/helper/category-validation"
import { formatMoney } from "@/utils/helper/format"
import type { Supplier } from "@/utils/types/suppliers.types"
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/utils/types/supplier-payment.types"
import { createAdvancePayment } from "@/utils/action/supplier-payment/supplier-payment.post"

const AMOUNT_RE = /^\d+(\.\d+)?$/
const MAX_AMOUNT = new Decimal("999999999999") // NUMERIC(14,2)
const MAX_NOTE = 500

function toDecimal(value: string | null | undefined) {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

// the balance is what we owe the supplier: above 0 is due, 0 is clear, below 0 is paid in advance
function describeBalance(balance: Decimal) {
  if (balance.gt(0)) {
    return { text: `${formatMoney(balance.toFixed(2))} to pay`, className: "text-red-600 dark:text-red-400" }
  }
  if (balance.lt(0)) {
    return { text: `${formatMoney(balance.abs().toFixed(2))} in advance`, className: "text-blue-600 dark:text-blue-400" }
  }
  return { text: "Fully settled", className: "text-emerald-600 dark:text-emerald-400" }
}

export function AdvancePaymentDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier: Supplier
}) {
  const [isSaving, setIsSaving] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Advance payment</DialogTitle>
          <DialogDescription>
            Record money paid to {supplier.name} before a bill is raised. It reduces the balance you owe.
          </DialogDescription>
        </DialogHeader>

        <AdvancePaymentForm
          supplier={supplier}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          onCancel={() => onOpenChange(false)}
          onSaved={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function AdvancePaymentForm({
  supplier,
  isSaving,
  setIsSaving,
  onCancel,
  onSaved,
}: {
  supplier: Supplier
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  onCancel: () => void
  onSaved: () => void
}) {
  const queryClient = useQueryClient()

  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<PaymentMethod>("cash")
  const [note, setNote] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const balance = useMemo(() => toDecimal(supplier.balance), [supplier.balance])

  const amountError = useMemo(() => {
    if (!AMOUNT_RE.test(amount)) return "Enter the amount paid"
    const value = new Decimal(amount)
    if (value.lte(0)) return "Amount must be more than 0"
    if (value.gt(MAX_AMOUNT)) return "Amount is too large"
    if (value.decimalPlaces() > 2) return "Use at most 2 decimal places"
    return null
  }, [amount])

  const noteError = note.trim().length > MAX_NOTE ? `Note must be at most ${MAX_NOTE} characters` : null

  const after = useMemo(
    () => (amountError ? balance : balance.minus(new Decimal(amount))),
    [amount, amountError, balance]
  )
  const currentBalance = describeBalance(balance)
  const balanceAfter = describeBalance(after)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    setSubmitted(true)
    if (amountError || noteError) return

    setIsSaving(true)
    try {
      const res = await createAdvancePayment({
        supplier_id: supplier.id,
        amount: new Decimal(amount).toFixed(2),
        payment_method: method,
        note: note.trim() || null,
      })

      if (!res.success) {
        toast.error(getActionError(res, "Failed to record the payment."))
        return
      }

      toast.success(res.message || "Advance payment recorded.")
      // refresh the supplier (balance in the header) and the payment lists
      queryClient.invalidateQueries({ queryKey: ["get-supplier", supplier.id] })
      queryClient.invalidateQueries({ queryKey: ["supplier-payments", supplier.id] })
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="advance-amount">Amount</Label>
          {balance.gt(0) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setAmount(balance.toFixed(2))}
              disabled={isSaving}
            >
              Use balance due
            </Button>
          )}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            Rs
          </span>
          <Input
            id="advance-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="pl-9 tabular-nums"
            disabled={isSaving}
            autoFocus
            aria-invalid={submitted && Boolean(amountError)}
          />
        </div>
        {submitted && amountError && <p className="text-xs text-destructive">{amountError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Payment method</Label>
        <Select value={method} onValueChange={(v) => setMethod(String(v) as PaymentMethod)} disabled={isSaving}>
          <SelectTrigger className="w-full">
            <SelectValue>{PAYMENT_METHOD_LABELS[method]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((item) => (
              <SelectItem key={item} value={item}>
                {PAYMENT_METHOD_LABELS[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="advance-note">Note</Label>
        <Textarea
          id="advance-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional, for example the cheque number"
          disabled={isSaving}
          aria-invalid={submitted && Boolean(noteError)}
        />
        {submitted && noteError && <p className="text-xs text-destructive">{noteError}</p>}
      </div>

      <dl className="rounded-lg border bg-muted/30 px-3 py-2.5 text-sm" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Balance now</dt>
          <dd className={cn("font-medium tabular-nums", currentBalance.className)}>{currentBalance.text}</dd>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2">
          <dt className="text-muted-foreground">After this payment</dt>
          <dd className={cn("font-semibold tabular-nums", balanceAfter.className)}>{balanceAfter.text}</dd>
        </div>
      </dl>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
          {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isSaving ? "Saving..." : "Record payment"}
        </Button>
      </DialogFooter>
    </form>
  )
}