import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/utils/helper/format"
import { getInitials } from "@/utils/helper/supplier"
import type { PurchaseOrderInfo, PurchaseSupplier } from "@/utils/types/purchase.types"
import { DetailRow, Pill, SectionCard } from "./PurchaseDetailsParts"
import { PurchaseOrderStatusBadge } from "../../purchase-order/PurchaseOrderStatusBar"

export function PurchaseSupplierCard({ supplier }: { supplier: PurchaseSupplier }) {
  return (
    <SectionCard
      title="Supplier"
      className="h-full"
      action={
        <div className="flex items-center gap-2">
          {!supplier.is_active && <Pill className="text-muted-foreground">Inactive</Pill>}
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(supplier.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      }
    >
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <DetailRow
          label="Name"
          className="sm:col-span-2"
          value={
            <Link href={`/suppliers/${supplier.id}`} className="hover:underline">
              {supplier.name}
            </Link>
          }
        />
        <DetailRow label="Contact" value={supplier.contact_person} />
        <DetailRow label="Phone" value={supplier.phone} />
        <DetailRow label="PAN no" value={supplier.pan_no} />
        <DetailRow label="Address" value={supplier.address} />
      </div>
    </SectionCard>
  )
}

export function PurchaseOrderCard({ order }: { order: PurchaseOrderInfo }) {
  return (
    <SectionCard
      title="Purchase order"
      className="h-full"
      action={<PurchaseOrderStatusBadge status={order.status} />}
    >
      <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <DetailRow label="PO no" value={<span className="font-mono">{order.po_no}</span>} />
        <DetailRow label="Title" value={order.title} />
        <DetailRow label="Ordered on" value={formatDate(order.order_date)} />
        <DetailRow label="Expected" value={order.expected_date ? formatDate(order.expected_date) : null} />
        <DetailRow label="Ordered by" value={order.created_by_name} />
        <DetailRow label="Note" value={order.note} />
      </div>
    </SectionCard>
  )
}