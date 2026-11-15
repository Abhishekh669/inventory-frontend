"use client"

import { useMemo, useState } from "react"
import type { PurchaseListFilterValues } from "@/utils/types/purchase.types"
import {
  DEFAULT_PURCHASE_LIST_FILTER_DRAFT,
  draftToFilters,
  PurchaseListFilterBar,
  type PurchaseListFilterDraft,
} from "./PurchaseListFilterBar"
import { PurchaseListCard } from "./PurchaseListCard"
import { PurchaseListPagination } from "./PurchaseListPagination"
import {
  PurchaseListEmpty,
  PurchaseListError,
  PurchaseListSkeleton,
} from "./PurchaseListStates"
import { useGetAllPurchases } from "@/utils/hooks/tanstack/purchase/use-get-all-purchase"

export function AllPurchasesView() {
  const [draft, setDraft] = useState<PurchaseListFilterDraft>(DEFAULT_PURCHASE_LIST_FILTER_DRAFT)
  const [applied, setApplied] = useState<PurchaseListFilterValues>({})

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
  } = useGetAllPurchases(applied)

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])
  const total = data?.pages[0]?.total ?? 0
  const hasFilters = Object.values(applied).some(Boolean)

  function clearFilters() {
    setDraft(DEFAULT_PURCHASE_LIST_FILTER_DRAFT)
    setApplied({})
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Purchases</h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${total} purchase order${total === 1 ? "" : "s"}`}
        </p>
      </div>

      <PurchaseListFilterBar
        value={draft}
        onChange={setDraft}
        onApply={() => setApplied(draftToFilters(draft))}
        onClear={clearFilters}
      />

      <section className="flex flex-col gap-3">
        {isLoading ? (
          <PurchaseListSkeleton />
        ) : isError && items.length === 0 ? (
          <PurchaseListError
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        ) : items.length === 0 ? (
          <PurchaseListEmpty hasFilters={hasFilters} onReset={clearFilters} />
        ) : (
          <>
            <div className={`flex flex-col gap-3 ${isPlaceholderData ? "opacity-60" : ""}`}>
              {items.map((item) => (
                <PurchaseListCard key={item.purchase_order_data.purchase_order_id} item={item} />
              ))}
            </div>

            <PurchaseListPagination
              shown={items.length}
              total={total}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isFetchNextPageError={isFetchNextPageError}
              onLoadMore={() => fetchNextPage()}
            />
          </>
        )}
      </section>
    </div>
  )
}