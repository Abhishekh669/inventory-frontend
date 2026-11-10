import { Badge } from "@/components/ui/badge"
import type { PurchaseOrderStatus } from "@/utils/types/purchase-order.types"

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partial: "Partially received",
  received: "Received",
  cancelled: "Cancelled",
}

const STATUS_STYLES: Record<PurchaseOrderStatus, { badge: string; dot: string }> = {
  draft: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  sent: {
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  partial: {
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  received: {
    badge: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    dot: "bg-green-500",
  },
  cancelled: {
    badge: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    dot: "bg-red-500",
  },
}

export function PurchaseOrderStatusBadge({ status }: { status: PurchaseOrderStatus }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.draft

  return (
    <Badge
      variant="outline"
      className={`h-6 gap-1.5 rounded-full border-transparent px-2.5 text-xs font-medium ${style.badge}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {PURCHASE_ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}