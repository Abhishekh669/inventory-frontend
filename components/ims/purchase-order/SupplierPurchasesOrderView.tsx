"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  ChevronDown,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/utils/helper/format"
import type { PurchaseOrderFilterValues, PurchaseOrderSummary } from "@/utils/types/purchase-order.types"
import type { Supplier } from "@/utils/types/suppliers.types"
import { DeletePurchaseOrderDialog } from "./DeletePurchaseOrderDialog"
import {
  DEFAULT_PURCHASE_ORDER_FILTER_DRAFT,
  PurchaseOrderFiltersBar,
  type PurchaseOrderFilterDraft,
} from "./PurchaseOrderFilterBar"
import { PurchaseOrderFormDialog } from "./PurchaseOrderFormDialog"
import { PurchaseOrderItemsTable } from "./PurchaseOrderItemTable"
import { PurchaseOrderStatusBadge } from "./PurchaseOrderStatusBar"
import { SupplierProfileCard } from "./SupplierProfileCard"
import { useGetPurchaseOrdersBySupplier } from "@/utils/hooks/tanstack/purchase-order/use-get-purchase-order-by-supplier"
import { CreatePurchaseDialog } from "../supplier/purchase/CreatePurchaseDialog"

function toFilters(draft: PurchaseOrderFilterDraft): PurchaseOrderFilterValues {
  return {
    status: draft.status === "all" ? undefined : draft.status,
    search: draft.search.trim() || undefined,
    from_date: draft.from_date || undefined,
    to_date: draft.to_date || undefined,
  }
}

const canEdit = (po: PurchaseOrderSummary) => po.status === "draft" || po.status === "sent"
const canDelete = (po: PurchaseOrderSummary) => po.status === "draft" || po.status === "cancelled"
const canPurchase = (po: PurchaseOrderSummary) => po.status === "sent"
const canEditPurchase = (po: PurchaseOrderSummary) =>
  (po.status === "partial" || po.status === "received" || po.status === "cancelled") && !!po.purchase_id

export function SupplierPurchaseOrdersView({ supplier }: { supplier: Supplier }) {
  const supplierId = supplier.id
  const supplierActive = supplier.is_active
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<PurchaseOrderFilterDraft>(DEFAULT_PURCHASE_ORDER_FILTER_DRAFT)
  const [applied, setApplied] = useState<PurchaseOrderFilterValues>({})
  const [formState, setFormState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [deleting, setDeleting] = useState<PurchaseOrderSummary | null>(null)
  const [purchasing, setPurchasing] = useState<PurchaseOrderSummary | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refetch,
  } = useGetPurchaseOrdersBySupplier(supplierId, applied)

  const orders = useMemo(() => data?.pages.flatMap((page) => page.purchase_orders) ?? [], [data])
  const total = data?.pages[0]?.total ?? 0
  const hasFilters = Object.values(applied).some(Boolean)

  function clearFilters() {
    setDraft(DEFAULT_PURCHASE_ORDER_FILTER_DRAFT)
    setApplied({})
  }

  function refreshOrders(purchaseOrderId?: string | null) {
    queryClient.invalidateQueries({ queryKey: ["get-purchase-orders-by-supplier", supplierId] })
    if (purchaseOrderId) {
      queryClient.invalidateQueries({ queryKey: ["get-purchase-order-items", purchaseOrderId] })
      queryClient.invalidateQueries({ queryKey: ["get-purchase-order", purchaseOrderId] })
    }
  }

  // a purchase changes supplier balance, product stock and product prices
 function refreshAfterPurchase(purchaseOrderId: string) {
  refreshOrders(purchaseOrderId)
  queryClient.invalidateQueries({ queryKey: ["suppliers"] })
  queryClient.invalidateQueries({ queryKey: ["supplier", supplierId] })
  queryClient.invalidateQueries({ queryKey: ["get-products"] })
  queryClient.invalidateQueries({ queryKey: ["get-all-purchases"] })
}
  return (
    <div className="flex w-full flex-col gap-6">
      <SupplierProfileCard
        supplier={supplier}
        orderCount={isLoading ? null : total}
        onCreate={() => setFormState({ open: true, id: null })}
      />

      <PurchaseOrderFiltersBar
        value={draft}
        onChange={setDraft}
        onApply={() => setApplied(toFilters(draft))}
        onClear={clearFilters}
      />

      <section className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading purchase orders">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="mt-2 h-3 w-32" />
                <Skeleton className="mt-3 h-3 w-full max-w-md" />
              </div>
            ))}
          </div>
        ) : isError && orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
            <AlertCircle className="size-6 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Couldn&apos;t load purchase orders</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Check your connection and try again."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw data-icon="inline-start" /> Try again
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
            <p className="text-sm font-medium">
              {hasFilters ? "No purchase orders match these filters" : "No purchase orders yet"}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasFilters ? "Try a different status or date range." : "Create the first order for this supplier."}
            </p>
            {hasFilters ? (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Reset filters
              </Button>
            ) : (
              <Button size="sm" onClick={() => setFormState({ open: true, id: null })} disabled={!supplierActive}>
                <Plus data-icon="inline-start" />
                New purchase order
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className={`flex w-full flex-col gap-3 ${isPlaceholderData ? "opacity-60" : ""}`}>
              {orders.map((po) => {
                const expanded = openId === po.id
                return (
                  <article key={po.id} className="w-full rounded-2xl border bg-card shadow-sm">
                    <div className="flex w-full items-center gap-2 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
                      <button
                        type="button"
                        className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        onClick={() => setOpenId(expanded ? null : po.id)}
                        aria-expanded={expanded}
                      >
                        <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold sm:text-base">
                                {po.title || "Untitled order"}
                              </span>
                              <PurchaseOrderStatusBadge status={po.status} />
                            </div>
                            <p className="mt-1 font-mono text-xs text-muted-foreground">{po.po_no}</p>
                            {po.note && <p className="mt-1 truncate text-sm text-muted-foreground">{po.note}</p>}
                          </div>
                          <div className="shrink-0 text-xs text-muted-foreground lg:text-right">
                            <p>{formatDate(po.created_at)}</p>
                            {po.created_by_name && <p className="mt-0.5">by {po.created_by_name}</p>}
                          </div>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        {canPurchase(po) && (
                          <Button
                            size="sm"
                            className="h-9 gap-2"
                            disabled={!supplierActive}
                            onClick={() => setPurchasing(po)}
                          >
                            <ShoppingCart className="size-4" />
                            <span className="hidden sm:inline">Purchase</span>
                          </Button>
                        )}
                        {po.purchase_id && (
                          <Link
                            href={`/all-purchases/${po.purchase_id}`}
                            className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 gap-2" })}
                          >
                            <Eye className="size-4" />
                            <span className="hidden sm:inline">View Purchase</span>
                          </Link>
                        )}
                        {canEdit(po) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            aria-label={`Edit ${po.po_no}`}
                            onClick={() => setFormState({ open: true, id: po.id })}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {canDelete(po) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-destructive hover:text-destructive"
                            aria-label={`Delete ${po.po_no}`}
                            onClick={() => setDeleting(po)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9"
                          aria-label={expanded ? "Hide items" : "Show items"}
                          onClick={() => setOpenId(expanded ? null : po.id)}
                        >
                          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                        </Button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="border-t px-4 py-4 sm:px-5">
                        <PurchaseOrderItemsTable purchaseOrderId={po.id} />
                        {canEditPurchase(po) && (
                          <div className="mt-3 flex justify-end">
                            <Link
                              href={`/all-purchases/${po.purchase_id}`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              <Pencil className="mr-2 size-4" />
                              Edit purchase
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              {hasNextPage && (
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  {isFetchingNextPage ? "Loading..." : isFetchNextPageError ? "Try again" : "Load more"}
                </Button>
              )}
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Showing {orders.length} of {total}
              </p>
            </div>
          </>
        )}
      </section>

      <PurchaseOrderFormDialog
        key={formState.id ?? "new"}
        open={formState.open}
        onOpenChange={(open) => setFormState((current) => ({ ...current, open }))}
        supplierId={supplierId}
        supplierName={supplier.name}
        purchaseOrderId={formState.id}
        onSaved={(purchaseOrderId) => {
          refreshOrders(purchaseOrderId)
          setFormState((current) => ({ ...current, open: false }))
        }}
      />

      <DeletePurchaseOrderDialog
        purchaseOrder={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={(purchaseOrderId) => {
          refreshOrders(purchaseOrderId)
          setDeleting(null)
        }}
      />

      {purchasing && (
        <CreatePurchaseDialog
          key={purchasing.id}
          open
          onOpenChange={(open) => !open && setPurchasing(null)}
          supplier={supplier}
          purchaseOrder={purchasing}
          onCreated={(purchaseOrderId) => {
            refreshAfterPurchase(purchaseOrderId)
            setPurchasing(null)
          }}
        />
      )}
    </div>
  )
}