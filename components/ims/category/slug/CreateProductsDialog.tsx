"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Decimal from "decimal.js"
import { ChevronsUpDown, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProducts } from "@/utils/action/products/product.post"
import { getActionError } from "@/utils/helper/category-validation"
import { formatMoney } from "@/utils/helper/format"
import { useGetCategories } from "@/utils/hooks/tanstack/categories/use-get-all-categories"
import { useGetSettingInfo } from "@/utils/hooks/tanstack/settings/use-get-setting-info"
import { useGetAllUnits } from "@/utils/hooks/tanstack/settings/use-get-units"
import type { CreateProductRequestType } from "@/utils/types/product.types"
import type { Unit } from "@/utils/types/settings.types"

const MAX_CREATE_PRODUCTS = 30
const DECIMAL_RE = /^\d+(\.\d+)?$/
const DEFAULT_STOCK = "100"
const REORDER_RATIO = "0.6"

type Row = {
  key: number
  name: string
  sku: string
  skuEdited: boolean
  unitId: string
  vatRate: string
  costPrice: string
  marginPercent: string
  sellingPrice: string
  reOrderLevel: string
  reorderEdited: boolean
  currentStock: string
}

type RowErrors = Partial<Record<keyof Omit<Row, "key" | "skuEdited" | "reorderEdited">, string>>

function skuify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
}

function prices(cost: string, vat: string, margin: string) {
  if (!DECIMAL_RE.test(cost) || !DECIMAL_RE.test(vat) || !DECIMAL_RE.test(margin)) return null
  const costWithVat = new Decimal(cost).mul(new Decimal(vat).div(100).plus(1))
  const selling = costWithVat.mul(new Decimal(margin).div(100).plus(1))
  return { costWithVat, selling }
}

// Margin that produces the given selling price, using the same base as prices(): cost with VAT
function marginFromSelling(cost: string, vat: string, selling: string) {
  if (!DECIMAL_RE.test(cost) || !DECIMAL_RE.test(vat) || !DECIMAL_RE.test(selling)) return null
  const costWithVat = new Decimal(cost).mul(new Decimal(vat).div(100).plus(1))
  if (costWithVat.isZero()) return null
  const margin = new Decimal(selling).div(costWithVat).minus(1).mul(100)
  return margin.isNegative() ? "0" : margin.toFixed(2)
}

// 60% of the stock, rounded down to a whole number
function reorderFromStock(stock: string) {
  if (!DECIMAL_RE.test(stock)) return null
  return new Decimal(stock).mul(REORDER_RATIO).floor().toFixed(0)
}

function UnitCombobox({
  id,
  units,
  value,
  onChange,
  disabled,
  invalid,
}: {
  id: string
  units: Unit[]
  value: string
  onChange: (unitId: string) => void
  disabled?: boolean
  invalid?: boolean
}) {
  const names = useMemo(() => units.map((unit) => unit.name), [units])
  const selectedName = units.find((unit) => unit.id === value)?.name ?? null

  return (
    <Combobox
      items={names}
      value={selectedName}
      onValueChange={(name) => onChange(units.find((unit) => unit.name === name)?.id ?? "")}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxTrigger
        id={id}
        disabled={disabled}
        aria-invalid={invalid}
        render={
          <Button type="button" variant="outline" className="w-full justify-between font-normal">
            <ComboboxValue>
              {(name: string | null) => name ?? <span className="text-muted-foreground">Choose unit</span>}
            </ComboboxValue>
            <ChevronsUpDown className="text-muted-foreground" aria-hidden="true" />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder="Search units" />
        <ComboboxEmpty>No unit found.</ComboboxEmpty>
        <ComboboxList>
          {(name: string) => (
            <ComboboxItem key={name} value={name}>
              {name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function CreateProductsDialog({
  open,
  onOpenChange,
  slug,
  categoryName,
  categoryId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  categoryName: string
  categoryId?: string
  onCreated: () => void
}) {
  const nextKey = useRef(1)
  const scrollToKey = useRef<number | null>(null)
  const { data: categoryData } = useGetCategories()
  const { data: unitData } = useGetAllUnits()
  const { data: settingData } = useGetSettingInfo()

  const units: Unit[] = useMemo(() => unitData?.setting ?? [], [unitData])
  const resolvedCategoryId =
    categoryId || categoryData?.categories?.find((c) => c.slug === slug)?.id || ""
  const defaultVat = new Decimal(settingData?.setting?.default_vat_rate ?? 13).toFixed(2)

  const newRow = (unitId = ""): Row => ({
    key: nextKey.current++,
    name: "",
    sku: "",
    skuEdited: false,
    unitId,
    vatRate: defaultVat,
    costPrice: "0",
    marginPercent: "0",
    sellingPrice: "0.00",
    reOrderLevel: reorderFromStock(DEFAULT_STOCK) ?? "0",
    reorderEdited: false,
    currentStock: DEFAULT_STOCK,
  })

  const [rows, setRows] = useState<Row[]>(() => [newRow()])
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    nextKey.current = 1
    setRows([newRow(units[0]?.id ?? "")])
    setSubmitted(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open || !units.length) return
    setRows((prev) => prev.map((row) => (row.unitId ? row : { ...row, unitId: units[0].id })))
  }, [open, units])

  useEffect(() => {
    const key = scrollToKey.current
    if (key === null) return
    scrollToKey.current = null
    const rowEl = document.getElementById(`create-row-${key}`)
    if (!rowEl) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    rowEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    document.getElementById(`create-name-${key}`)?.focus({ preventScroll: true })
  }, [rows])

  const errors = useMemo(() => {
    const skuCounts = new Map<string, number>()
    rows.forEach((row) => {
      const sku = row.sku.trim().toLowerCase()
      if (sku) skuCounts.set(sku, (skuCounts.get(sku) ?? 0) + 1)
    })

    return rows.map((row) => {
      const e: RowErrors = {}
      const name = row.name.trim()
      const sku = row.sku.trim()
      const unit = units.find((u) => u.id === row.unitId)
      const qtyDp = unit?.allow_decimal ? 3 : 0

      if (!name) e.name = "Name is required"
      else if (name.length > 200) e.name = "Name must be at most 200 characters"

      if (!sku) e.sku = "SKU is required"
      else if (sku.length > 50) e.sku = "SKU must be at most 50 characters"
      else if ((skuCounts.get(sku.toLowerCase()) ?? 0) > 1) e.sku = "Duplicate SKU in this list"

      if (!row.unitId) e.unitId = "Unit is required"

      const numberField = (key: keyof RowErrors, value: string, max: Decimal, maxDp: number, label: string) => {
        if (!DECIMAL_RE.test(value)) {
          e[key] = `${label} must be a number`
          return
        }
        const d = new Decimal(value)
        if (d.isNegative()) e[key] = `${label} cannot be negative`
        else if (d.gt(max)) e[key] = `${label} is too large`
        else if (d.decimalPlaces() > maxDp) e[key] = `${label} can have at most ${maxDp} decimal places`
      }

      numberField("vatRate", row.vatRate, new Decimal(100), 2, "VAT")
      numberField("costPrice", row.costPrice, new Decimal("9999999999"), 4, "Cost")
      numberField("marginPercent", row.marginPercent, new Decimal("9999.99"), 2, "Margin")
      numberField("sellingPrice", row.sellingPrice, new Decimal("999999999999"), 2, "Selling price")
      numberField("reOrderLevel", row.reOrderLevel, new Decimal("99999999999"), qtyDp, "Re-order")
      numberField("currentStock", row.currentStock, new Decimal("99999999999"), qtyDp, "Stock")

      if (!e.sellingPrice && !e.costPrice && !e.vatRate) {
        const costWithVat = new Decimal(row.costPrice).mul(new Decimal(row.vatRate).div(100).plus(1))
        if (new Decimal(row.sellingPrice).lt(costWithVat.toDecimalPlaces(2))) {
          e.sellingPrice = "Selling price is below cost with VAT"
        }
      }
      return e
    })
  }, [rows, units])

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row
        const next = { ...row, ...patch }

        if ("name" in patch && !row.skuEdited) next.sku = skuify(next.name)
        if ("sku" in patch) next.skuEdited = true

        if ("reOrderLevel" in patch) next.reorderEdited = true
        if ("currentStock" in patch && !next.reorderEdited) {
          const level = reorderFromStock(next.currentStock)
          if (level !== null) next.reOrderLevel = level
        }

        if ("sellingPrice" in patch) {
          const margin = marginFromSelling(next.costPrice, next.vatRate, next.sellingPrice)
          if (margin !== null) next.marginPercent = margin
        } else if ("costPrice" in patch || "vatRate" in patch || "marginPercent" in patch) {
          const calc = prices(next.costPrice, next.vatRate, next.marginPercent)
          if (calc) next.sellingPrice = calc.selling.toFixed(2)
        }
        return next
      })
    )
  }

  function addRow() {
    if (rows.length >= MAX_CREATE_PRODUCTS) return
    const first = rows[0]
    const row: Row = {
      ...newRow(first?.unitId || units[0]?.id || ""),
      vatRate: first?.vatRate || defaultVat,
      marginPercent: first?.marginPercent || "0",
    }
    scrollToKey.current = row.key
    setRows((prev) => (prev.length >= MAX_CREATE_PRODUCTS ? prev : [...prev, row]))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    setSubmitted(true)
    if (!resolvedCategoryId) {
      toast.error("This category could not be found.")
      return
    }
    if (!units.length) {
      toast.error("Add a unit in Settings before creating products.")
      return
    }
    if (errors.some((e) => Object.keys(e).length > 0)) return

    const payload: CreateProductRequestType[] = rows.map((row) => {
      const calc = prices(row.costPrice, row.vatRate, row.marginPercent)!
      return {
        sku: row.sku.trim(),
        name: row.name.trim(),
        category_id: resolvedCategoryId,
        unit_id: row.unitId,
        vat_rate: new Decimal(row.vatRate).toFixed(2),
        cost_price: new Decimal(row.costPrice).toFixed(4),
        cost_with_vat: calc.costWithVat.toFixed(4),
        margin_percent: new Decimal(row.marginPercent).toFixed(2),
        selling_price: new Decimal(row.sellingPrice).toFixed(2),
        re_order_level: new Decimal(row.reOrderLevel).toFixed(3),
        current_stock: new Decimal(row.currentStock).toFixed(3),
        is_active: true,
      }
    })

    setIsSaving(true)
    try {
      const res = await createProducts(payload)
      if (!res.success) {
        toast.error(getActionError(res, "Failed to create products."))
        return
      }
      toast.success(res.message || `Created ${payload.length} product${payload.length === 1 ? "" : "s"}.`)
      onCreated()
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-4xl">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Add products</DialogTitle>
            <DialogDescription>
              Add up to {MAX_CREATE_PRODUCTS} products to {categoryName}. SKU fills in from the name until you
              edit it.
            </DialogDescription>
          </DialogHeader>

          {!units.length && (
            <p className="text-sm text-destructive">No units found. Create units in Settings first.</p>
          )}

          <ul className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            {rows.map((row, i) => {
              const rowErrors = submitted ? errors[i] : {}
              const calc = prices(row.costPrice, row.vatRate, row.marginPercent)
              return (
                <li key={row.key} id={`create-row-${row.key}`} className="rounded-lg border p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Product {i + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== row.key) : prev))}
                      disabled={isSaving || rows.length === 1}
                      aria-label={`Remove product ${i + 1}`}
                    >
                      <X />
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <Label htmlFor={`create-name-${row.key}`}>Name</Label>
                      <Input
                        id={`create-name-${row.key}`}
                        value={row.name}
                        onChange={(e) => updateRow(row.key, { name: e.target.value })}
                        placeholder="e.g. Coca-Cola 250ml"
                        maxLength={200}
                        disabled={isSaving}
                        autoFocus={i === 0}
                        aria-invalid={Boolean(rowErrors?.name)}
                      />
                      {rowErrors?.name && <p className="text-xs text-destructive">{rowErrors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-sku-${row.key}`}>SKU</Label>
                      <Input
                        id={`create-sku-${row.key}`}
                        value={row.sku}
                        onChange={(e) => updateRow(row.key, { sku: e.target.value.toUpperCase() })}
                        placeholder="COCA-COLA-250ML"
                        maxLength={50}
                        disabled={isSaving}
                        className="font-mono text-xs"
                        aria-invalid={Boolean(rowErrors?.sku)}
                      />
                      {rowErrors?.sku && <p className="text-xs text-destructive">{rowErrors.sku}</p>}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-unit-${row.key}`}>Unit</Label>
                      <UnitCombobox
                        id={`create-unit-${row.key}`}
                        units={units}
                        value={row.unitId}
                        onChange={(unitId) => updateRow(row.key, { unitId })}
                        disabled={isSaving || !units.length}
                        invalid={Boolean(rowErrors?.unitId)}
                      />
                      {rowErrors?.unitId && <p className="text-xs text-destructive">{rowErrors.unitId}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-cost-${row.key}`}>Cost (Rs)</Label>
                      <Input
                        id={`create-cost-${row.key}`}
                        inputMode="decimal"
                        value={row.costPrice}
                        onChange={(e) => updateRow(row.key, { costPrice: e.target.value })}
                        disabled={isSaving}
                        aria-invalid={Boolean(rowErrors?.costPrice)}
                      />
                      {rowErrors?.costPrice && <p className="text-xs text-destructive">{rowErrors.costPrice}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-vat-${row.key}`}>VAT (%)</Label>
                      <Input
                        id={`create-vat-${row.key}`}
                        inputMode="decimal"
                        value={row.vatRate}
                        onChange={(e) => updateRow(row.key, { vatRate: e.target.value })}
                        disabled={isSaving}
                        aria-invalid={Boolean(rowErrors?.vatRate)}
                      />
                      {rowErrors?.vatRate && <p className="text-xs text-destructive">{rowErrors.vatRate}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-margin-${row.key}`}>Margin (%)</Label>
                      <Input
                        id={`create-margin-${row.key}`}
                        inputMode="decimal"
                        value={row.marginPercent}
                        onChange={(e) => updateRow(row.key, { marginPercent: e.target.value })}
                        disabled={isSaving}
                        aria-invalid={Boolean(rowErrors?.marginPercent)}
                      />
                      {rowErrors?.marginPercent && (
                        <p className="text-xs text-destructive">{rowErrors.marginPercent}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-stock-${row.key}`}>Opening stock</Label>
                      <Input
                        id={`create-stock-${row.key}`}
                        inputMode="decimal"
                        value={row.currentStock}
                        onChange={(e) => updateRow(row.key, { currentStock: e.target.value })}
                        disabled={isSaving}
                        aria-invalid={Boolean(rowErrors?.currentStock)}
                      />
                      {rowErrors?.currentStock && (
                        <p className="text-xs text-destructive">{rowErrors.currentStock}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-reorder-${row.key}`}>Re-order level</Label>
                      <Input
                        id={`create-reorder-${row.key}`}
                        inputMode="decimal"
                        value={row.reOrderLevel}
                        onChange={(e) => updateRow(row.key, { reOrderLevel: e.target.value })}
                        disabled={isSaving}
                        aria-invalid={Boolean(rowErrors?.reOrderLevel)}
                      />
                      {rowErrors?.reOrderLevel ? (
                        <p className="text-xs text-destructive">{rowErrors.reOrderLevel}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {row.reorderEdited ? "Set manually" : "60% of stock, rounded down"}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`create-selling-${row.key}`}>Selling price (Rs)</Label>
                      <Input
                        id={`create-selling-${row.key}`}
                        inputMode="decimal"
                        value={row.sellingPrice}
                        onChange={(e) => updateRow(row.key, { sellingPrice: e.target.value })}
                        disabled={isSaving}
                        aria-invalid={Boolean(rowErrors?.sellingPrice)}
                      />
                      {rowErrors?.sellingPrice ? (
                        <p className="text-xs text-destructive">{rowErrors.sellingPrice}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Cost with VAT: {calc ? formatMoney(calc.costWithVat.toFixed(2)) : "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRow}
              disabled={isSaving || rows.length >= MAX_CREATE_PRODUCTS}
            >
              <Plus data-icon="inline-start" /> Add another
            </Button>
            <p className="text-xs text-muted-foreground">
              {rows.length} / {MAX_CREATE_PRODUCTS}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !units.length} aria-busy={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isSaving ? "Creating..." : `Create ${rows.length === 1 ? "product" : `${rows.length} products`}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}