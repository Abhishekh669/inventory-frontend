"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Decimal from "decimal.js"
import { AlertCircle, ClipboardList, Loader2, PackagePlus, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getActionError } from "@/utils/helper/category-validation"
import { formatMoney } from "@/utils/helper/format"
import type { ProductsListType } from "@/utils/types/product.types"
import type {
  PurchaseOrderDetail,
  PurchaseOrderEditableStatus,
  PurchaseOrderItemRequestType,
} from "@/utils/types/purchase-order.types"
import { PURCHASE_ORDER_STATUS_LABELS } from "./PurchaseOrderStatusBar"
import { useGetPurchaseOrder } from "@/utils/hooks/tanstack/purchase-order/use-get-purchase-order-by-id"
import { PurchaseOrderProductPicker } from "./PurchaseOrderProductPicker"
import { updatePurchaseOrder } from "@/utils/action/purchases-order/purchase-order.put"
import { createPurchaseOrder } from "@/utils/action/purchases-order/purchase-order.post"

const MAX_ITEMS = 100
const MAX_TITLE = 150
const MAX_NOTE = 2000
const DECIMAL_RE = /^\d+(\.\d+)?$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const LINE_GRID = "sm:grid-cols-[minmax(0,1fr)_7.5rem_8.5rem_7rem_2rem]"

type Line = {
  key: number
  id?: string // set for a line that already exists on the server
  productId: string
  name: string
  sku: string
  unitName: string
  allowDecimal: boolean
  qty: string
  cost: string
}

type FormValues = {
  title: string
  orderDate: string
  expectedDate: string
  status: PurchaseOrderEditableStatus
  note: string
  lines: Line[]
}

type LineErrors = { qty?: string; cost?: string }

function todayLocal() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function trimDecimal(value: string) {
  return DECIMAL_RE.test(value) ? new Decimal(value).toString() : value
}

function emptyValues(): FormValues {
  return { title: "", orderDate: todayLocal(), expectedDate: "", status: "draft", note: "", lines: [] }
}

function fromDetail(detail: PurchaseOrderDetail): FormValues {
  return {
    title: detail.title ?? "",
    orderDate: detail.order_date,
    expectedDate: detail.expected_date ?? "",
    status: detail.status === "sent" ? "sent" : detail.status === "cancelled" ? "cancelled" : "draft",
    note: detail.note ?? "",
    lines: detail.items.map((item, index) => ({
      key: index + 1,
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      sku: item.product_sku,
      unitName: item.unit_name,
      allowDecimal: item.allow_decimal,
      qty: trimDecimal(item.qty_ordered),
      cost: item.expected_unit_cost ? trimDecimal(item.expected_unit_cost) : "",
    })),
  }
}

function lineTotal(line: Line) {
  if (!DECIMAL_RE.test(line.qty) || !DECIMAL_RE.test(line.cost)) return null
  return new Decimal(line.qty).mul(line.cost)
}

function SectionHeading({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background"
        aria-hidden="true"
      >
        {step}
      </span>
      <div>
        <h3 className="text-sm font-semibold leading-6">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function PurchaseOrderFormDialog({
  open,
  onOpenChange,
  supplierId,
  supplierName,
  purchaseOrderId,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: string
  supplierName?: string
  purchaseOrderId: string | null
  onSaved: (purchaseOrderId?: string) => void
}) {
  const isEdit = Boolean(purchaseOrderId)
  const [isSaving, setIsSaving] = useState(false)

  const { data, isLoading, isError, error, refetch } = useGetPurchaseOrder(purchaseOrderId ?? "", open && isEdit)
  const detail = data?.purchase_order

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-5 py-4 pr-14 text-left sm:px-6 sm:py-5">
          <div className="flex items-start gap-3.5">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <ClipboardList className="size-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                {isEdit ? `Edit ${detail?.po_no ?? "purchase order"}` : "New purchase order"}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit
                  ? "Change the details or the products. Only draft and sent orders can be edited."
                  : `Create an order${supplierName ? ` for ${supplierName}` : ""} and add the products you want to buy.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isEdit && isLoading ? (
          <div className="flex flex-col gap-3 px-5 py-6 sm:px-6" aria-busy="true" aria-label="Loading purchase order">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : isEdit && (isError || !detail) ? (
          <div className="px-5 py-6 sm:px-6">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-10 text-center">
              <AlertCircle className="size-5 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Couldn't load this purchase order."}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                <RotateCcw data-icon="inline-start" /> Try again
              </Button>
            </div>
          </div>
        ) : (
          <PurchaseOrderForm
            key={detail?.id ?? "new"}
            supplierId={supplierId}
            detail={detail}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            onCancel={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function PurchaseOrderForm({
  supplierId,
  detail,
  isSaving,
  setIsSaving,
  onCancel,
  onSaved,
}: {
  supplierId: string
  detail?: PurchaseOrderDetail
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  onCancel: () => void
  onSaved: (purchaseOrderId?: string) => void
}) {
  const isEdit = Boolean(detail)
  const [values, setValues] = useState<FormValues>(() => (detail ? fromDetail(detail) : emptyValues()))
  const [submitted, setSubmitted] = useState(false)
  const nextKey = useRef(detail ? detail.items.length + 1 : 1)
  const focusKey = useRef<number | null>(null)

  const patch = (changes: Partial<FormValues>) => setValues((current) => ({ ...current, ...changes }))

  const updateLine = (key: number, changes: Partial<Line>) =>
    setValues((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.key === key ? { ...line, ...changes } : line)),
    }))

  const removeLine = (key: number) =>
    setValues((current) => ({ ...current, lines: current.lines.filter((line) => line.key !== key) }))

  function addProduct(product: ProductsListType) {
    if (values.lines.length >= MAX_ITEMS) {
      toast.error(`You can add up to ${MAX_ITEMS} products.`)
      return
    }
    if (values.lines.some((line) => line.productId === product.id)) return

    const key = nextKey.current++
    focusKey.current = key
    setValues((current) => ({
      ...current,
      lines: [
        ...current.lines,
        {
          key,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitName: product.unit_name,
          allowDecimal: product.allow_decimal,
          qty: "1",
          cost: trimDecimal(product.cost_price),
        },
      ],
    }))
  }

  // after adding a product, bring its line into view and put the cursor in the quantity box
  useEffect(() => {
    const key = focusKey.current
    if (key === null) return
    focusKey.current = null

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById(`po-line-${key}`)?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
    })
    const qty = document.getElementById(`po-qty-${key}`) as HTMLInputElement | null
    qty?.focus({ preventScroll: true })
    qty?.select()
  }, [values.lines])

  const addedIds = useMemo(() => new Set(values.lines.map((line) => line.productId)), [values.lines])

  const errors = useMemo(() => {
    const e: { title?: string; orderDate?: string; expectedDate?: string; note?: string; lines?: string } = {}

    if (values.title.trim().length > MAX_TITLE) e.title = `Title must be at most ${MAX_TITLE} characters`
    if (!DATE_RE.test(values.orderDate)) e.orderDate = "Choose the order date"
    if (values.expectedDate) {
      if (!DATE_RE.test(values.expectedDate)) e.expectedDate = "Choose a valid date"
      else if (DATE_RE.test(values.orderDate) && values.expectedDate < values.orderDate) {
        e.expectedDate = "Can't be before the order date"
      }
    }
    if (values.note.trim().length > MAX_NOTE) e.note = `Note must be at most ${MAX_NOTE} characters`
    if (values.lines.length === 0) e.lines = "Add at least one product"

    const lineErrors: LineErrors[] = values.lines.map((line) => {
      const le: LineErrors = {}
      const qtyDp = line.allowDecimal ? 3 : 0

      if (!DECIMAL_RE.test(line.qty)) le.qty = "Enter a quantity"
      else {
        const qty = new Decimal(line.qty)
        if (qty.lte(0)) le.qty = "Must be more than 0"
        else if (qty.gt("99999999999")) le.qty = "Too large"
        else if (qty.decimalPlaces() > qtyDp) le.qty = qtyDp === 0 ? "Whole numbers only" : "Up to 3 decimals"
      }

      if (line.cost.trim() !== "") {
        if (!DECIMAL_RE.test(line.cost)) le.cost = "Enter a number"
        else {
          const cost = new Decimal(line.cost)
          if (cost.gt("9999999999")) le.cost = "Too large"
          else if (cost.decimalPlaces() > 4) le.cost = "Up to 4 decimals"
        }
      }
      return le
    })

    return { ...e, lineErrors }
  }, [values])

  const hasErrors =
    Boolean(errors.title || errors.orderDate || errors.expectedDate || errors.note || errors.lines) ||
    errors.lineErrors.some((le) => le.qty || le.cost)

  const expected = useMemo(() => {
    let sum = new Decimal(0)
    let priced = 0
    for (const line of values.lines) {
      const total = lineTotal(line)
      if (total) {
        sum = sum.plus(total)
        priced++
      }
    }
    return priced > 0 ? sum : null
  }, [values.lines])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    setSubmitted(true)
    if (hasErrors) return

    const items: PurchaseOrderItemRequestType[] = values.lines.map((line) => ({
      ...(line.id ? { id: line.id } : {}),
      product_id: line.productId,
      qty_ordered: new Decimal(line.qty).toFixed(3),
      expected_unit_cost: line.cost.trim() ? new Decimal(line.cost).toFixed(4) : null,
    }))

    const body = {
      title: values.title.trim() || null,
      order_date: values.orderDate,
      expected_date: values.expectedDate || null,
      status: values.status,
      note: values.note.trim() || null,
      items,
    }

    setIsSaving(true)
    try {
      const res = detail
        ? await updatePurchaseOrder({ id: detail.id, ...body })
        : await createPurchaseOrder({ supplier_id: supplierId, ...body })

      if (!res.success) {
        toast.error(getActionError(res, isEdit ? "Failed to update purchase order." : "Failed to create purchase order."))
        return
      }

      toast.success(res.message || (isEdit ? "Purchase order updated." : "Purchase order created."))
      onSaved(detail?.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const statusOptions: PurchaseOrderEditableStatus[] = isEdit ? ["draft", "sent", "cancelled"] : ["draft", "sent"]

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-7">
          <section className="flex flex-col gap-4" aria-label="Order details">
            <SectionHeading step={1} title="Order details" description="Give the order a name and set its dates." />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="po-title">Title</Label>
                <Input
                  id="po-title"
                  className="h-10 rounded-lg"
                  value={values.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="e.g. Roofing materials for November"
                  maxLength={MAX_TITLE + 50}
                  disabled={isSaving}
                  aria-invalid={submitted && Boolean(errors.title)}
                />
                {submitted && errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(v) => patch({ status: String(v) as PurchaseOrderEditableStatus })}
                  disabled={isSaving}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg">
                    <SelectValue>{PURCHASE_ORDER_STATUS_LABELS[values.status]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {PURCHASE_ORDER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Draft is still being prepared. Sent is with the supplier.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="po-order-date">Order date</Label>
                <Input
                  id="po-order-date"
                  type="date"
                  className="h-10 rounded-lg"
                  value={values.orderDate}
                  onChange={(e) => patch({ orderDate: e.target.value })}
                  disabled={isSaving}
                  aria-invalid={submitted && Boolean(errors.orderDate)}
                />
                {submitted && errors.orderDate && <p className="text-xs text-destructive">{errors.orderDate}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="po-expected-date">Expected delivery</Label>
                <Input
                  id="po-expected-date"
                  type="date"
                  className="h-10 rounded-lg"
                  value={values.expectedDate}
                  min={values.orderDate || undefined}
                  onChange={(e) => patch({ expectedDate: e.target.value })}
                  disabled={isSaving}
                  aria-invalid={submitted && Boolean(errors.expectedDate)}
                />
                {submitted && errors.expectedDate && <p className="text-xs text-destructive">{errors.expectedDate}</p>}
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <Label htmlFor="po-note">Note</Label>
                <Textarea
                  id="po-note"
                  className="rounded-lg"
                  value={values.note}
                  onChange={(e) => patch({ note: e.target.value })}
                  rows={2}
                  placeholder="Optional"
                  disabled={isSaving}
                  aria-invalid={submitted && Boolean(errors.note)}
                />
                {submitted && errors.note && <p className="text-xs text-destructive">{errors.note}</p>}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4" aria-label="Products">
            <SectionHeading step={2} title="Products" description="Search your catalogue and add what you want to order." />

            <div className="rounded-xl border bg-muted/20 p-4">
              <PurchaseOrderProductPicker addedIds={addedIds} onAdd={addProduct} disabled={isSaving} />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Products in this order</h4>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                  {values.lines.length} / {MAX_ITEMS}
                </span>
              </div>

              {values.lines.length === 0 ? (
                <div
                  className={`flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center text-sm ${
                    submitted && errors.lines ? "border-destructive text-destructive" : "text-muted-foreground"
                  }`}
                >
                  <PackagePlus className="size-6" aria-hidden="true" />
                  <p>No products yet. Search above and click Add.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border bg-background">
                  <div
                    className={`hidden gap-3 bg-muted/40 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid ${LINE_GRID}`}
                    aria-hidden="true"
                  >
                    <span>Product</span>
                    <span>Quantity</span>
                    <span>Expected cost (Rs)</span>
                    <span className="text-right">Line total</span>
                    <span />
                  </div>

                  <ul className="divide-y border-t sm:border-t">
                    {values.lines.map((line, index) => {
                      const lineErrors = submitted ? errors.lineErrors[index] : undefined
                      const total = lineTotal(line)
                      return (
                        <li
                          key={line.key}
                          id={`po-line-${line.key}`}
                          className={`grid gap-3 px-4 py-3.5 sm:items-start ${LINE_GRID}`}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{line.name}</p>
                           
                          </div>

                          <div className="flex flex-col gap-1">
                            <Label htmlFor={`po-qty-${line.key}`} className="text-xs sm:sr-only">
                              Quantity ({line.unitName})
                            </Label>
                            <Input
                              id={`po-qty-${line.key}`}
                              className="h-9 rounded-lg"
                              inputMode="decimal"
                              value={line.qty}
                              onChange={(e) => updateLine(line.key, { qty: e.target.value })}
                              onFocus={(e) => e.target.select()}
                              disabled={isSaving}
                              aria-invalid={Boolean(lineErrors?.qty)}
                            />
                            {lineErrors?.qty && <p className="text-xs text-destructive">{lineErrors.qty}</p>}
                          </div>

                          <div className="flex flex-col gap-1">
                            <Label htmlFor={`po-cost-${line.key}`} className="text-xs sm:sr-only">
                              Expected cost (Rs)
                            </Label>
                            <Input
                              id={`po-cost-${line.key}`}
                              className="h-9 rounded-lg"
                              inputMode="decimal"
                              value={line.cost}
                              onChange={(e) => updateLine(line.key, { cost: e.target.value })}
                              onFocus={(e) => e.target.select()}
                              placeholder="Optional"
                              disabled={isSaving}
                              aria-invalid={Boolean(lineErrors?.cost)}
                            />
                            {lineErrors?.cost && <p className="text-xs text-destructive">{lineErrors.cost}</p>}
                          </div>

                          <p className="flex items-center justify-between text-sm font-medium tabular-nums sm:block sm:pt-2 sm:text-right">
                            <span className="text-xs font-normal text-muted-foreground sm:hidden">Line total</span>
                            {total ? formatMoney(total.toFixed(2)) : "-"}
                          </p>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 justify-self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeLine(line.key)}
                            disabled={isSaving}
                            aria-label={`Remove ${line.name}`}
                          >
                            <Trash2 />
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {submitted && errors.lines && values.lines.length === 0 && (
                <p className="text-xs text-destructive">{errors.lines}</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted-foreground">
          {expected ? (
            <>
              Expected total{" "}
              <span className="text-lg font-semibold text-foreground tabular-nums">{formatMoney(expected.toFixed(2))}</span>
            </>
          ) : (
            "Add expected costs to see a total."
          )}
        </p>
        <div className="flex gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="flex-1 rounded-lg sm:flex-none" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1 rounded-lg sm:flex-none" disabled={isSaving} aria-busy={isSaving}>
            {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create purchase order"}
          </Button>
        </div>
      </div>
    </form>
  )
}