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
import type { PurchaseByIdResponse, PurchaseReturnDetail } from "@/utils/types/purchase.types"
import { deletePurchaseReturn } from "@/utils/action/purchase/purchase.delete"
import { usePurchaseRefresh } from "@/utils/hooks/tanstack/purchase/use-purchase-refresh"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PurchaseByIdResponse
  ret: PurchaseReturnDetail
}

export function DeleteReturnDialog({ open, onOpenChange, data, ret }: Props) {
  const purchase = data.purchase_data
  const refresh = usePurchaseRefresh(purchase.id, purchase.supplier_id)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const res = await deletePurchaseReturn(purchase.id, ret.id)
      if (!res.success) return setError(res.error ?? "Could not delete the return.")
      refresh()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" /> Delete return
          </DialogTitle>
          <DialogDescription>
            Delete return <strong>{ret.return_no}</strong> ({formatMoney(toDecimal(ret.total))}). This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>The returned quantities are added back to stock.</li>
          <li>This purchase&apos;s returned amount goes down by {formatMoney(toDecimal(ret.total))}.</li>
          <li>The supplier&apos;s balance, credit and summaries are not changed.</li>
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
            Delete return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}