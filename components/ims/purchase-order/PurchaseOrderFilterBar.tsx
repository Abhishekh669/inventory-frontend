"use client"

import { RotateCcw, SlidersHorizontal, Search } from "lucide-react"

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
  PURCHASE_ORDER_STATUSES,
  type PurchaseOrderStatus,
} from "@/utils/types/purchase-order.types"

import { PURCHASE_ORDER_STATUS_LABELS } from "./PurchaseOrderStatusBar"

export type PurchaseOrderFilterDraft = {
  status: PurchaseOrderStatus | "all"
  search: string
  from_date: string
  to_date: string
}

export const DEFAULT_PURCHASE_ORDER_FILTER_DRAFT: PurchaseOrderFilterDraft = {
  status: "all",
  search: "",
  from_date: "",
  to_date: "",
}

export function PurchaseOrderFiltersBar({
  value,
  onChange,
  onApply,
  onClear,
}: {
  value: PurchaseOrderFilterDraft
  onChange: (next: PurchaseOrderFilterDraft) => void
  onApply: () => void
  onClear: () => void
}) {
  const set = (patch: Partial<PurchaseOrderFilterDraft>) =>
    onChange({ ...value, ...patch })

  const rangeInvalid = Boolean(
    value.from_date &&
    value.to_date &&
    value.from_date > value.to_date
  )

  const hasFilters =
    value.status !== "all" ||
    Boolean(value.search.trim() || value.from_date || value.to_date)

  const fieldClass = "h-9 rounded-md bg-background text-sm"
  const labelClass = "text-[11px] font-medium text-muted-foreground"

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!rangeInvalid) onApply()
      }}
      className="rounded-lg border bg-card p-3 shadow-sm"
    >
      <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1.5fr)_minmax(130px,0.8fr)_minmax(140px,0.9fr)_minmax(140px,0.9fr)_auto]">

        {/* Search */}
        <div className="min-w-0 space-y-1">
          <Label htmlFor="po-filter-search" className={labelClass}>
            Search
          </Label>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="po-filter-search"
              type="search"
              value={value.search}
              onChange={(e) => set({ search: e.target.value })}
              placeholder="Search title or note..."
              maxLength={100}
              autoComplete="off"
              className={`${fieldClass} pl-8`}
            />
          </div>
        </div>

        {/* Status */}
        <div className="min-w-0 space-y-1">
          <Label className={labelClass}>Status</Label>

          <Select
            value={value.status}
            onValueChange={(v) =>
              set({
                status: v as PurchaseOrderFilterDraft["status"],
              })
            }
          >
            <SelectTrigger className={`${fieldClass} w-full`}>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>

              {PURCHASE_ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {PURCHASE_ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From date */}
        <div className="min-w-0 space-y-1">
          <Label htmlFor="po-filter-from" className={labelClass}>
            From date
          </Label>

          <Input
            id="po-filter-from"
            type="date"
            value={value.from_date}
            onChange={(e) => set({ from_date: e.target.value })}
            aria-invalid={rangeInvalid}
            className={fieldClass}
          />
        </div>

        {/* To date */}
        <div className="min-w-0 space-y-1">
          <Label htmlFor="po-filter-to" className={labelClass}>
            To date
          </Label>

          <Input
            id="po-filter-to"
            type="date"
            value={value.to_date}
            onChange={(e) => set({ to_date: e.target.value })}
            aria-invalid={rangeInvalid}
            className={fieldClass}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:col-span-2 lg:col-span-1">
          <Button
            type="submit"
            size="sm"
            disabled={rangeInvalid}
            className="h-9 flex-1 px-3 lg:flex-none"
          >
            <SlidersHorizontal className="mr-1.5 size-3.5" />
            Apply
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClear}
            disabled={!hasFilters}
            className="h-9 px-3"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {rangeInvalid && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          From date must be on or before to date.
        </p>
      )}
    </form>
  )
}