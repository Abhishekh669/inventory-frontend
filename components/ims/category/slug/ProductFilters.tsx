"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  current_stock: "100",
  greater_than: false,
  limit: 20,
}

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
  const set = (patch: Partial<ProductFilterDraft>) => onChange({ ...value, ...patch })
  const rangeInvalid = Boolean(value.from_date && value.to_date && value.from_date > value.to_date)

  return (
    <form
      className="flex flex-col gap-4 rounded-lg border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault()
        if (!rangeInvalid) onApply()
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="flex flex-col gap-1.5 xl:col-span-2">
          <Label htmlFor="filter-name">Name</Label>
          <Input
            id="filter-name"
            value={value.name}
            maxLength={200}
            placeholder="Search by name or SKU"
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-from">From date</Label>
          <Input
            id="filter-from"
            type="date"
            value={value.from_date}
            onChange={(e) => set({ from_date: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-to">To date</Label>
          <Input
            id="filter-to"
            type="date"
            value={value.to_date}
            onChange={(e) => set({ to_date: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5 xl:col-span-2">
          <Label htmlFor="filter-stock">Stock</Label>
          <div className="flex gap-2">
            <Select
              value={value.greater_than ? "true" : "false"}
              onValueChange={(v) => set({ greater_than: String(v) === "true" })}
            >
              <SelectTrigger className="min-w-44 flex-1">
                <SelectValue>
                  {value.greater_than ? "Equal or more (≥)" : "Equal or less (≤)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Equal or less (≤)</SelectItem>
                <SelectItem value="true">Equal or more (≥)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="filter-stock"
              className="w-24"
              inputMode="numeric"
              placeholder="100"
              value={value.current_stock}
              onChange={(e) => set({ current_stock: e.target.value.replace(/\D/g, "").slice(0, 9) })}
              aria-label="Stock number"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {value.greater_than
              ? `Show products with stock ${value.current_stock || "100"} or more.`
              : `Show products with stock ${value.current_stock || "100"} or less.`}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Rows</Label>
          <Select value={String(value.limit)} onValueChange={(v) => set({ limit: Number(v) })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {rangeInvalid && (
        <p className="text-sm text-destructive">From date must be on or before to date.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={rangeInvalid}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  )
}
