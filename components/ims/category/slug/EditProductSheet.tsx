"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Decimal from "decimal.js"
import { toast } from "sonner"

// shadcn: Sheet (side panel), Input, Label, Checkbox, Button
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

import type { ProductsListType, UpdateProductRequestType } from "@/utils/types/product.types"
import { formatMoney } from "@/utils/helper/format"
import { updateProduct } from "@/utils/action/products/product.put"

interface FormState {
  name: string
  vat_rate: string
  cost_price: string
  margin_percent: string
  re_order_level: string
  current_stock: string
  is_active: boolean
}

type Errors = Partial<Record<keyof FormState, string>>

const DECIMAL_RE = /^\d+(\.\d+)?$/

const toForm = (p: ProductsListType): FormState => ({
  name: p.name,
  vat_rate: new Decimal(p.vat_rate).toFixed(2),
  cost_price: new Decimal(p.cost_price).toFixed(2),
  margin_percent: new Decimal(p.margin_percent).toFixed(2),
  re_order_level: new Decimal(p.re_order_level).toFixed(p.allow_decimal ? 3 : 0),
  current_stock: new Decimal(p.current_stock).toFixed(p.allow_decimal ? 3 : 0),
  is_active: p.is_active,
})

// Limits follow the database column sizes
function validate(f: FormState, allowDecimal: boolean): Errors {
  const e: Errors = {}
  const name = f.name.trim()

  if (!name) e.name = "Name is required"
  else if (name.length > 200) e.name = "Name must be at most 200 characters"

  const checkNumber = (key: keyof FormState, value: string, max: Decimal, maxDp: number, label: string) => {
    if (!DECIMAL_RE.test(value)) return void (e[key] = `${label} must be a positive number`)
    const d = new Decimal(value)
    if (d.gt(max)) return void (e[key] = `${label} is too large`)
    if (d.decimalPlaces() > maxDp) e[key] = `${label} can have at most ${maxDp} decimal places`
  }

  checkNumber("vat_rate", f.vat_rate, new Decimal(100), 2, "VAT rate")
  checkNumber("cost_price", f.cost_price, new Decimal("9999999999"), 4, "Cost price")
  checkNumber("margin_percent", f.margin_percent, new Decimal("9999.99"), 2, "Margin")

  const qtyDp = allowDecimal ? 3 : 0
  const qtyLabel = allowDecimal ? "" : " (whole numbers only)"
  checkNumber("re_order_level", f.re_order_level, new Decimal("99999999999"), qtyDp, `Re-order level${qtyLabel}`)
  checkNumber("current_stock", f.current_stock, new Decimal("99999999999"), qtyDp, `Stock${qtyLabel}`)

  return e
}

interface Props {
  product: ProductsListType | null
  onClose: () => void
  onSaved: () => void
}

export function EditProductSheet({ product, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [isSaving, startSave] = useTransition()

  // load the form whenever a different product is opened
  useEffect(() => {
    setForm(product ? toForm(product) : null)
    setErrors({})
  }, [product])

  // live preview of the calculated prices (the same math the shopkeeper does by hand)
  const calc = useMemo(() => {
    if (!form || !DECIMAL_RE.test(form.cost_price) || !DECIMAL_RE.test(form.vat_rate) || !DECIMAL_RE.test(form.margin_percent)) {
      return null
    }
    const costWithVat = new Decimal(form.cost_price).mul(new Decimal(form.vat_rate).div(100).plus(1))
    const selling = costWithVat.mul(new Decimal(form.margin_percent).div(100).plus(1))
    return { costWithVat, selling, profit: selling.minus(costWithVat) }
  }, [form])

  if (!product || !form) return <Sheet open={false} />

  const set = (key: keyof FormState, value: string | boolean) => {
    setForm({ ...form, [key]: value })
    if (errors[key]) setErrors({ ...errors, [key]: undefined })
  }

  const onSubmit = () => {
    const found = validate(form, product.allow_decimal)
    if (Object.keys(found).length > 0 || !calc) {
      setErrors(found)
      return
    }

    const payload: UpdateProductRequestType = {
      id: product.id,
      sku: product.sku,
      name: form.name.trim(),
      category_id: product.category_id,
      unit_id: product.unit_id,
      vat_rate: new Decimal(form.vat_rate).toFixed(2),
      cost_price: new Decimal(form.cost_price).toFixed(4),
      cost_with_vat: calc.costWithVat.toFixed(4),
      margin_percent: new Decimal(form.margin_percent).toFixed(2),
      selling_price: calc.selling.toFixed(2),
      re_order_level: new Decimal(form.re_order_level).toFixed(3),
      current_stock: new Decimal(form.current_stock).toFixed(3),
      is_active: form.is_active,
    }

    startSave(async () => {
      const res = await updateProduct(payload)
      if (!res.success) {
        toast.error(res.error || "Failed to update product")
        return
      }
      toast.success("Product updated")
      onSaved()
    })
  }

  const field = (key: keyof FormState, label: string, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`edit-${key}`}>{label}</Label>
      <Input
        id={`edit-${key}`}
        inputMode="decimal"
        value={form[key] as string}
        aria-invalid={!!errors[key]}
        onChange={(e) => set(key, e.target.value)}
      />
      {errors[key] ? (
        <p className="text-xs text-destructive">{errors[key]}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )

  return (
    <Sheet open={!!product} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit product</SheetTitle>
          <SheetDescription>
            {product.category_name} / {product.sku}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              maxLength={200}
              value={form.name}
              aria-invalid={!!errors.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>SKU</Label>
              <Input value={product.sku} disabled className="font-mono text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unit</Label>
              <Input value={product.unit_name} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("cost_price", "Cost price (Rs)")}
            {field("vat_rate", "VAT rate (%)")}
          </div>

          {field("margin_percent", "Margin (%)")}

          {/* calculated, read-only preview */}
          <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/40 p-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Cost + VAT</p>
              <p className="font-medium">{calc ? formatMoney(calc.costWithVat.toString()) : "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selling price</p>
              <p className="font-medium">{calc ? formatMoney(calc.selling.toFixed(2)) : "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit / unit</p>
              <p className="font-medium">{calc ? formatMoney(calc.profit.toFixed(2)) : "-"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("current_stock", `Stock (${product.unit_name})`)}
            {field("re_order_level", "Re-order level")}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-active"
              checked={form.is_active}
              onCheckedChange={(c) => set("is_active", c === true)}
            />
            <Label htmlFor="edit-active">Active</Label>
          </div>
        </div>

        <SheetFooter className="mt-auto flex-row justify-end gap-2 border-t">
          <Button variant="outline" disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={onSubmit}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}