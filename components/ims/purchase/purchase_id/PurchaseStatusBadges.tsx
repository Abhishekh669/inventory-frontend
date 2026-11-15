import type { PaymentStatus, PurchaseStatus } from "@/utils/types/purchase.types"
import { Pill } from "./PurchaseDetailsParts";

const purchaseTone: Record<PurchaseStatus, { label: string; cls: string; dot: string }> = {
  draft: { label: "Draft", cls: "border-gray-300 bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground", dot: "bg-gray-400" },
  posted: { label: "Posted", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400", dot: "bg-red-500" },
}

const paymentTone: Record<PaymentStatus, { label: string; cls: string; dot: string }> = {
  unpaid: { label: "Unpaid", cls: "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400", dot: "bg-red-500" },
  partial: { label: "Partially paid", cls: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400", dot: "bg-amber-500" },
  paid: { label: "Paid", cls: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400", dot: "bg-emerald-500" },
}

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  const t = purchaseTone[status]
  return <Pill className={t.cls} dot={t.dot}>{t.label}</Pill>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = paymentTone[status]
  return <Pill className={t.cls} dot={t.dot}>{t.label}</Pill>
}