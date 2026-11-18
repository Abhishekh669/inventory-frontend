// components/purchase/supplier-purchases-table.tsx
"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { Eye, Trash2 } from "lucide-react"
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
import type {
  PaymentStatus,
  PurchaseStatus,
  SupplierPurchaseItem,
} from "@/utils/types/purchase.types"
import { deletePurchase } from "@/utils/action/purchase/purchase.delete"
import {
  SUPPLIER_LIST_PAGE_SIZE,
  SUPPLIER_PURCHASES_KEY,
  SUPPLIER_RETURNS_KEY,
  useGetSupplierPurchases,
} from "@/utils/hooks/tanstack/purchase/use-get-all-purchse-by-supplier"
import {
  ConfirmDeleteDialog,
  CursorPagination,
  formatMoney,
  SkeletonRows,
  StatusBadge,
  useCursorPagination,
} from "./SupplierListShared"
import { useSupplier } from "../SupplierContext"

const ALL = "all"
const COLS = 11

const PAYMENT_ITEMS: Record<string, string> = {
  [ALL]: "All payments",
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
}

const PURCHASE_STATUS_ITEMS: Record<string, string> = {
  [ALL]: "All statuses",
  draft: "Draft",
  posted: "Posted",
  cancelled: "Cancelled",
}

// what the inputs hold while the user is typing; it is only used after "Apply"
const EMPTY_DRAFT = { payment: ALL, status: ALL, from: "", to: "" }
type Draft = typeof EMPTY_DRAFT

export function SupplierPurchasesTable() {
  const {supplier} = useSupplier();
  const supplierId = supplier.id;
  const router = useRouter()
  const queryClient = useQueryClient()

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<Draft>(EMPTY_DRAFT)

  const [target, setTarget] = useState<SupplierPurchaseItem | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, startDelete] = useTransition()

  const filters = useMemo(
    () => ({
      payment_status: applied.payment === ALL ? undefined : (applied.payment as PaymentStatus),
      purchase_status: applied.status === ALL ? undefined : (applied.status as PurchaseStatus),
      from_date: applied.from || undefined,
      to_date: applied.to || undefined,
    }),
    [applied]
  )

  const pager = useCursorPagination(JSON.stringify(filters))
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSupplierPurchases(
    supplierId,
    filters,
    pager.cursor
  )

  const items = data?.items ?? []
  const hasFilters = Object.values(filters).some(Boolean)
  const invalidRange = !!draft.from && !!draft.to && draft.from > draft.to
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(applied)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

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
      const res = await deletePurchase(target.purchase_id)
      if (!res.success) return setDeleteError(res.error ?? "Could not delete the purchase.")

      setTarget(null)
      // deleting a purchase also removes its returns and changes the supplier's balance
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_PURCHASES_KEY] })
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_RETURNS_KEY] })
      queryClient.invalidateQueries({ queryKey: ["get-all-purchases"] })
      if (items.length === 1 && pager.hasPrev) pager.goPrev() // last row of this page is gone
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <Label>Payment status</Label>
          <Select
            items={PAYMENT_ITEMS}
            value={draft.payment}
            onValueChange={(v) => patch({ payment: v ?? ALL })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All payments</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label>Purchase status</Label>
          <Select
            items={PURCHASE_STATUS_ITEMS}
            value={draft.status}
            onValueChange={(v) => patch({ status: v ?? ALL })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="sp-from">From date</Label>
          <Input
            id="sp-from"
            type="date"
            value={draft.from}
            max={draft.to || undefined}
            onChange={(e) => patch({ from: e.target.value })}
            onKeyDown={onEnter}
            className="w-40"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="sp-to">To date</Label>
          <Input
            id="sp-to"
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
              <TableHead>Bill no</TableHead>
              <TableHead>PO no</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Due</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
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
                    {(error as Error)?.message || "Could not load purchases."}
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
                    ? "No purchases match these filters."
                    : "No purchases from this supplier yet."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((p) => (
                <TableRow key={p.purchase_id}>
                  <TableCell className="font-medium">{p.supplier_bill_no}</TableCell>
                  <TableCell>{p.po_no ?? "—"}</TableCell>
                  <TableCell>{p.supplier_name}</TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{p.purchase_date}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(p.total)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatMoney(p.paid_amount)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatMoney(p.due_amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="payment" value={p.payment_status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge kind="purchase" value={p.status} />
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate" title={p.note ?? undefined}>
                    {p.note ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`View purchase ${p.supplier_bill_no}`}
                        onClick={() => router.push(`/all-purchases/${p.purchase_id}`)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        aria-label={`Delete purchase ${p.supplier_bill_no}`}
                        onClick={() => {
                          setDeleteError(null)
                          setTarget(p)
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
        title={`Delete purchase ${target?.supplier_bill_no ?? ""}?`}
        description="The received quantities are taken back out of stock, its returns are deleted, payments made for it become supplier credit, and the purchase order can be purchased again. This cannot be undone."
        pending={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </div>
  )
}