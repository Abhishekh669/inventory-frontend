import Decimal from "decimal.js"
import { Info as InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatQuantity } from "@/utils/helper/format"
import { toDecimal } from "@/utils/helper/purchase-cal"
import { money } from "@/utils/helper/purchase-format"
import type { PurchaseItemDetail } from "@/utils/types/purchase.types"
import { Pill, SectionCard } from "./PurchaseDetailsParts"

const head = "h-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground"

function QtyNote({ item }: { item: PurchaseItemDetail }) {
  if (item.qty_ordered === null) return null
  const d = toDecimal(item.qty).sub(toDecimal(item.qty_ordered))
  if (d.isZero()) return null
  return (
    <p className={cn("mt-0.5 text-[11px]", d.gt(0) ? "text-amber-600" : "text-red-600")}>
      {d.gt(0) ? `${d.toString()} more than ordered` : `${d.abs().toString()} short`}
    </p>
  )
}

function PriceDifference({ item }: { item: PurchaseItemDetail }) {
  if (item.expected_unit_cost === null) return <span className="text-muted-foreground">-</span>
  const diff = toDecimal(item.rate).sub(toDecimal(item.expected_unit_cost))
  if (diff.isZero()) return <span className="text-muted-foreground">Same</span>
  return (
    <span className={cn("tabular-nums", diff.gt(0) ? "text-red-600" : "text-emerald-600")}>
      {diff.gt(0) ? "+" : ""}
      {money(diff.toString())}
    </span>
  )
}

export function PurchaseItemsCard({
  items,
  hasOrder,
}: {
  items: PurchaseItemDetail[]
  hasOrder: boolean // false when the purchase has no purchase order to compare with
}) {
  const gross = items.reduce((sum, i) => sum.add(toDecimal(i.line_value)), new Decimal(0))
  const vat = items.reduce((sum, i) => sum.add(toDecimal(i.vat_amount)), new Decimal(0))
  // no order line means the product was added when the purchase was made
  const isAddedLater = (i: PurchaseItemDetail) => hasOrder && i.poi_id === null
  const addedCount = items.filter(isAddedLater).length

  return (
    <SectionCard
      title="Purchased items"
      description="What the supplier actually sent, compared with what was ordered."
      action={<Pill className="bg-muted/50 text-muted-foreground">{items.length} items</Pill>}
      contentClassName="p-0"
    >
      {addedCount > 0 && (
        <div className="mx-6 mb-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          <InfoIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            {addedCount} item{addedCount > 1 ? "s were" : " was"} not on the original purchase order and{" "}
            {addedCount > 1 ? "were" : "was"} added later, when this purchase was created.
          </p>
        </div>
      )}

      <div className="overflow-x-auto border-t">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className={cn(head, "pl-6")}>Product</TableHead>
              <TableHead className={cn(head, "text-right")}>Ordered</TableHead>
              <TableHead className={cn(head, "text-right")}>Purchase qty</TableHead>
              <TableHead className={cn(head, "text-right")}>Expected cost</TableHead>
              <TableHead className={cn(head, "text-right")}>Rate</TableHead>
              <TableHead className={cn(head, "text-right")}>Difference</TableHead>
              <TableHead className={cn(head, "text-right")}>Cost + VAT</TableHead>
              <TableHead className={cn(head, "pr-6 text-right")}>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.product_name}</p>
                    {isAddedLater(item) && (
                      <Pill className="border-blue-200 bg-blue-50 px-1.5 py-0 text-[10px] text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                        Added later
                      </Pill>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                   {item.unit_name}
                  </p>
                  {isAddedLater(item) && (
                    <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">
                      Not on the original purchase order
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.qty_ordered !== null ? formatQuantity(item.qty_ordered, item.allow_decimal) : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatQuantity(item.qty, item.allow_decimal)}
                  <div className="flex justify-end">
                    <QtyNote item={item} />
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {item.expected_unit_cost !== null ? money(item.expected_unit_cost) : "-"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{money(item.rate)}</TableCell>
                <TableCell className="text-right">
                  <PriceDifference item={item} />
                </TableCell>
                <TableCell className="text-right tabular-nums">{money(item.unit_cost_with_vat)}</TableCell>
                <TableCell className="pr-6 text-right font-medium tabular-nums">{money(item.line_value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap justify-end gap-x-8 gap-y-1 border-t px-6 py-3 text-sm">
        <span className="text-muted-foreground">
          Items total <strong className="ml-1 text-foreground tabular-nums">{money(gross.toString())}</strong>
        </span>
        <span className="text-muted-foreground">
          Item VAT <strong className="ml-1 text-foreground tabular-nums">{money(vat.toString())}</strong>
        </span>
      </div>
    </SectionCard>
  )
}