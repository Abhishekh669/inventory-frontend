import { Info as InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatQuantity } from "@/utils/helper/format"
import { toDecimal } from "@/utils/helper/purchase-cal"
import { money } from "@/utils/helper/purchase-format"
import type { PurchaseOrderItemDetail } from "@/utils/types/purchase-order.types"
import type { PurchaseItemDetail } from "@/utils/types/purchase.types"
import { Pill, SectionCard } from "./PurchaseDetailsParts"

const head = "h-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground"

type RowState = "purchased" | "removed" | "added"

interface Row {
  key: string
  state: RowState
  name: string
  sku: string
  unit: string
  allowDecimal: boolean
  ordered: string | null
  received: string | null
  expected: string | null
  total: string | null
}

function buildRows(orderItems: PurchaseOrderItemDetail[], purchaseItems: PurchaseItemDetail[]): Row[] {
  // a purchase line points at the order line it came from through poi_id
  const boughtByOrderLine = new Map(
    purchaseItems.filter((i) => i.poi_id !== null).map((i) => [i.poi_id as string, i])
  )

  const orderRows: Row[] = orderItems.map((oi) => {
    const bought = boughtByOrderLine.get(oi.id)
    return {
      key: oi.id,
      // an order line with no purchase line was taken out of the purchase
      state: bought ? "purchased" : "removed",
      name: oi.product_name,
      sku: oi.product_sku,
      unit: oi.unit_name,
      allowDecimal: oi.allow_decimal,
      ordered: oi.qty_ordered,
      received: bought ? bought.qty : null,
      expected: oi.expected_unit_cost,
      total: oi.line_total,
    }
  })

  // a purchase line with no order line was added later
  const addedRows: Row[] = purchaseItems
    .filter((i) => i.poi_id === null)
    .map((i) => ({
      key: i.id,
      state: "added" as const,
      name: i.product_name,
      sku: i.product_sku,
      unit: i.unit_name,
      allowDecimal: i.allow_decimal,
      ordered: null,
      received: i.qty,
      expected: null,
      total: null,
    }))

  return [...orderRows, ...addedRows]
}

function StatusPill({ row }: { row: Row }) {
  if (row.state === "removed") {
    return (
      <Pill className="border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
        Removed from purchase
      </Pill>
    )
  }
  if (row.state === "added") {
    return (
      <Pill className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
        Added later
      </Pill>
    )
  }

  const diff = toDecimal(row.received).sub(toDecimal(row.ordered))
  if (diff.isZero()) {
    return (
      <Pill className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
        Complete
      </Pill>
    )
  }
  if (diff.lt(0)) {
    return (
      <Pill className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
        Short by {formatQuantity(diff.abs().toString(), row.allowDecimal)}
      </Pill>
    )
  }
  return (
    <Pill className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
      Extra {formatQuantity(diff.toString(), row.allowDecimal)}
    </Pill>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <p>{children}</p>
    </div>
  )
}

export function PurchaseOrderItemsCard({
  orderItems,
  purchaseItems,
}: {
  orderItems: PurchaseOrderItemDetail[]
  purchaseItems: PurchaseItemDetail[]
}) {
  const rows = buildRows(orderItems, purchaseItems)
  const removed = rows.filter((r) => r.state === "removed").length
  const added = rows.filter((r) => r.state === "added").length

  return (
    <SectionCard
      title="Order vs delivery"
      description="Every line on the purchase order and what happened to it on this purchase."
      contentClassName="p-0"
    >
      {(removed > 0 || added > 0) && (
        <div className="mx-6 mb-4 flex flex-col gap-2">
          {removed > 0 && (
            <Notice>
              {removed} ordered item{removed > 1 ? "s were" : " was"} removed from this purchase, so no stock was
              added for {removed > 1 ? "them" : "it"}.
            </Notice>
          )}
          {added > 0 && (
            <Notice>
              {added} item{added > 1 ? "s were" : " was"} not on the original order and {added > 1 ? "were" : "was"}{" "}
              added later, when the purchase was created.
            </Notice>
          )}
        </div>
      )}

      <div className="overflow-x-auto border-t">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className={cn(head, "pl-6")}>Product</TableHead>
              <TableHead className={cn(head, "text-right")}>Ordered</TableHead>
              <TableHead className={cn(head, "text-right")}>Received</TableHead>
              <TableHead className={head}>Status</TableHead>
              <TableHead className={cn(head, "text-right")}>Expected cost</TableHead>
              <TableHead className={cn(head, "pr-6 text-right")}>Expected total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key} className={cn(row.state === "removed" && "opacity-60")}>
                <TableCell className="pl-6">
                  <p className={cn("font-medium", row.state === "removed" && "line-through")}>{row.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                     {row.unit}
                  </p>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.ordered !== null ? formatQuantity(row.ordered, row.allowDecimal) : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.received !== null ? formatQuantity(row.received, row.allowDecimal) : "-"}
                </TableCell>
                <TableCell>
                  <StatusPill row={row} />
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {row.expected !== null ? money(row.expected) : "-"}
                </TableCell>
                <TableCell className="pr-6 text-right tabular-nums">
                  {row.total !== null ? money(row.total) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SectionCard>
  )
}