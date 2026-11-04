"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { ProductsListType } from "@/utils/types/product.types"
import { formatDate, formatMoney, formatQuantity } from "@/utils/helper/format"
import { StockBadge } from "../category/slug/StockBadge"

// Column widths in px. The table's min-width is the sum, so keep them in sync.
const COLS = [
  44, // select
  230, // name
  140, // category
  70, // unit
  100, // cost
  110, // cost + vat
  80, // margin
  110, // selling price
  110, // profit / unit
  90, // re-order
  190, // stock (+ badge)
  100, // status
  110, // created
  52, // actions
]
const TABLE_MIN_WIDTH = COLS.reduce((a, b) => a + b, 0)
const LAST = COLS.length - 1

const head =
  "h-10 px-3 align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
const cell = "h-[52px] px-3 py-0 align-middle text-sm"
const text = `${cell} text-left`
const money = `${cell} text-right tabular-nums`
const narrowHead = "h-10 px-0 text-center align-middle"
const narrowCell = "h-[52px] px-0 py-0 text-center align-middle"

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/50")}
      />
      <span className={active ? "text-foreground" : "text-muted-foreground"}>
        {active ? "Active" : "Inactive"}
      </span>
    </span>
  )
}

export function ProductsTable({
  products,
  selected,
  onSelectionChange,
  onEdit,
  onDelete,
  isLoading,
  isDimmed,
}: {
  products: ProductsListType[]
  selected: string[]
  onSelectionChange: (ids: string[]) => void
  onEdit: (product: ProductsListType) => void
  onDelete: (id: string) => void
  isLoading: boolean
  isDimmed: boolean
}) {
  const pageIds = products.map((p) => p.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const someSelected = pageIds.some((id) => selected.includes(id))

  const toggleAll = (checked: boolean) => onSelectionChange(checked ? pageIds : [])
  const toggleOne = (id: string, checked: boolean) =>
    onSelectionChange(checked ? [...selected, id] : selected.filter((x) => x !== id))

  return (
    <div className={cn("transition-opacity", isDimmed && "opacity-60")}>
      {/* horizontal scroll lives here so the page itself never scrolls sideways */}
      <div className="w-full overflow-x-auto">
        <Table className="table-fixed" style={{ minWidth: TABLE_MIN_WIDTH }}>
          <colgroup>
            {COLS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <TableHeader className="bg-muted/50 [&_tr]:border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead className={narrowHead}>
                <div className="flex justify-center">
                  <Checkbox
                    aria-label="Select all products on this page"
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onCheckedChange={(c) => toggleAll(c === true)}
                  />
                </div>
              </TableHead>
              <TableHead className={`${head} text-left`}>Name</TableHead>
              <TableHead className={`${head} text-left`}>Category</TableHead>
              <TableHead className={`${head} text-left`}>Unit</TableHead>
              <TableHead className={`${head} text-right`}>Cost/ unit</TableHead>
              <TableHead className={`${head} text-right`}>Cost + VAT/ unit</TableHead>
              <TableHead className={`${head} text-right`}>Margin</TableHead>
              <TableHead className={`${head} text-right`}>Selling</TableHead>
              <TableHead className={`${head} text-right`}>Profit / unit</TableHead>
              <TableHead className={`${head} text-right`}>Re-order</TableHead>
              <TableHead className={`${head} text-right`}>Stock</TableHead>
              <TableHead className={`${head} text-left`}>Status</TableHead>
              <TableHead className={`${head} text-left`}>Created</TableHead>
              <TableHead className={narrowHead}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {COLS.map((_w, j) => (
                      <TableCell key={j} className={j === 0 || j === LAST ? narrowCell : cell}>
                        <Skeleton className={j === 0 || j === LAST ? "mx-auto size-4" : "h-4 w-full"} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : products.map((p) => (
                  <TableRow
                    key={p.id}
                    data-state={selected.includes(p.id) ? "selected" : undefined}
                    className={cn("transition-colors", !p.is_active && "text-muted-foreground")}
                  >
                    <TableCell className={narrowCell}>
                      <div className="flex justify-center">
                        <Checkbox
                          aria-label={`Select ${p.name}`}
                          checked={selected.includes(p.id)}
                          onCheckedChange={(c) => toggleOne(p.id, c === true)}
                        />
                      </div>
                    </TableCell>

                    <TableCell className={`${text} font-medium`}>
                      <HoverCard>
                        <HoverCardTrigger render={<span className="block cursor-default truncate" />}>
                          {p.name}
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto max-w-sm break-words text-sm">
                          {p.name}
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>

                    <TableCell className={`${text} truncate text-muted-foreground`} title={p.category_name}>
                      {p.category_name}
                    </TableCell>
                    <TableCell className={`${text} truncate text-muted-foreground`}>{p.unit_name}</TableCell>

                    <TableCell className={money}>{formatMoney(p.cost_price)}</TableCell>
                    <TableCell className={`${money} text-muted-foreground`}>{formatMoney(p.cost_with_vat)}</TableCell>
                    <TableCell className={`${money} text-muted-foreground`}>
                      {Number(p.margin_percent).toFixed(2)}%
                    </TableCell>
                    <TableCell className={`${money} font-semibold`}>{formatMoney(p.selling_price)}</TableCell>
                    <TableCell className={`${money} font-medium text-emerald-600 dark:text-emerald-400`}>
                      {formatMoney(p.profit_per_unit)}
                    </TableCell>
                    <TableCell className={`${money} text-muted-foreground`}>
                      {formatQuantity(p.re_order_level, p.allow_decimal)}
                    </TableCell>

                    <TableCell className={money}>
                      <div className="flex items-center justify-end gap-2">
                        <span className="truncate">
                          <span className="font-medium">{formatQuantity(p.current_stock, p.allow_decimal)}</span>{" "}
                          <span className="text-muted-foreground">{p.unit_name}</span>
                        </span>
                        <StockBadge stock={p.current_stock} reOrderLevel={p.re_order_level} />
                      </div>
                    </TableCell>

                    <TableCell className={text}>
                      <StatusDot active={p.is_active} />
                    </TableCell>
                    <TableCell className={`${text} whitespace-nowrap text-muted-foreground`}>
                      {formatDate(p.created_at)}
                    </TableCell>

                    <TableCell className={narrowCell}>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground"
                              aria-label={`Actions for ${p.name}`}
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(p)}>
                            <Pencil className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(p.id)}>
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}