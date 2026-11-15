import Link from "next/link"
import { Eye } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/helper/format"
import type { PurchaseListItem } from "@/utils/types/purchase.types"
import { PaymentStatusBadge, PurchaseOrderBadge, PurchaseStatusBadge } from "./PurchaseBadge"

const money = (v: string | number | null | undefined) =>
  `Rs ${(Number(v) || 0).toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

function Amount({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={strong ? "text-sm font-semibold" : "text-sm"}>{money(value)}</p>
    </div>
  )
}

export function PurchaseListCard({ item }: { item: PurchaseListItem }) {
  const po = item.purchase_order_data
  const purchase = item.purchase_data

  return (
    <article className="rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold sm:text-base">
              {po.purchase_order_title || "Untitled order"}
            </span>
            <PurchaseOrderBadge status={po.purchase_order_status} />
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {po.purchase_order_number}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{po.supplier_name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ordered {formatDate(po.purchase_ordered_at)}
            {po.purchase_order_by_name && ` by ${po.purchase_order_by_name}`}
          </p>
        </div>

        {purchase && (
          <Link
            href={`/all-purchase/${purchase.purchase_id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 shrink-0 gap-2")}
          >
            <Eye className="size-4" aria-hidden="true" />
            View purchase
          </Link>
        )}
      </div>

      <div className="border-t px-4 py-3 sm:px-5">
        {purchase ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs">Bill {purchase.supplier_bill_no}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(purchase.purchase_date)}
              </span>
              <PurchaseStatusBadge status={purchase.purchase_status} />
              <PaymentStatusBadge status={purchase.payment_status} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Amount label="Total" value={purchase.total} strong />
              <Amount label="Paid" value={purchase.paid_amount} />
              <Amount label="Returned" value={purchase.returned_amount} />
              <Amount label="Due" value={purchase.due_amount} strong />
            </div>

            {purchase.purchase_note && (
              <p className="truncate text-sm text-muted-foreground">{purchase.purchase_note}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No purchase recorded for this order yet.</p>
        )}
      </div>
    </article>
  )
}