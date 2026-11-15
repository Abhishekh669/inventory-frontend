import Link from "next/link"
import { ArrowLeft, Truck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { formatDate } from "@/utils/helper/format"
import type { PurchaseDetail, PurchaseSupplier } from "@/utils/types/purchase.types"
import { PaymentStatusBadge, PurchaseStatusBadge } from "./PurchaseStatusBadges"

export function PurchaseHeader({
  purchase,
  supplier,
}: {
  purchase: PurchaseDetail
  supplier: PurchaseSupplier
}) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/all-purchases"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All purchases
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Bill {purchase.supplier_bill_no}</h1>
            <PurchaseStatusBadge status={purchase.status} />
            <PaymentStatusBadge status={purchase.payment_status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {supplier.name} · Purchased on {formatDate(purchase.purchase_date)}
            {purchase.due_date && <> · Due {formatDate(purchase.due_date)}</>}
          </p>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(purchase.created_at)}
            {purchase.created_by_name && <> by {purchase.created_by_name}</>}
          </p>
        </div>

        <Link href={`/suppliers/${supplier.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Truck className="mr-2 size-4" /> View supplier
        </Link>
      </div>
    </div>
  )
}