"use client"

import { cn } from "@/lib/utils"
import type { User } from "@/utils/types/user.types"
import { usePurchase } from "./PurchaseContext"
import { PurchaseHeader } from "./PurchaseHeader"
import { PurchaseHeaderActions } from "./PurchaseHeaderActions"
import { PurchaseKpiCards } from "./PurchaseKpiCards"
import { PurchaseItemsCard } from "./PurchaseItemsCard"
import { PurchaseOrderItemsCard } from "./PurchaseOrderItemsCard"
import { PurchaseBillSummaryCard } from "./PurchaseBillSummaryCard"
import { PurchaseOrderCard, PurchaseSupplierCard } from "./PurchasePartiesCards"
import { PurchasePaymentsCard } from "./PurchasePaymentCard"
import { PurchaseReturnsCard } from "./PurchaseReturnsCard"

// `user` is passed in by RoutePageWrapper; it is not needed on this page yet
function PurchaseIdManagementPage(_props: { user: User }) {
  const data = usePurchase()
  const purchase = data.purchase_data
  const order = data.purchase_order_data

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PurchaseHeader
        purchase={purchase}
        supplier={data.supplier_data}
        actions={<PurchaseHeaderActions data={data} />}
      />

      <div className={cn("grid gap-4", order && "md:grid-cols-2")}>
        <PurchaseSupplierCard supplier={data.supplier_data} />
        {order && <PurchaseOrderCard order={order} />}
      </div>

      <PurchaseKpiCards purchase={purchase} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <PurchaseItemsCard items={data.purchase_items} hasOrder={!!order} />
          {order && (
            <PurchaseOrderItemsCard orderItems={data.purchase_order_items} purchaseItems={data.purchase_items} />
          )}
          <PurchasePaymentsCard data={data} />
          <PurchaseReturnsCard data={data} />
        </div>

        <aside className="flex flex-col gap-6">
          <PurchaseBillSummaryCard purchase={purchase} />
        </aside>
      </div>
    </div>
  )
}

export default PurchaseIdManagementPage