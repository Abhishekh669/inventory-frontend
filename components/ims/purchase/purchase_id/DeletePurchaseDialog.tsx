"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import type { PurchaseByIdResponse } from "@/utils/types/purchase.types"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"
import { deletePurchase } from "@/utils/action/purchase/purchase.delete"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
}

export function DeletePurchaseDialog({ open, onOpenChange, data }: Props) {
  const router = useRouter()
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const paid = toDecimal(purchase.paid_amount)
  const returnCount = data.returns.length
  const matches = confirmText.trim() === purchase.supplier_bill_no

  function submit() {
    if (!matches) return
    setError(null)
    startTransition(async () => {
      const res = await deletePurchase(purchase.id)
      if (!res.success) return setError(res.error ?? "Could not delete the purchase.")
      refresh()
      onOpenChange(false)
      router.push("/all-purchases")
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" /> Delete purchase
          </DialogTitle>
          <DialogDescription>
            This deletes the whole purchase for bill <strong>{purchase.supplier_bill_no}</strong> and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            The purchased quantities are taken off stock (anything already returned is not taken off twice), and product
            prices go back to their earlier values.
          </li>
          <li>The supplier balance is reduced by the bill total.</li>
          <li>
            {paid.gt(0)
              ? `The ${formatMoney(paid)} already paid is kept as advance credit with the supplier.`
              : "No payments have been made on this bill."}
          </li>
          {returnCount > 0 && (
            <li>
              Its {returnCount} return{returnCount > 1 ? "s are" : " is"} deleted with it. Returns never changed the
              supplier&apos;s balance, so nothing is reversed there.
            </li>
          )}
          {purchase.purchase_order_id && <li>The purchase order goes back to Sent, so it can be purchased again.</li>}
        </ul>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-muted-foreground">
            Type <span className="font-mono font-medium text-foreground">{purchase.supplier_bill_no}</span> to confirm.
          </p>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={submit} disabled={!matches || pending}>
            {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Delete purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}