"use client"

import { useMemo } from "react"
import Decimal from "decimal.js"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatMoney, formatQuantity } from "@/utils/helper/format"
import { useGetPurchaseOrderItems } from "@/utils/hooks/tanstack/purchase-order/use-get-purchase-order-items"

const head = "h-11 px-4 align-middle text-xs font-medium text-muted-foreground"
const cell = "h-14 px-4 py-0 align-middle"

export function PurchaseOrderItemsTable({ purchaseOrderId }: { purchaseOrderId: string }) {
  const { data, isLoading, isError, error, refetch } = useGetPurchaseOrderItems(purchaseOrderId)
  const items = useMemo(() => data?.items ?? [], [data])

  const expected = useMemo(() => {
    const priced = items.filter((item) => item.line_total !== null)
    if (priced.length === 0) return null
    return {
      total: priced.reduce((sum, item) => sum.plus(item.line_total as string), new Decimal(0)),
      complete: priced.length === items.length,
    }
  }, [items])

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-2 rounded-xl border bg-background p-4" aria-busy="true" aria-label="Loading items">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed bg-background px-4 py-8 text-center">
        <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Couldn't load the items of this order."}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="w-full rounded-xl border border-dashed bg-background py-8 text-center text-sm text-muted-foreground">
        No items in this order.
      </p>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-background">
      <Table className="w-full table-fixed">
        <colgroup>
          <col className="w-[32%]" />
          <col className="w-[17%]" />
          <col className="w-[17%]" />
          <col className="w-[17%]" />
          <col className="w-[17%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className={`${head} text-left`}>Product</TableHead>
            <TableHead className={`${head} text-right`}>Ordered</TableHead>
            <TableHead className={`${head} text-right`}>Received</TableHead>
            <TableHead className={`${head} text-right`}>Expected cost</TableHead>
            <TableHead className={`${head} text-right`}>Line total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const fullyReceived = new Decimal(item.qty_received).gte(item.qty_ordered)
            return (
              <TableRow key={item.id}>
                <TableCell className={`${cell} text-left`}>
                  <p className="truncate font-medium" title={item.product_name}>
                    {item.product_name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">{item.product_sku}</p>
                </TableCell>
                <TableCell className={`${cell} text-right tabular-nums`}>
                  {formatQuantity(item.qty_ordered, item.allow_decimal)}{" "}
                  <span className="text-muted-foreground">{item.unit_name}</span>
                </TableCell>
                <TableCell
                  className={`${cell} text-right tabular-nums ${
                    fullyReceived ? "text-green-700 dark:text-green-400" : ""
                  }`}
                >
                  {formatQuantity(item.qty_received, item.allow_decimal)}{" "}
                  <span className="text-muted-foreground">{item.unit_name}</span>
                </TableCell>
                <TableCell className={`${cell} text-right tabular-nums`}>
                  {item.expected_unit_cost ? formatMoney(item.expected_unit_cost) : "-"}
                </TableCell>
                <TableCell className={`${cell} text-right font-medium tabular-nums`}>
                  {item.line_total ? formatMoney(item.line_total) : "-"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {expected && (
        <div className="flex w-full flex-wrap items-center justify-between gap-2 border-t bg-muted/30 px-4 py-3 text-sm">
          <p className="text-xs text-muted-foreground">
            {expected.complete
              ? `${items.length} product${items.length === 1 ? "" : "s"}`
              : "Some lines have no expected cost."}
          </p>
          <p>
            <span className="text-muted-foreground">Expected total </span>
            <span className="text-base font-semibold tabular-nums">{formatMoney(expected.total.toFixed(2))}</span>
          </p>
        </div>
      )}
    </div>
  )
}
