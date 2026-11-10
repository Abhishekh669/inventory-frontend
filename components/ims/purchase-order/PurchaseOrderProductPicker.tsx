"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Check, Plus, RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatQuantity } from "@/utils/helper/format"
import type { ProductsListType } from "@/utils/types/product.types"
import { useGetProducts } from "@/utils/hooks/tanstack/products/use-get-all-products"

const RESULT_LIMIT = 8

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function PurchaseOrderProductPicker({
  addedIds,
  onAdd,
  disabled,
}: {
  addedIds: Set<string>
  onAdd: (product: ProductsListType) => void
  disabled?: boolean
}) {
  const [search, setSearch] = useState("")
  const name = useDebounced(search.trim())

  const { data, isLoading, isError, isPlaceholderData, refetch } = useGetProducts({
    page: 0,
    limit: RESULT_LIMIT,
    name: name || undefined,
  })

  const products = (data?.products ?? []).filter((product) => product.is_active)
  const total = data?.total ?? 0

  return (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="po-product-search" className="text-xs font-medium text-muted-foreground">
        Search products
      </Label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="po-product-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Type a product name"
          className="h-10 rounded-lg bg-background pl-9"
          maxLength={200}
          autoComplete="off"
        />
      </div>

      <div>
        {isLoading ? (
          <div className="divide-y overflow-hidden rounded-xl border bg-background" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3.5 py-3">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-background px-4 py-8 text-center">
            <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load products.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw data-icon="inline-start" /> Try again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed bg-background px-4 py-8 text-center text-sm text-muted-foreground">
            {name ? "No products match this search." : "No products yet."}
          </p>
        ) : (
          <ul
            className={`max-h-64 divide-y overflow-y-auto rounded-xl border bg-background ${
              isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {products.map((product) => {
              const added = addedIds.has(product.id)
              return (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                        {product.category_name}
                      </span>
                      <span>
                        Stock {formatQuantity(product.current_stock, product.allow_decimal)} {product.unit_name}
                      </span>
                    </p>
                  </div>
                  {added ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      <Check className="size-3.5" aria-hidden="true" /> Added
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 rounded-lg"
                      disabled={disabled}
                      onClick={() => onAdd(product)}
                      aria-label={`Add ${product.name}`}
                    >
                      <Plus data-icon="inline-start" /> Add
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {!isLoading && !isError && total > products.length && (
        <p className="text-xs text-muted-foreground">
          Showing the first {products.length} of {total} products. Type a name to narrow the list.
        </p>
      )}
    </div>
  )
}