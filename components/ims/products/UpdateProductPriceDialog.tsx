"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowRight, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { ProductsListType } from "@/utils/types/product.types"
import { updateProductPrice } from "@/utils/action/products/product.put"

const NUMBER_ONLY = /^\d*\.?\d*$/

const round = (n: number, digits: number) => {
  const f = 10 ** digits
  return Math.round((n + Number.EPSILON) * f) / f
}

const money = (n: number) =>
  `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0)}`

// uses vat_rate when the product has it, otherwise works it out from cost and cost + VAT
const getVat = (p: ProductsListType): string => {
  const raw = (p as unknown as { vat_rate?: string | number | null }).vat_rate
  if (raw !== undefined && raw !== null && raw !== "") return String(Number(raw))
  const cost = Number(p.cost_price)
  const withVat = Number(p.cost_with_vat)
  if (cost > 0 && withVat >= cost) return String(round((withVat / cost - 1) * 100, 2))
  return "13"
}

interface Props {
  product: ProductsListType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateProductPriceDialog({ product, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [price, setPrice] = useState("")
  const [vat, setVat] = useState("")
  const [margin, setMargin] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && product) {
      setPrice(String(Number(product.cost_price)))
      setVat(getVat(product))
      setMargin(String(Number(product.margin_percent)))
      setSubmitted(false)
      setSaving(false)
    }
  }, [open, product])

  if (!product) return null

  const p = Number(price)
  const v = Number(vat)
  const m = Number(margin)

  // same formulas as the backend
  const newCostWithVat = round(p * (1 + v / 100), 4)
  const newSelling = round(newCostWithVat * (1 + m / 100), 2)
  const newProfit = round(newSelling - newCostWithVat, 4)

  const errors: { price?: string; vat?: string; margin?: string } = {}
  if (!price || !(p > 0)) errors.price = "Enter a price greater than 0"
  else if (p > 100_000_000) errors.price = "Price is too large"
  else if ((price.split(".")[1]?.length ?? 0) > 4) errors.price = "Maximum 4 decimal places"
  if (vat === "" || v < 0 || v > 100) errors.vat = "Between 0 and 100"
  if (margin === "" || m < 0 || m > 1000) errors.margin = "Between 0 and 1000"
  const hasErrors = Object.keys(errors).length > 0

  const unchanged =
    p === Number(product.cost_price) &&
    v === Number(getVat(product)) &&
    m === Number(product.margin_percent)

  const shown = (key: keyof typeof errors) => (submitted ? errors[key] : undefined)

  const handleSave = async () => {
    setSubmitted(true)
    if (hasErrors) return

    setSaving(true)
    const res = await updateProductPrice({
      id: product.id,
      old_price: String(product.cost_price),
      new_price: price,
      current_vat: vat,
      current_margin: margin,
    })
    setSaving(false)

    if (!res.success) {
      toast.error(res.error || "Failed to update price")
      return
    }

    toast.success(res.message)
    // refresh every product list (all queries whose key mentions "product")
    await queryClient.invalidateQueries({
      predicate: (q) =>
        q.queryKey.some((k) => typeof k === "string" && k.toLowerCase().includes("product")),
    })
    onOpenChange(false)
  }

  const rows = [
    { label: "Cost + VAT", old: Number(product.cost_with_vat), next: newCostWithVat },
    { label: "Selling price", old: Number(product.selling_price), next: newSelling, strong: true },
    { label: "Profit / unit", old: Number(product.profit_per_unit), next: newProfit, profit: true },
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update price</DialogTitle>
          <DialogDescription className="truncate">
            {product.name} · per {product.unit_name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 space-y-1.5 sm:col-span-1">
            <Label htmlFor="price-cost">New cost price (Rs.)</Label>
            <Input
              id="price-cost"
              inputMode="decimal"
              value={price}
              onChange={(e) => NUMBER_ONLY.test(e.target.value) && setPrice(e.target.value)}
              disabled={saving}
              className={cn(shown("price") && "border-destructive")}
            />
            {shown("price") && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>

          <div className="col-span-3 space-y-1.5 sm:col-span-1">
            <Label htmlFor="price-vat">VAT (%)</Label>
            <Input
              id="price-vat"
              inputMode="decimal"
              value={vat}
              onChange={(e) => NUMBER_ONLY.test(e.target.value) && setVat(e.target.value)}
              disabled={saving}
              className={cn(shown("vat") && "border-destructive")}
            />
            {shown("vat") && <p className="text-xs text-destructive">{errors.vat}</p>}
          </div>

          <div className="col-span-3 space-y-1.5 sm:col-span-1">
            <Label htmlFor="price-margin">Margin (%)</Label>
            <Input
              id="price-margin"
              inputMode="decimal"
              value={margin}
              onChange={(e) => NUMBER_ONLY.test(e.target.value) && setMargin(e.target.value)}
              disabled={saving}
              className={cn(shown("margin") && "border-destructive")}
            />
            {shown("margin") && <p className="text-xs text-destructive">{errors.margin}</p>}
          </div>
        </div>

        {/* live preview */}
        <div className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Preview</span>
            <span>Before → After</span>
          </div>
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className="text-muted-foreground">{money(r.old)}</span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                  <span
                    className={cn(
                      r.strong && "font-semibold",
                      r.profit && (r.next >= 0 ? "font-medium text-emerald-600" : "font-medium text-red-600")
                    )}
                  >
                    {hasErrors ? "-" : money(r.next)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || unchanged}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {unchanged ? "No changes" : "Update price"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}