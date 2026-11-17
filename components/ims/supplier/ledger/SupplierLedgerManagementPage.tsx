"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { SupplierLedgerFilterValues } from "@/utils/types/supplier-payment.types"
import { SupplierLedgerFilters } from "./supplier-ledger-filters"
import { SupplierLedgerSummary } from "./supplier-ledger-summary"
import { SupplierLedgerTable } from "./supplier-ledger-table"
import { useSupplier } from "../SupplierContext"
import { useGetSupplierLedger } from "@/utils/hooks/tanstack/supplier-payment/use-get-supplier-ledger"

type Props = {
  supplierId: string
}

function SupplierLedgerManagementPage() {
    const {supplier} = useSupplier();
    const supplierId = supplier.id
    if(!supplierId)return null;
  const [filters, setFilters] = useState<SupplierLedgerFilterValues>({})

  const {
    data,
    error,
    isPending,
    isError,
    isPlaceholderData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetSupplierLedger(supplierId, filters)

  // the period figures are the same on every page, so the first page is enough
  const ledger = data?.pages[0]?.ledger ?? null

  const entries = useMemo(() => data?.pages.flatMap((page) => page.entries) ?? [], [data])

  const total = data?.pages[0]?.total ?? 0

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {ledger?.supplier.name ? `${ledger.supplier.name} — Ledger` : "Supplier ledger"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Every purchase, payment and return on this supplier account, with the running balance.
        </p>
      </div>

      <SupplierLedgerSummary ledger={ledger} isLoading={isPending} />

      <SupplierLedgerFilters value={filters} onChange={setFilters} />

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Could not load the ledger</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{error instanceof Error ? error.message : "Something went wrong"}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <SupplierLedgerTable
            ledger={ledger}
            entries={entries}
            isLoading={isPending}
            isRefreshing={isPlaceholderData}
            hasMore={Boolean(hasNextPage)}
          />

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {entries.length} of {total} entries
            </p>

            {hasNextPage && (
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load more
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default SupplierLedgerManagementPage