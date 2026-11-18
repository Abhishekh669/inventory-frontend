// NEW FILE: components/stock-movement/stock-movement-table.tsx
"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { PickedProduct, ProductFilterPicker } from "./ProudctFilterPicker"
import { StockMovementType } from "@/utils/types/stock.movement.types"
import { CursorPagination, SkeletonRows, useCursorPagination } from "../supplier/purchase/SupplierListShared"
import { STOCK_MOVEMENTS_PAGE_SIZE, useGetStockMovements } from "@/utils/hooks/tanstack/stock-movement/use-get-stock-movement"

const ALL = "all"
const COLS = 7

const TYPE_LABELS: Record<string, string> = {
  opening: "Opening",
  purchase: "Purchase",
  sale: "Sale",
  purchase_return: "Purchase return",
  sale_return: "Sale return",
  adjustment: "Adjustment",
}

const TYPE_ITEMS: Record<string, string> = { [ALL]: "All types", ...TYPE_LABELS }

const TYPE_STYLES: Record<string, string> = {
  opening: "bg-muted text-muted-foreground",
  purchase: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  sale: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  purchase_return: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  sale_return: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  adjustment: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
}

const formatQty = (v: string) => Number(v).toLocaleString("en-NP", { maximumFractionDigits: 3 })

// what the inputs hold while the user is choosing; it is only used after "Apply"
interface Draft {
  product: PickedProduct | null
  type: string
  from: string
  to: string
}
const EMPTY_DRAFT: Draft = { product: null, type: ALL, from: "", to: "" }

export function StockMovementTable() {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<Draft>(EMPTY_DRAFT)

  // the server only gets the product id
  const filters = useMemo(
    () => ({
      product_id: applied.product?.id,
      type: applied.type === ALL ? undefined : (applied.type as StockMovementType),

      from_date: applied.from || undefined,
      to_date: applied.to || undefined,
    }),
    [applied]
  )

  const pager = useCursorPagination(JSON.stringify(filters))
  const { data, isLoading, isFetching, isError, error, refetch } = useGetStockMovements(
    filters,
    pager.cursor
  )

  const items = data?.items ?? []
  const hasFilters = Object.values(filters).some(Boolean)
  const invalidRange = !!draft.from && !!draft.to && draft.from > draft.to
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(applied)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))
  const applyFilters = () => {
    if (!invalidRange) setApplied(draft)
  }
  const clearFilters = () => {
    setDraft(EMPTY_DRAFT)
    setApplied(EMPTY_DRAFT)
  }
  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label>Product</Label>
          <ProductFilterPicker value={draft.product} onChange={(product) => patch({ product })} />
        </div>

        <div className="grid gap-1.5">
          <Label>Type</Label>
          <Select
            items={TYPE_ITEMS}
            value={draft.type}
            onValueChange={(v) => patch({ type: v ?? ALL })}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="sm-from">From date</Label>
          <Input
            id="sm-from"
            type="date"
            value={draft.from}
            max={draft.to || undefined}
            onChange={(e) => patch({ from: e.target.value })}
            onKeyDown={onEnter}
            className="w-40"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="sm-to">To date</Label>
          <Input
            id="sm-to"
            type="date"
            value={draft.to}
            min={draft.from || undefined}
            onChange={(e) => patch({ to: e.target.value })}
            onKeyDown={onEnter}
            className="w-40"
          />
        </div>

        <Button onClick={applyFilters} disabled={invalidRange || !hasChanges}>
          Apply
        </Button>
        {(hasFilters || hasChanges) && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {invalidRange && (
        <p className="text-sm text-destructive">From date must be on or before the to date.</p>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Qty change</TableHead>
              <TableHead className="text-right">Balance after</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows rows={8} cols={COLS} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-32 text-center">
                  <p className="text-sm text-destructive">
                    {(error as Error)?.message || "Could not load stock movements."}
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                    Try again
                  </Button>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-32 text-center text-sm text-muted-foreground">
                  {hasFilters
                    ? "No stock movements match these filters."
                    : "No stock movements yet."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((m) => {
                const qty = Number(m.qty_change)
                return (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap tabular-nums">{m.movement_date}</TableCell>
                    <TableCell>
                      <div className="font-medium">{m.product_name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{m.product_sku}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border-transparent", TYPE_STYLES[m.type])}
                      >
                        {TYPE_LABELS[m.type] ?? m.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums font-medium",
                        qty > 0 && "text-green-600 dark:text-green-400",
                        qty < 0 && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {qty > 0 ? "+" : ""}
                      {formatQty(m.qty_change)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatQty(m.balance_after)}</TableCell>
                    <TableCell>
                      {m.user_name ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate" title={m.note ?? undefined}>
                      {m.note ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CursorPagination
        page={pager.page}
        pageSize={STOCK_MOVEMENTS_PAGE_SIZE}
        shown={items.length}
        total={data?.total ?? 0}
        hasPrev={pager.hasPrev}
        hasNext={!!data?.has_more && !!data.next_cursor}
        loading={isFetching}
        onPrev={pager.goPrev}
        onNext={() => data?.next_cursor && pager.goNext(data.next_cursor)}
      />
    </div>
  )
}