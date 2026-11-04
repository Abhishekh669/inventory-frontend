"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2, Package, PackageSearch, Plus, RefreshCw, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GetProductsParams, ProductsListType } from "@/utils/types/product.types"
import type { User } from "@/utils/types/user.types"
import { deleteProducts } from "@/utils/action/products/product.delete"
import { DEFAULT_FILTER_DRAFT, ProductFilterDraft, ProductFilters } from "../category/slug/ProductFilters"
import { useGetProducts } from "@/utils/hooks/tanstack/products/use-get-all-products"
import { ProductsTable } from "./ProductTable"
import { TablePagination } from "../category/slug/TablePagination"
import { EditProductSheet } from "../category/slug/EditProductSheet"

function toParams(draft: ProductFilterDraft, page: number): GetProductsParams {
  const stock = draft.current_stock.trim()
  const from = draft.from_date
  const to = draft.to_date
  const rangeOk = !from || !to || from <= to

  return {
    page,
    limit: draft.limit,
    ...(draft.name.trim() ? { name: draft.name.trim() } : {}),
    ...(stock ? { current_stock: Number(stock), greater_than: draft.greater_than } : {}),
    ...(from ? { from_date: from } : {}),
    ...(to && rangeOk ? { to_date: to } : {}),
  }
}

export function ProductsView({ user }: { user: User }) {
  const router = useRouter()
  const [draft, setDraft] = useState<ProductFilterDraft>(DEFAULT_FILTER_DRAFT)
  const [applied, setApplied] = useState<ProductFilterDraft>({
    ...DEFAULT_FILTER_DRAFT,
    current_stock: "",
  })
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [confirmIds, setConfirmIds] = useState<string[]>([])
  const [editing, setEditing] = useState<ProductsListType | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const params = useMemo(() => toParams(applied, page), [applied, page])
  const result = useGetProducts(params)
  const products = result.data?.products ?? []
  const total = result.data?.total ?? 0
  const hasFilters = Boolean(
    applied.name.trim() || applied.current_stock.trim() || applied.from_date || applied.to_date
  )

  const goToCategories = () => router.push("/categories")

  useEffect(() => {
    setSelected([])
  }, [page, applied])

  // if the last page becomes empty (after deleting), step back to the last valid page
  useEffect(() => {
    if (!result.isLoading && !result.isFetching && products.length === 0 && page > 0 && total > 0) {
      setPage(Math.ceil(total / applied.limit) - 1)
    }
  }, [products.length, total, page, applied.limit, result.isLoading, result.isFetching])

  function applyFilters() {
    setApplied(draft)
    setPage(0)
  }

  function clearFilters() {
    setDraft({ ...DEFAULT_FILTER_DRAFT })
    setApplied({ ...DEFAULT_FILTER_DRAFT, current_stock: "" })
    setPage(0)
  }

  function performDelete(ids: string[]) {
    startDelete(async () => {
      const res = await deleteProducts(ids)
      if (!res.success) {
        toast.error(res.error || "Failed to delete products")
        return
      }
      toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} deleted`)
      setSelected([])
      setConfirmIds([])
      result.refetch()
    })
  }

  if (!user) return null

  return (
    <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 p-4 sm:p-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold leading-none tracking-tight">Products</h1>
              <Badge variant="secondary" className="tabular-nums">
                {total}
                {result.isFetching && <RefreshCw className="ml-1 size-3 animate-spin" aria-label="Refreshing" />}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Review prices and stock, edit details, or remove products.
            </p>
          </div>
        </div>

        <Button onClick={goToCategories} className="self-start sm:self-auto">
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Button>
      </header>

      <ProductFilters value={draft} onChange={setDraft} onApply={applyFilters} onClear={clearFilters} />

      {result.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Unable to load products</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            {result.error instanceof Error ? result.error.message : "Something went wrong"}
            <Button variant="outline" size="sm" onClick={() => result.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : products.length === 0 && !result.isLoading ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-card/50 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {hasFilters ? (
              <PackageSearch className="size-7" aria-hidden="true" />
            ) : (
              <Package className="size-7" aria-hidden="true" />
            )}
          </div>
          <div className="max-w-sm">
            <h2 className="font-semibold">
              {hasFilters ? "No products match your filters" : "No products yet"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try a different name, date range or stock level, or reset the filters."
                : "Products are added from a category. Pick a category to create your first one."}
            </p>
          </div>
          {hasFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Reset filters
            </Button>
          ) : (
            <Button onClick={goToCategories}>
              <Plus className="size-4" aria-hidden="true" />
              Go to categories
            </Button>
          )}
        </div>
      ) : (
        <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
          {selected.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-b bg-primary/5 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{selected.length} selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground"
                  onClick={() => setSelected([])}
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Clear
                </Button>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setConfirmIds(selected)}>
                <Trash2 className="size-4" aria-hidden="true" />
                Delete selected
              </Button>
            </div>
          )}

          <ProductsTable
            products={products}
            selected={selected}
            onSelectionChange={setSelected}
            onEdit={setEditing}
            onDelete={(id) => setConfirmIds([id])}
            isLoading={result.isLoading}
            isDimmed={Boolean(result.isPlaceholderData)}
          />

          <TablePagination
            page={page}
            limit={applied.limit}
            total={total}
            hasMore={result.data?.has_more ?? false}
            onPageChange={(nextPage) => setPage(Math.max(0, nextPage))}
          />
        </section>
      )}

      <EditProductSheet
        product={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null)
          result.refetch()
        }}
      />

      <AlertDialog open={confirmIds.length > 0} onOpenChange={(open) => !open && !isDeleting && setConfirmIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {confirmIds.length} product{confirmIds.length === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The selected product{confirmIds.length === 1 ? "" : "s"} will be marked inactive. Existing bills
              and price history are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" disabled={isDeleting} onClick={() => performDelete(confirmIds)}>
              {isDeleting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}