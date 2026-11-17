"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import type { PurchaseByIdResponse, PurchasePayment } from "@/utils/types/purchase.types"
import { deletePurchasePayment } from "@/utils/action/purchase/purchase.delete"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
  payment: PurchasePayment
}

export function DeletePaymentDialog({ open, onOpenChange, data, payment }: Props) {
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const fromAdvance = payment.payment_type === "advance"
  const amount = formatMoney(toDecimal(payment.amount))

  function submit() {
    setError(null)
    startTransition(async () => {
      const res = await deletePurchasePayment(purchase.id, payment.id)
      if (!res.success) return setError(res.error ?? "Could not delete the payment.")
      refresh()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" /> Delete payment
          </DialogTitle>
          <DialogDescription>
            Delete the {amount} payment on bill <strong>{purchase.supplier_bill_no}</strong>. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>This purchase&apos;s paid amount goes down by {amount}, so its due goes up.</li>
          {fromAdvance ? (
            <li>The {amount} goes back to the supplier&apos;s advance credit. The payment record stays.</li>
          ) : (
            <li>The payment is removed completely, so you owe the supplier {amount} more.</li>
          )}
        </ul>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Delete payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}