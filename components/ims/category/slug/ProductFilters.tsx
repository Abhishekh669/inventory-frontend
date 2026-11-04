
"use client"

import {
  ArrowRight,
  Boxes,
  CalendarDays,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ProductFilterDraft = {
  name: string
  from_date: string
  to_date: string
  current_stock: string
  greater_than: boolean
  limit: number
}

export const DEFAULT_FILTER_DRAFT: ProductFilterDraft = {
  name: "",
  from_date: "",
  to_date: "",
  current_stock: "",
  greater_than: false,
  limit: 20,
}

const STOCK_PRESETS = [
  { label: "Out of stock", stock: "0", greater_than: false },
  { label: "Low stock (≤ 10)", stock: "10", greater_than: false },
  { label: "Well stocked (≥ 100)", stock: "100", greater_than: true },
]

const labelClass =
  "flex items-center gap-1.5 text-xs font-medium text-muted-foreground"

export function ProductFilters({
  value,
  onChange,
  onApply,
  onClear,
}: {
  value: ProductFilterDraft
  onChange: (next: ProductFilterDraft) => void
  onApply: () => void
  onClear: () => void
}) {
  const set = (patch: Partial<ProductFilterDraft>) =>
    onChange({ ...value, ...patch })

  const rangeInvalid = Boolean(
    value.from_date &&
    value.to_date &&
    value.from_date > value.to_date
  )

  // Remove individual filters
  const removeFilter = (key: keyof ProductFilterDraft) => {
    switch (key) {
      case "name":
        set({ name: "" })
        break

      case "from_date":
        set({ from_date: "" })
        break

      case "to_date":
        set({ to_date: "" })
        break

      case "current_stock":
        set({
          current_stock: "",
          greater_than: false,
        })
        break

      case "limit":
        set({ limit: DEFAULT_FILTER_DRAFT.limit })
        break
    }
  }

  // Build selected filter chips
  const selectedFilters: {
    key: keyof ProductFilterDraft
    label: string
    value: string
  }[] = []

  if (value.name.trim()) {
    selectedFilters.push({
      key: "name",
      label: "Product",
      value: value.name,
    })
  }

  if (value.from_date) {
    selectedFilters.push({
      key: "from_date",
      label: "From",
      value: value.from_date,
    })
  }

  if (value.to_date) {
    selectedFilters.push({
      key: "to_date",
      label: "To",
      value: value.to_date,
    })
  }

  if (value.current_stock !== "") {
    selectedFilters.push({
      key: "current_stock",
      label: "Stock",
      value: `${value.greater_than ? "≥" : "≤"} ${value.current_stock}`,
    })
  }

  if (value.limit !== DEFAULT_FILTER_DRAFT.limit) {
    selectedFilters.push({
      key: "limit",
      label: "Rows",
      value: `${value.limit} per page`,
    })
  }

  return (
    <form
      className="overflow-hidden rounded-xl border bg-card shadow-xs"
      onSubmit={(e) => {
        e.preventDefault()
        if (!rangeInvalid) onApply()
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </div>

          <div>
            <h2 className="text-sm font-semibold leading-none">
              Filters
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Narrow down the product list
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      {/* Fields */}
      <div className="grid gap-x-4 gap-y-5 p-4 sm:grid-cols-2 lg:grid-cols-12">

        {/* Product Search */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-5">
          <Label htmlFor="filter-name" className={labelClass}>
            <Search className="size-3.5" />
            Product name
          </Label>

          <div className="relative">
            <Input
              id="filter-name"
              value={value.name}
              maxLength={200}
              placeholder="e.g. Coca-Cola 250ml"
              className="h-10 pr-8"
              onChange={(e) => set({ name: e.target.value })}
            />

            {value.name && (
              <button
                type="button"
                onClick={() => removeFilter("name")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-5">
          <Label htmlFor="filter-from" className={labelClass}>
            <CalendarDays className="size-3.5" />
            Date added
          </Label>

          <div className="flex items-center gap-2">
            <Input
              id="filter-from"
              type="date"
              aria-label="From date"
              aria-invalid={rangeInvalid}
              className="h-10"
              value={value.from_date}
              onChange={(e) => set({ from_date: e.target.value })}
            />

            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />

            <Input
              id="filter-to"
              type="date"
              aria-label="To date"
              aria-invalid={rangeInvalid}
              className="h-10"
              value={value.to_date}
              onChange={(e) => set({ to_date: e.target.value })}
            />
          </div>
        </div>

        {/* Rows per page */}
        <div className="flex flex-col gap-1.5 sm:col-span-1 lg:col-span-2">
          <Label htmlFor="filter-rows" className={labelClass}>
            Rows per page
          </Label>

          <Select
            value={String(value.limit)}
            onValueChange={(v) => set({ limit: Number(v) })}
          >
            <SelectTrigger id="filter-rows" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[10, 20, 30].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} rows
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Level */}
        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-12">
          <Label htmlFor="filter-stock" className={labelClass}>
            <Boxes className="size-3.5" />
            Stock level
          </Label>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Stock comparison"
              className="inline-flex rounded-lg bg-muted p-0.5"
            >
              {[
                { label: "Lesser Than (≤)", gt: false },
                { label: "Greater Than (≥)", gt: true },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={value.greater_than === opt.gt}
                  onClick={() => set({ greater_than: opt.gt })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    value.greater_than === opt.gt
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Input
              id="filter-stock"
              className="h-10 w-28 tabular-nums"
              inputMode="numeric"
              placeholder="100"
              value={value.current_stock}
              onChange={(e) =>
                set({
                  current_stock: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 9),
                })
              }
              aria-label="Stock number"
            />

            <span className="hidden h-5 w-px bg-border sm:block" />

            <div className="flex flex-wrap gap-2">
              {STOCK_PRESETS.map((preset) => {
                const active =
                  value.current_stock === preset.stock &&
                  value.greater_than === preset.greater_than

                return (
                  <button
                    key={preset.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      set({
                        current_stock: preset.stock,
                        greater_than: preset.greater_than,
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Filters */}
      {selectedFilters.length > 0 && (
        <div className="border-t px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">
                Selected filters
              </span>

              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {selectedFilters.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onClear}
              className="text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedFilters.map((filter) => (
              <div
                key={filter.key}
                className="inline-flex items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pl-3 pr-1.5 text-xs"
              >
                <span className="text-muted-foreground">
                  {filter.label}:
                </span>

                <span className="max-w-48 truncate font-medium">
                  {filter.value}
                </span>

                <button
                  type="button"
                  onClick={() => removeFilter(filter.key)}
                  aria-label={`Remove ${filter.label} filter`}
                  className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
        <p
          className={cn(
            "text-xs",
            rangeInvalid
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          )}
          aria-live="polite"
        >
          {rangeInvalid
            ? "The start date must be on or before the end date."
            : selectedFilters.length > 0
              ? `${selectedFilters.length} filter(s) selected.`
              : "No filters selected. Showing all products."}
        </p>

        <Button type="submit" disabled={rangeInvalid}>
          <Search className="size-4" />
          Apply filters
        </Button>
      </div>
    </form>
  )
}
