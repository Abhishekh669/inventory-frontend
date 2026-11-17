"use client"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate, formatMoney, isZero } from "@/utils/helper/ledger-fromat"
import type {
  SupplierLedgerEntry,
  SupplierLedgerEntryType,
  SupplierLedgerResponse,
} from "@/utils/types/supplier-payment.types"

type Props = {
  ledger: SupplierLedgerResponse | null
  entries: SupplierLedgerEntry[]
  isLoading: boolean
  isRefreshing: boolean
  hasMore: boolean
}

const TYPE_STYLES: Record<SupplierLedgerEntryType, { label: string; className: string }> = {
  purchase: {
    label: "Purchase",
    className: "border-red-200 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  },
  advance: {
    label: "Advance",
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  payment: {
    label: "Payment",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  advance_allocation: {
    label: "Advance applied",
    className: "border-violet-200 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  },
  return: {
    label: "Return",
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
}

const COLUMN_COUNT = 10

function Amount({ value }: { value: string }) {
  if (isZero(value)) return <span className="text-muted-foreground">—</span>
  return <span>{formatMoney(value)}</span>
}

// shows the amount only when the entry belongs in this column
function AmountCell({
  entry,
  types,
}: {
  entry: SupplierLedgerEntry
  types: SupplierLedgerEntryType[]
}) {
  return (
    <TableCell className="text-right tabular-nums">
      {types.includes(entry.entry_type) ? (
        <Amount value={entry.amount} />
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </TableCell>
  )
}

function EntryRow({ entry }: { entry: SupplierLedgerEntry }) {
  const type = TYPE_STYLES[entry.entry_type]

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">{formatDate(entry.entry_date)}</TableCell>

      <TableCell>
        <Badge variant="outline" className={type.className}>
          {type.label}
        </Badge>
      </TableCell>

      <TableCell className="whitespace-nowrap">
        {entry.reference ?? <span className="text-muted-foreground">—</span>}
      </TableCell>

      <TableCell className="max-w-[260px]">
        <div className="truncate" title={entry.description}>
          {entry.description}
        </div>
        {entry.note && (
          <div className="text-muted-foreground truncate text-xs" title={entry.note}>
            {entry.note}
          </div>
        )}
      </TableCell>

      <AmountCell entry={entry} types={["purchase"]} />
      <AmountCell entry={entry} types={["advance"]} />
      <AmountCell entry={entry} types={["payment", "advance_allocation"]} />
      <AmountCell entry={entry} types={["return"]} />

      <TableCell className="text-right font-medium tabular-nums">
        <Amount value={entry.balance} />
      </TableCell>
      <TableCell className="text-right font-medium text-emerald-600 tabular-nums">
        <Amount value={entry.credit} />
      </TableCell>
    </TableRow>
  )
}

export function SupplierLedgerTable({ ledger, entries, isLoading, isRefreshing, hasMore }: Props) {
  return (
    <div className={`rounded-md border ${isRefreshing ? "opacity-60 transition-opacity" : ""}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Purchase</TableHead>
            <TableHead className="text-right">Advance</TableHead>
            <TableHead className="text-right">Payment</TableHead>
            <TableHead className="text-right">Return</TableHead>
            <TableHead className="text-right">Balance (we owe)</TableHead>
            <TableHead className="text-right">Credit (advance)</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: COLUMN_COUNT }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading && entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="text-muted-foreground h-24 text-center">
                No ledger entries found.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            entries.map((entry) => <EntryRow key={`${entry.entry_type}-${entry.id}`} entry={entry} />)}

          {!isLoading && ledger && !hasMore && (
            <TableRow className="bg-muted/40 font-medium">
              <TableCell colSpan={8}>Opening balance</TableCell>
              <TableCell className="text-right tabular-nums">
                <Amount value={ledger.opening_balance} />
              </TableCell>
              <TableCell className="text-right text-emerald-600 tabular-nums">
                <Amount value={ledger.opening_credit} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        {!isLoading && ledger && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4}>Period total / closing</TableCell>
              <TableCell className="text-right tabular-nums">
                <Amount value={ledger.total_purchases} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <Amount value={ledger.total_advances} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <Amount value={ledger.total_payments} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <Amount value={ledger.total_returns} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                <Amount value={ledger.closing_balance} />
              </TableCell>
              <TableCell className="text-right text-emerald-600 tabular-nums">
                <Amount value={ledger.closing_credit} />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}