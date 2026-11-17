"use client"

import { Fragment, useMemo, useState } from "react"
import { AlertCircle, ChevronDown, Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/utils/helper/format"
import { useGetSupplierPayments } from "@/utils/hooks/tanstack/supplier-payment/use-get-supplier-payments"
import type {
  SupplierPayment,
  SupplierPaymentFilterValues,
  SupplierPaymentStatus,
} from "@/utils/types/supplier-payment.types"

type FilterDraft = { status: SupplierPaymentStatus | "all"; from_date: string; to_date: string }

const DEFAULT_DRAFT: FilterDraft = { status: "all", from_date: "", to_date: "" }

const STATUS_LABEL: Record<SupplierPaymentStatus, string> = {
  unallocated: "Unallocated",
  partial: "Partly used",
  allocated: "Fully used",
}

const STATUS_STYLE: Record<SupplierPaymentStatus, string> = {
  unallocated: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  allocated: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
}

function toFilters(draft: FilterDraft): SupplierPaymentFilterValues {
  return {
    status: draft.status === "all" ? undefined : draft.status,
    from_date: draft.from_date || undefined,
    to_date: draft.to_date || undefined,
  }
}

function money(value: string | number) {
  return `Rs. ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function statusOf(p: SupplierPayment): SupplierPaymentStatus {
  const amount = Number(p.amount)
  const allocated = Number(p.allocated_amount)
  if (allocated >= amount) return "allocated"
  if (allocated > 0) return "partial"
  return "unallocated"
}

function StatusBadge({ status }: { status: SupplierPaymentStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-card px-4 py-3 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function SupplierPaymentList({ supplierId }: { supplierId: string }) {
  const [draft, setDraft] = useState<FilterDraft>(DEFAULT_DRAFT)
  const [applied, setApplied] = useState<SupplierPaymentFilterValues>({})
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
  } = useGetSupplierPayments(supplierId, applied)

  const payments = useMemo(() => data?.pages.flatMap((page) => page.payments) ?? [], [data])
  const total = data?.pages[0]?.total ?? 0
  const summary = data?.pages[0]?.summary
  const hasFilters = Object.values(applied).some(Boolean)

  function clearFilters() {
    setDraft(DEFAULT_DRAFT)
    setApplied({})
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {/* summary from supplier_financial_summaries */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard label="Total purchases" value={summary ? money(summary.total_purchases) : "-"} />
        <SummaryCard label="Total paid" value={summary ? money(summary.total_payments) : "-"} />
        <SummaryCard label="Total returns" value={summary ? money(summary.total_returns) : "-"} />
        <SummaryCard
          label="Advance available"
          value={summary ? money(summary.unallocated_payments) : "-"}
          hint="Paid but not used on a bill"
        />
        <SummaryCard
          label="Amount due"
          value={summary ? money(summary.total_due) : "-"}
          hint="Purchases - returns - used payments"
        />
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="sp-from">From</label>
          <Input
            id="sp-from"
            type="date"
            value={draft.from_date}
            max={draft.to_date || undefined}
            onChange={(e) => setDraft((d) => ({ ...d, from_date: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="sp-to">To</label>
          <Input
            id="sp-to"
            type="date"
            value={draft.to_date}
            min={draft.from_date || undefined}
            onChange={(e) => setDraft((d) => ({ ...d, to_date: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor="sp-status">Status</label>
          <select
            id="sp-status"
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={draft.status}
            onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as FilterDraft["status"] }))}
          >
            <option value="all">All</option>
            <option value="unallocated">Unallocated</option>
            <option value="partial">Partly used</option>
            <option value="allocated">Fully used</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setApplied(toFilters(draft))}>Apply</Button>
          <Button variant="outline" onClick={clearFilters}>Reset</Button>
        </div>
      </div>

      {/* list */}
      {isLoading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading payments">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError && payments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
          <AlertCircle className="size-6 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Couldn&apos;t load payments</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Check your connection and try again."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RotateCcw data-icon="inline-start" /> Try again
          </Button>
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
          <p className="text-sm font-medium">
            {hasFilters ? "No payments match these filters" : "No payments yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilters ? "Try a different status or date range." : "Payments recorded for this supplier will appear here."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>Reset filters</Button>
          )}
        </div>
      ) : (
        <>
          <div className={`rounded-2xl border bg-card shadow-sm ${isPlaceholderData ? "opacity-60" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Unused</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const expanded = openId === p.id
                  return (
                    <Fragment key={p.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => setOpenId(expanded ? null : p.id)}
                        aria-expanded={expanded}
                      >
                        <TableCell>
                          <ChevronDown
                            className={`size-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                            aria-label={expanded ? "Hide allocations" : "Show allocations"}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(p.payment_date)}</TableCell>
                        <TableCell className="capitalize">{p.payment_type}</TableCell>
                        <TableCell className="capitalize">{p.payment_method}</TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{money(p.amount)}</TableCell>
                        <TableCell className="text-right tabular-nums">{money(p.allocated_amount)}</TableCell>
                        <TableCell className="text-right tabular-nums">{money(p.unallocated_amount)}</TableCell>
                        <TableCell><StatusBadge status={statusOf(p)} /></TableCell>
                        <TableCell className="max-w-[240px] truncate text-muted-foreground">
                          {p.note || "-"}
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={9} className="bg-muted/30 p-4">
                            <p className="mb-2 text-xs text-muted-foreground">
                              Recorded {formatDate(p.created_at)}
                              {p.created_by_name ? ` by ${p.created_by_name}` : ""}
                            </p>
                            {p.allocations.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                This payment has not been used on any purchase yet.
                              </p>
                            ) : (
                              <div className="rounded-lg border bg-card">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Bill no</TableHead>
                                      <TableHead>Purchase date</TableHead>
                                      <TableHead className="text-right">Purchase total</TableHead>
                                      <TableHead className="text-right">Paid from this payment</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {p.allocations.map((a) => (
                                      <TableRow key={a.purchase_id}>
                                        <TableCell className="font-mono text-xs">{a.supplier_bill_no}</TableCell>
                                        <TableCell>{formatDate(a.purchase_date)}</TableCell>
                                        <TableCell className="text-right tabular-nums">{money(a.purchase_total)}</TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">{money(a.allocated_amount)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center gap-2 py-2">
            {hasNextPage && (
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage && <Loader2 data-icon="inline-start" className="animate-spin" />}
                {isFetchingNextPage ? "Loading..." : isFetchNextPageError ? "Try again" : "Load more"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground" aria-live="polite">
              Showing {payments.length} of {total}
            </p>
          </div>
        </>
      )}
    </div>
  )
}