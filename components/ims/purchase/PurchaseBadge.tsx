import type {
  PaymentStatus,
  PurchaseOrderStatus,
  PurchaseStatus,
} from "@/utils/types/purchase.types"

const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize"

const PO_STYLES: Record<PurchaseOrderStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  received: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const PURCHASE_STYLES: Record<PurchaseStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  posted: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  paid: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
}

export const PurchaseOrderBadge = ({ status }: { status: PurchaseOrderStatus }) => (
  <span className={`${base} ${PO_STYLES[status]}`}>{status}</span>
)

export const PurchaseStatusBadge = ({ status }: { status: PurchaseStatus }) => (
  <span className={`${base} ${PURCHASE_STYLES[status]}`}>{status}</span>
)

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <span className={`${base} ${PAYMENT_STYLES[status]}`}>{status}</span>
)