// components/supplier/supplier-returns-table.tsx
"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { SupplierReturnItem } from "@/utils/types/purchase.types"
import { deletePurchaseReturn } from "@/utils/action/purchase/purchase.delete"
import {
  useGetSupplierReturns,
} from "@/utils/hooks/tanstack/purchase/use-get-purchase-return-by-supplier"
import {
  SUPPLIER_LIST_PAGE_SIZE,
  SUPPLIER_PURCHASES_KEY,
  SUPPLIER_RETURNS_KEY,
} from "@/utils/hooks/tanstack/purchase/use-get-all-purchse-by-supplier"
import {
  ConfirmDeleteDialog,
  CursorPagination,
  formatMoney,
  SkeletonRows,
  useCursorPagination,
} from "../purchase/SupplierListShared"
import { useSupplier } from "../SupplierContext"

const COLS = 6
const EMPTY_DRAFT = { from: "", to: "" }
type Draft = typeof EMPTY_DRAFT

export function SupplierReturnsTable() {
  const {supplier} = useSupplier();
  const supplierId = supplier.id
  const router = useRouter()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<Draft>(EMPTY_DRAFT)

  const [target, setTarget] = useState<SupplierReturnItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, startDelete] = useTransition()

  const filters = useMemo(
    () => ({ from_date: applied.from || undefined, to_date: applied.to || undefined }),
    [applied]
  )

  const pager = useCursorPagination(JSON.stringify(filters))
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSupplierReturns(
    supplierId,
    filters,
    pager.cursor
  )

  const items = data?.items ?? []
  const hasFilters = !!applied.from || !!applied.to
  const invalidRange = !!draft.from && !!draft.to && draft.from > draft.to
  const hasChanges = draft.from !== applied.from || draft.to !== applied.to

  const applyFilters = () => {
    if (invalidRange) return
    setApplied(draft)
  }

  const clearFilters = () => {
    setDraft(EMPTY_DRAFT)
    setApplied(EMPTY_DRAFT)
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applyFilters()
  }

  const confirmDelete = () => {
    if (!target) return
    setDeleteError(null)
    startDelete(async () => {
      const res = await deletePurchaseReturn(target.purchase_id, target.purchase_return_id)
      if (!res.success) return setDeleteError(res.error ?? "Could not delete the return.")

      setTarget(null)
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_RETURNS_KEY] })
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_PURCHASES_KEY] }) // returned / due amounts change
      queryClient.invalidateQueries({ queryKey: ["get-all-purchases"] })
      if (items.length === 1 && pager.hasPrev) pager.goPrev()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="sr-from">From date</Label>
          <Input
            id="sr-from"
            type="date"
            value={draft.from}
            max={draft.to || undefined}
            onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
            onKeyDown={onEnter}
            className="w-40"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sr-to">To date</Label>
          <Input
            id="sr-to"
            type="date"
            value={draft.to}
            min={draft.from || undefined}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
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
              <TableHead>Return no</TableHead>
              <TableHead>Bill no</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows rows={8} cols={COLS} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-32 text-center">
                  <p className="text-sm text-destructive">
                    {(error as Error)?.message || "Could not load returns."}
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
                    ? "No returns match these dates."
                    : "No purchase returns for this supplier yet."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((r) => (
                <TableRow key={r.purchase_return_id}>
                  <TableCell className="font-medium">{r.return_no}</TableCell>
                  <TableCell>{r.supplier_bill_no}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{r.return_date}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatMoney(r.total)}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate" title={r.note ?? undefined}>
                    {r.note ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`View purchase ${r.supplier_bill_no}`}
                        onClick={() => router.push(`/all-purchases/${r.purchase_id}`)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label={`Delete return ${r.return_no}`}
                        onClick={() => {
                          setDeleteError(null)
                          setTarget(r)
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CursorPagination
        page={pager.page}
        pageSize={SUPPLIER_LIST_PAGE_SIZE}
        shown={items.length}
        total={data?.total ?? 0}
        hasPrev={pager.hasPrev}
        hasNext={!!data?.has_more && !!data.next_cursor}
        loading={isFetching}
        onPrev={pager.goPrev}
        onNext={() => data?.next_cursor && pager.goNext(data.next_cursor)}
      />

      <ConfirmDeleteDialog
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        title={`Delete return ${target?.return_no ?? ""}?`}
        description="The returned quantities are added back to stock and the purchase's returned amount is reduced. This cannot be undone."
        pending={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </div>
  )
}