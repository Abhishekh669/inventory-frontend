"use client"

import { useState } from "react"
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
import { getActionError } from "@/utils/helper/category-validation"
import type { PurchaseOrderSummary } from "@/utils/types/purchase-order.types"
import { deletePurchaseOrders } from "@/utils/action/purchases-order/purchase-order.delete"

export function DeletePurchaseOrderDialog({
  purchaseOrder,
  onOpenChange,
  onDeleted,
}: {
  purchaseOrder: PurchaseOrderSummary | null
  onOpenChange: (open: boolean) => void
  onDeleted: (purchaseOrderId: string) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!purchaseOrder || isDeleting) return

    setIsDeleting(true)
    try {
      const res = await deletePurchaseOrders({ ids: [purchaseOrder.id] })
      if (!res.success) {
        toast.error(getActionError(res, "Failed to delete purchase order."))
        return
      }

      toast.success(res.message || "Purchase order deleted.")
      onDeleted(purchaseOrder.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={purchaseOrder !== null} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete purchase order?</DialogTitle>
          <DialogDescription>
            {purchaseOrder
              ? `${purchaseOrder.po_no}${purchaseOrder.title ? ` (${purchaseOrder.title})` : ""} will be permanently removed together with its products. This can't be undone.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} aria-busy={isDeleting}>
            {isDeleting && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}