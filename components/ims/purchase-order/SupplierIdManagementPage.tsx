"use client"

import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import type { User } from "@/utils/types/user.types"
import { useGetSupplier } from "@/utils/hooks/tanstack/suppliers/use-get-supplier-by-id"
import { SupplierPurchaseOrdersView } from "./SupplierPurchasesOrderView"

function SupplierDetailManagementPage({ user }: { user: User }) {
  const params = useParams<{ supplier_id: string }>()
  const supplierId = params?.supplier_id
  const { data, isLoading, isError } = useGetSupplier(supplierId ?? "")

  if (!user) return null

  if (!supplierId) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Supplier not found</h1>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
    )
  }

  const supplier = data?.supplier
  if (isError || !supplier) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Supplier not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">It may have been deleted, or the link is wrong.</p>
      </div>
    )
  }

  return <SupplierPurchaseOrdersView supplier={supplier} />
}

export default SupplierDetailManagementPage