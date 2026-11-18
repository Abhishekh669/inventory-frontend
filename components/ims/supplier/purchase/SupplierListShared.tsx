// components/purchase/SupplierListShared.tsx
"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ---------- cursor pagination with Previous / Next ----------
// The server only gives "next_cursor", so we remember the cursors of the pages we have visited.
// Previous = pop the stack, Next = push next_cursor. Changing the filters (resetKey) starts at page 1
// in the same render, so no request is made with an old cursor and new filters.
export function useCursorPagination(resetKey: string) {
  const [state, setState] = useState<{ key: string; stack: (string | undefined)[] }>({
    key: resetKey,
    stack: [undefined],
  })
  const stack = state.key === resetKey ? state.stack : [undefined]

  return {
    cursor: stack[stack.length - 1],
    page: stack.length,
    hasPrev: stack.length > 1,
    goNext: (nextCursor: string) => setState({ key: resetKey, stack: [...stack, nextCursor] }),
    goPrev: () => setState({ key: resetKey, stack: stack.length > 1 ? stack.slice(0, -1) : stack }),
  }
}

export function CursorPagination({
  page,
  pageSize,
  shown,
  total,
  hasPrev,
  hasNext,
  loading,
  onPrev,
  onNext,
}: {
  page: number
  pageSize: number
  shown: number
  total: number
  hasPrev: boolean
  hasNext: boolean
  loading?: boolean
  onPrev: () => void
  onNext: () => void
}) {
  const from = shown === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + shown

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-sm text-muted-foreground tabular-nums">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev || loading}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext || loading}>
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------- confirm delete ----------

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  pending,
  error,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  pending: boolean
  error: string | null
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- small display helpers ----------

export const formatMoney = (value: string) =>
  `Rs. ${Number(value).toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  partial: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  unpaid: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
}

const STATUS_STYLES: Record<string, string> = {
  posted: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
}

export function StatusBadge({ value, kind }: { value: string; kind: "payment" | "purchase" }) {
  const styles = kind === "payment" ? PAYMENT_STYLES : STATUS_STYLES
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", styles[value])}>
      {value}
    </Badge>
  )
}

export function SkeletonRows({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}>
              <Skeleton className="h-5 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}