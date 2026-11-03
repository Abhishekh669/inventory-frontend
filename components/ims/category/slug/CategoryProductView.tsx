"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { AlertCircle, ChevronRight, Package, Plus, RefreshCw, Trash2 } from "lucide-react"
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useGetProductsByCategory } from "@/utils/hooks/tanstack/categories/use-get-all-product-by-category"
import type { GetProductsParams, ProductsListType } from "@/utils/types/product.types"
import type { User } from "@/utils/types/user.types"
import { deleteProducts } from "@/utils/action/products/product.delete"
import { DEFAULT_FILTER_DRAFT, ProductFilterDraft, ProductFilters } from "./ProductFilters"
import { ProductsTable } from "./ProductTable"
import { TablePagination } from "./TablePagination"
import { EditProductSheet } from "./EditProductSheet"
import { CreateProductsDialog } from "./CreateProductsDialog"

const prettify = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ")

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

export function CategoryProductsView({ slug }: { slug: string; user: User }) {
  const [draft, setDraft] = useState<ProductFilterDraft>(DEFAULT_FILTER_DRAFT)
  const [applied, setApplied] = useState<ProductFilterDraft>({
    ...DEFAULT_FILTER_DRAFT,
    current_stock: "",
  })
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [confirmIds, setConfirmIds] = useState<string[]>([])
  const [editing, setEditing] = useState<ProductsListType | null>(null)
  const [adding, setAdding] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  const params = useMemo(() => toParams(applied, page), [applied, page])
  const result = useGetProductsByCategory(slug, params)
  const products = result.data?.products ?? []
  const total = result.data?.total ?? 0
  const categoryName = products[0]?.category_name ?? prettify(slug)
  const hasFilters = Boolean(
    applied.name.trim() || applied.current_stock.trim() || applied.from_date || applied.to_date
  )

  useEffect(() => {
    setSelected([])
  }, [page, applied])

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
    const next = { ...DEFAULT_FILTER_DRAFT, current_stock: "" }
    setDraft({ ...DEFAULT_FILTER_DRAFT })
    setApplied(next)
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

  return (
    <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/categories" />}>Categories</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{categoryName}</h1>
            <Badge variant="secondary">
              {total} products
              {result.isFetching && <RefreshCw className="ml-1 size-3 animate-spin" />}
            </Badge>
          </div>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus className="mr-1 size-4" />
          Add product
        </Button>
      </div>

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
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <Package className="size-8 text-muted-foreground" />
          <h2 className="font-semibold">
            {hasFilters ? "No products match your filters" : "No products in this category"}
          </h2>
          {hasFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : (
            <Button onClick={() => setAdding(true)}>
              <Plus className="mr-1 size-4" />
              Add product
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {selected.length > 0 && (
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-3">
              <span className="text-sm font-medium">{selected.length} selected</span>
              <Button variant="destructive" size="sm" onClick={() => setConfirmIds(selected)}>
                <Trash2 className="mr-1 size-4" />
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
        </div>
      )}

      <CreateProductsDialog
        open={adding}
        onOpenChange={setAdding}
        slug={slug}
        categoryName={categoryName}
        categoryId={products[0]?.category_id}
        onCreated={() => result.refetch()}
      />

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
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
