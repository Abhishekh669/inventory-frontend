"use client"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProductsListType } from "@/utils/types/product.types"
import { formatDate, formatMoney, formatQuantity } from "@/utils/helper/format"
import { StockBadge } from "./StockBadge"

const COL_COUNT = 15

const head = "h-11 px-3 align-middle"
const cell = "h-14 px-3 py-0 align-middle"
const text = `${cell} text-left`
const money = `${cell} text-right tabular-nums`
const center = `${cell} text-center`

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
    <div className={isDimmed ? "opacity-60" : undefined}>
      <Table className="min-w-[1480px] table-fixed">
        <colgroup>
          <col className="w-12" />
          <col className="w-[140px]" />
          <col className="w-[200px]" />
          <col className="w-[140px]" />
          <col className="w-[90px]" />
          <col className="w-[120px]" />
          <col className="w-[130px]" />
          <col className="w-[100px]" />
          <col className="w-[130px]" />
          <col className="w-[120px]" />
          <col className="w-[100px]" />
          <col className="w-[140px]" />
          <col className="w-[96px]" />
          <col className="w-[120px]" />
          <col className="w-12" />
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${head} text-center`}>
              <div className="flex justify-center">
                <Checkbox
                  aria-label="Select all products on this page"
                  checked={allSelected}
                  indeterminate={!allSelected && someSelected}
                  onCheckedChange={(c) => toggleAll(c === true)}
                />
              </div>
            </TableHead>
            <TableHead className={`${head} text-left`}>SKU</TableHead>
            <TableHead className={`${head} text-left`}>Name</TableHead>
            <TableHead className={`${head} text-left`}>Category</TableHead>
            <TableHead className={`${head} text-left`}>Unit</TableHead>
            <TableHead className={`${head} text-right`}>Cost</TableHead>
            <TableHead className={`${head} text-right`}>Cost + VAT</TableHead>
            <TableHead className={`${head} text-right`}>Margin %</TableHead>
            <TableHead className={`${head} text-right`}>Selling price</TableHead>
            <TableHead className={`${head} text-right`}>Profit / unit</TableHead>
            <TableHead className={`${head} text-right`}>Re-order</TableHead>
            <TableHead className={`${head} text-right`}>Stock</TableHead>
            <TableHead className={`${head} text-center`}>Active</TableHead>
            <TableHead className={`${head} text-left`}>Created</TableHead>
            <TableHead className={`${head} text-center`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {Array.from({ length: COL_COUNT }).map((__, j) => (
                    <TableCell key={j} className={cell}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : products.map((p) => (
                <TableRow
                  key={p.id}
                  data-state={selected.includes(p.id) ? "selected" : undefined}
                  className={p.is_active ? undefined : "opacity-60"}
                >
                  <TableCell className={center}>
                    <div className="flex justify-center">
                      <Checkbox
                        aria-label={`Select ${p.name}`}
                        checked={selected.includes(p.id)}
                        onCheckedChange={(c) => toggleOne(p.id, c === true)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className={`${text} truncate font-mono text-xs`}>{p.sku}</TableCell>
                  <TableCell className={`${text} truncate font-medium`} title={p.name}>
                    {p.name}
                  </TableCell>
                  <TableCell className={`${text} truncate`} title={p.category_name}>
                    {p.category_name}
                  </TableCell>
                  <TableCell className={`${text} truncate`}>{p.unit_name}</TableCell>
                  <TableCell className={money}>{formatMoney(p.cost_price)}</TableCell>
                  <TableCell className={money}>{formatMoney(p.cost_with_vat)}</TableCell>
                  <TableCell className={money}>{Number(p.margin_percent).toFixed(2)}%</TableCell>
                  <TableCell className={`${money} font-medium`}>{formatMoney(p.selling_price)}</TableCell>
                  <TableCell className={money}>{formatMoney(p.profit_per_unit)}</TableCell>
                  <TableCell className={money}>
                    {formatQuantity(p.re_order_level, p.allow_decimal)}
                  </TableCell>
                  <TableCell className={money}>
                    <div className="flex items-center justify-end gap-2">
                      <span>
                        {formatQuantity(p.current_stock, p.allow_decimal)} {p.unit_name}
                      </span>
                      <StockBadge stock={p.current_stock} reOrderLevel={p.re_order_level} />
                    </div>
                  </TableCell>
                  <TableCell className={center}>
                    <Badge variant={p.is_active ? "secondary" : "outline"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className={text}>{formatDate(p.created_at)}</TableCell>
                  <TableCell className={center}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" aria-label={`Actions for ${p.name}`} />}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(p)}>
                          <Pencil className="mr-2 size-4" />
                          Edit
                        </DropdownMenuItem>
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
  )
}
