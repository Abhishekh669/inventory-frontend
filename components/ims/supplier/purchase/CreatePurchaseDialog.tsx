"use client"

import { useMemo, useState, useTransition } from "react"
import { AlertCircle, ArrowLeft, Info as InfoIcon, Loader2, Plus, Trash2, Undo2 } from "lucide-react"
import type Decimal from "decimal.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { Supplier } from "@/utils/types/suppliers.types"
import type { PurchaseOrderSummary } from "@/utils/types/purchase-order.types"
import type { PaymentMethod, PurchaseFormRow } from "@/utils/types/purchase.types"
import type { ProductsListType } from "@/utils/types/product.types"
import { calcPurchase, CalcResult, formatMoney, toDecimal } from "@/utils/helper/purchase-cal"
import { useGetPurchaseOrderItems } from "@/utils/hooks/tanstack/purchase-order/use-get-purchase-order-items"
import { createPurchase } from "@/utils/action/purchase/purchase.post"
import { PurchaseOrderStatusBadge } from "../../purchase-order/PurchaseOrderStatusBar"
import { PurchaseOrderProductPicker } from "../../purchase-order/PurchaseOrderProductPicker"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    supplier: Supplier
    purchaseOrder: PurchaseOrderSummary
    onCreated: (purchaseOrderId: string) => void
}

const today = () => new Date().toISOString().slice(0, 10)
const newKey = (id: string) => `new:${id}`

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value || "-"}</span>
        </div>
    )
}

function Section({
    title,
    description,
    children,
    className,
}: {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <section className={cn("rounded-xl border p-4", className)}>
            <div className="mb-3">
                <h3 className="text-sm font-semibold">{title}</h3>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            {children}
        </section>
    )
}

// shows how the quantity sent differs from the quantity ordered
function QtyNote({ ordered, qty }: { ordered: Decimal | null; qty: Decimal }) {
    if (!ordered) return null
    const d = qty.sub(ordered)
    if (d.isZero()) return null
    return (
        <p className={cn("mt-1 text-[11px]", d.gt(0) ? "text-amber-600" : "text-red-600")}>
            {d.gt(0) ? `${d.toString()} more than ordered` : `${d.abs().toString()} short`}
        </p>
    )
}

function BillSummary({ calc }: { calc: CalcResult }) {
    return (
        <div className="flex flex-col gap-1">
            <Info label="Gross amount" value={formatMoney(calc.gross)} />
            <Info label="+ Excise duty" value={formatMoney(calc.excise)} />
            <Info label="− Special discount" value={formatMoney(calc.special)} />
            <Info label="− Discount" value={formatMoney(calc.discount)} />
            <Separator className="my-1" />
            <Info label="Taxable amount" value={formatMoney(calc.taxable)} />
            <Info label={`VAT (${calc.vatRate.toString()}%)`} value={formatMoney(calc.vat)} />
            <Info label="+ Freight" value={formatMoney(calc.freight)} />
            <Separator className="my-1" />
            <Info label="Total" value={<strong>{formatMoney(calc.total)}</strong>} />
        </div>
    )
}

export function CreatePurchaseDialog({ open, onOpenChange, supplier, purchaseOrder, onCreated }: Props) {
    const { data, isLoading, isError } = useGetPurchaseOrderItems(purchaseOrder.id)
    const items = useMemo(() => data?.items ?? [], [data])

    const [step, setStep] = useState<"form" | "review">("form")
    const [error, setError] = useState<string | null>(null)
    const [pending, startTransition] = useTransition()

    const [edits, setEdits] = useState<Record<string, { qty: string; rate: string }>>({})
    const [removed, setRemoved] = useState<string[]>([]) // PO item ids taken off this purchase
    const [extras, setExtras] = useState<ProductsListType[]>([]) // products added in this dialog
    const [adding, setAdding] = useState(false)

    const [form, setForm] = useState({
        supplier_bill_no: "",
        purchase_date: today(),
        due_date: "",
        excise_duty: "0",
        special_discount: "0",
        discount: "0",
        vat_rate: "13",
        freight_charge: "0",
        paid_amount: "0",
        payment_method: "cash" as PaymentMethod,
        note: "",
    })
    const setField =
        (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((f) => ({ ...f, [k]: e.target.value }))

    const rows: PurchaseFormRow[] = useMemo(() => {
        const poRows: PurchaseFormRow[] = items
            .filter((it) => !removed.includes(it.id))
            .map((it) => {
                const ordered = toDecimal(it.qty_ordered)
                const expected = it.expected_unit_cost != null ? toDecimal(it.expected_unit_cost) : null
                const e = edits[it.id]
                return {
                    key: it.id,
                    poiId: it.id,
                    productId: it.product_id,
                    name: it.product_name,
                    sku: it.product_sku,
                    unit: it.unit_name,
                    allowDecimal: it.allow_decimal,
                    ordered,
                    expected,
                    isNew: false,
                    qty: e?.qty ?? ordered.toString(), // defaults to what was ordered
                    rate: e?.rate ?? (expected ? expected.toString() : ""),
                }
            })
        const newRows: PurchaseFormRow[] = extras.map((p) => {
            const cost = toDecimal(p.cost_price)
            const e = edits[newKey(p.id)]
            return {
                key: newKey(p.id),
                poiId: null,
                productId: p.id,
                name: p.name,
                sku: p.sku,
                unit: p.unit_name,
                allowDecimal: p.allow_decimal,
                ordered: null,
                expected: cost,
                isNew: true,
                qty: e?.qty ?? "1",
                rate: e?.rate ?? (cost.gt(0) ? cost.toString() : ""),
            }
        })
        return [...poRows, ...newRows]
    }, [items, removed, extras, edits])

    const setRow = (row: PurchaseFormRow, patch: Partial<{ qty: string; rate: string }>) =>
        setEdits((prev) => {
            const base = prev[row.key] ?? { qty: row.qty, rate: row.rate }
            return { ...prev, [row.key]: { ...base, ...patch } }
        })

    const removeRow = (row: PurchaseFormRow) => {
        if (row.poiId) setRemoved((prev) => [...prev, row.poiId!])
        else setExtras((prev) => prev.filter((p) => newKey(p.id) !== row.key))
    }

    // products currently on the purchase (the picker shows these as "Added")
    const usedProductIds = useMemo(() => new Set(rows.map((r) => r.productId)), [rows])

    function addProduct(p: ProductsListType) {
        // a product that was removed from the order comes back as its order line
        const hidden = items.find((i) => i.product_id === p.id && removed.includes(i.id))
        if (hidden) setRemoved((prev) => prev.filter((id) => id !== hidden.id))
        else setExtras((prev) => [...prev, p])
        setAdding(false)
    }

    const paid = toDecimal(form.paid_amount)

    const calc = useMemo(
        () =>
            calcPurchase(
                rows.map((r) => ({ key: r.key, qty: toDecimal(r.qty), rate: toDecimal(r.rate), expected: r.expected })),
                {
                    excise: toDecimal(form.excise_duty),
                    special: toDecimal(form.special_discount),
                    discount: toDecimal(form.discount),
                    vatRate: toDecimal(form.vat_rate),
                    freight: toDecimal(form.freight_charge),
                }
            ),
        [rows, form]
    )

    const rowByKey = useMemo(() => new Map(rows.map((r) => [r.key, r])), [rows])
    const changedCount = calc.lines.filter((l) => l.priceChanged).length
    const balanceAfter = toDecimal(supplier.balance).add(calc.total).sub(paid)

    // the order is only "received" when every ordered line arrives in full
    const willBePartial =
        removed.length > 0 || rows.some((r) => r.ordered !== null && toDecimal(r.qty).lt(r.ordered))
    const qtyDiffCount = rows.filter((r) => r.ordered !== null && !toDecimal(r.qty).eq(r.ordered)).length

    function validate(): string | null {
        if (!form.supplier_bill_no.trim()) return "Supplier bill number is required."
        if (calc.lines.length === 0) return "Enter a purchase quantity for at least one item."
        for (const l of calc.lines) {
            const r = rowByKey.get(l.key)!
            if (!r.allowDecimal && !l.qty.isInteger()) return `${r.name}: quantity must be a whole number.`
            if (l.rate.lte(0)) return `${r.name}: enter the purchase rate.`
        }
        for (const k of ["excise_duty", "special_discount", "discount", "freight_charge", "paid_amount"] as const) {
            if (toDecimal(form[k]).lt(0)) return "Amounts cannot be negative."
        }
        const vat = toDecimal(form.vat_rate)
        if (vat.lt(0) || vat.gt(100)) return "VAT rate must be between 0 and 100."
        if (calc.gross.add(calc.excise).sub(calc.special).sub(calc.discount).lt(0))
            return "Discounts are larger than the gross amount."
        if (paid.gt(calc.total)) return "Paid amount cannot be more than the total."
        if (form.due_date && form.due_date < form.purchase_date) return "Due date cannot be before the purchase date."
        return null
    }

    function goReview() {
        const msg = validate()
        setError(msg)
        if (!msg) setStep("review")
    }

    function submit() {
        const msg = validate()
        if (msg) return setError(msg)
        setError(null)
        startTransition(async () => {
            const res = await createPurchase({
                purchase_order_id: purchaseOrder.id,
                supplier_bill_no: form.supplier_bill_no.trim(),
                purchase_date: form.purchase_date,
                due_date: form.due_date || null,
                excise_duty: toDecimal(form.excise_duty).toString(),
                special_discount: toDecimal(form.special_discount).toString(),
                discount: toDecimal(form.discount).toString(),
                vat_rate: toDecimal(form.vat_rate).toString(),
                freight_charge: toDecimal(form.freight_charge).toString(),
                paid_amount: paid.toString(),
                payment_method: form.payment_method,
                note: form.note.trim() || null,
                items: calc.lines.map((l) => {
                    const r = rowByKey.get(l.key)!
                    return {
                        purchase_order_item_id: r.poiId,
                        product_id: r.productId,
                        qty: l.qty.toString(),
                        rate: l.rate.toString(),
                    }
                }),
            })
            if (!res.success) return setError(res.error ?? "Could not create the purchase.")
                
            onCreated(purchaseOrder.id)
        })
    }

    const productCell = (r: PurchaseFormRow) => (
        <TableCell>
            <div className="flex items-center gap-2">
                <p className="font-medium">{r.name}</p>
                {r.isNew && (
                    <span className="rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Added
                    </span>
                )}
            </div>
            
        </TableCell>
    )

    return (
        <Dialog open={open} onOpenChange={(v) => !pending && onOpenChange(v)}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>
                        {step === "form" ? "Create purchase" : "Review purchase"} · {purchaseOrder.po_no}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "form"
                            ? "Enter what the supplier actually sent and billed. Only the purchase quantity is added to stock."
                            : "Check the amounts and price changes before posting. Stock is updated when you confirm."}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                ) : isError ? (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="size-4" /> Could not load the order items.
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {/* supplier + purchase order */}
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/20 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supplier</p>
                                <Info label="Name" value={supplier.name} />
                                <Info label="Contact" value={supplier.contact_person} />
                                <Info label="Phone" value={supplier.phone} />
                                <Info label="PAN no" value={supplier.pan_no} />
                                <Info label="We owe" value={formatMoney(toDecimal(supplier.balance))} />
                                <Info label="Credit balance" value={formatMoney(toDecimal(supplier.credit_balance))} />
                            </div>
                            <div className="flex flex-col gap-1.5 rounded-xl border bg-muted/20 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Purchase order
                                </p>
                                <Info label="PO no" value={<span className="font-mono">{purchaseOrder.po_no}</span>} />
                                <Info label="Title" value={purchaseOrder.title} />
                                <Info label="Status" value={<PurchaseOrderStatusBadge status={purchaseOrder.status} />} />
                                <Info label="Note" value={purchaseOrder.note} />
                            </div>
                        </div>

                        {step === "form" ? (
                            <>
                                {/* items */}
                                <section className="flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold">Items ({rows.length})</h3>
                                        <div className="flex items-center gap-2">
                                            {removed.length > 0 && (
                                                <Button variant="ghost" size="sm" onClick={() => setRemoved([])}>
                                                    <Undo2 className="mr-1.5 size-4" /> Restore {removed.length} removed
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => setAdding((v) => !v)}>
                                                <Plus className="mr-1.5 size-4" /> Add product
                                            </Button>
                                        </div>
                                    </div>

                                    {adding && (
                                        <div className="rounded-xl border bg-muted/20 p-3">
                                            <PurchaseOrderProductPicker addedIds={usedProductIds} onAdd={addProduct} />
                                        </div>
                                    )}

                                    <div className="overflow-x-auto rounded-xl border">
                                        <Table className="min-w-[860px]">
                                            <TableHeader>
                                                <TableRow className="bg-muted/40">
                                                    <TableHead>Product</TableHead>
                                                    <TableHead className="text-right" title="Quantity you ordered from the supplier">
                                                        Ordered
                                                    </TableHead>
                                                    <TableHead className="w-36" title="Quantity the supplier actually sent">
                                                        Purchase qty
                                                    </TableHead>
                                                    <TableHead className="text-right">Expected cost</TableHead>
                                                    <TableHead className="w-32">Rate</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                    <TableHead className="w-10" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rows.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                                                            No items. Add a product or restore a removed one.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {rows.map((r) => {
                                                    const line = calc.lines.find((l) => l.key === r.key)
                                                    return (
                                                        <TableRow key={r.key}>
                                                            {productCell(r)}
                                                            <TableCell className="text-right tabular-nums">
                                                                {r.ordered?.toString() ?? "-"}
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <Input
                                                                    inputMode="decimal"
                                                                    value={r.qty}
                                                                    onChange={(e) => setRow(r, { qty: e.target.value })}
                                                                />
                                                                <QtyNote ordered={r.ordered} qty={toDecimal(r.qty)} />
                                                            </TableCell>
                                                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                                                {r.expected ? formatMoney(r.expected) : "-"}
                                                            </TableCell>
                                                            <TableCell className="align-top">
                                                                <Input
                                                                    inputMode="decimal"
                                                                    value={r.rate}
                                                                    onChange={(e) => setRow(r, { rate: e.target.value })}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-right tabular-nums">
                                                                {line ? formatMoney(line.lineValue) : "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8 text-destructive hover:text-destructive"
                                                                    aria-label={`Remove ${r.name}`}
                                                                    onClick={() => removeRow(r)}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Ordered is what you asked the supplier for. Purchase qty is what they actually sent. You
                                        can enter more or less than ordered. Items removed here stay on the purchase order as
                                        not received.
                                    </p>
                                </section>

                                {/* details + summary */}
                                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="flex flex-col gap-4">
                                        <Section title="Bill details">
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <Field label="Supplier bill no *">
                                                    <Input value={form.supplier_bill_no} onChange={setField("supplier_bill_no")} />
                                                </Field>
                                                <Field label="Purchase date">
                                                    <Input type="date" value={form.purchase_date} onChange={setField("purchase_date")} />
                                                </Field>
                                                <Field label="Due date">
                                                    <Input type="date" value={form.due_date} onChange={setField("due_date")} />
                                                </Field>
                                            </div>
                                        </Section>

                                        <Section title="Charges and discounts" description="Applied once on the bill, after the gross amount.">
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                <Field label="Excise duty">
                                                    <Input inputMode="decimal" value={form.excise_duty} onChange={setField("excise_duty")} />
                                                </Field>
                                                <Field label="Special discount">
                                                    <Input
                                                        inputMode="decimal"
                                                        value={form.special_discount}
                                                        onChange={setField("special_discount")}
                                                    />
                                                </Field>
                                                <Field label="Discount">
                                                    <Input inputMode="decimal" value={form.discount} onChange={setField("discount")} />
                                                </Field>
                                                <Field label="VAT rate (%)">
                                                    <Input inputMode="decimal" value={form.vat_rate} onChange={setField("vat_rate")} />
                                                </Field>
                                                <Field label="Freight charge">
                                                    <Input
                                                        inputMode="decimal"
                                                        value={form.freight_charge}
                                                        onChange={setField("freight_charge")}
                                                    />
                                                </Field>
                                            </div>
                                        </Section>

                                        <Section title="Payment and note">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <Field label="Paid now">
                                                    <Input inputMode="decimal" value={form.paid_amount} onChange={setField("paid_amount")} />
                                                </Field>
                                                <Field label="Payment method">
                                                    <Select
                                                        value={form.payment_method}
                                                        onValueChange={(v) =>
                                                            setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cash">Cash</SelectItem>
                                                            <SelectItem value="bank">Bank</SelectItem>
                                                            <SelectItem value="cheque">Cheque</SelectItem>
                                                            <SelectItem value="online">Online</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                                <Field label="Note" className="sm:col-span-2">
                                                    <Textarea rows={2} value={form.note} onChange={setField("note")} />
                                                </Field>
                                            </div>
                                        </Section>
                                    </div>

                                    <aside className="flex flex-col gap-3 lg:sticky lg:top-0 lg:self-start">
                                        <div className="rounded-xl border p-4">
                                            <p className="mb-2 text-sm font-semibold">Bill summary</p>
                                            <BillSummary calc={calc} />
                                        </div>
                                        <div className="flex flex-col gap-1 rounded-xl border p-4">
                                            <Info label="Paid now" value={formatMoney(paid)} />
                                            <Info label="Due on this bill" value={formatMoney(calc.total.sub(paid))} />
                                            <Separator className="my-1" />
                                            <Info label="Supplier balance after" value={formatMoney(balanceAfter)} />
                                        </div>
                                    </aside>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-xl border">
                                    <Table className="min-w-[860px]">
                                        <TableHeader>
                                            <TableRow className="bg-muted/40">
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Ordered</TableHead>
                                                <TableHead className="text-right">Purchase qty</TableHead>
                                                <TableHead className="text-right">Expected cost</TableHead>
                                                <TableHead className="text-right">Rate</TableHead>
                                                <TableHead className="text-right">Price difference</TableHead>
                                                <TableHead className="text-right">Cost + VAT</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {calc.lines.map((l) => {
                                                const r = rowByKey.get(l.key)!
                                                return (
                                                    <TableRow key={l.key}>
                                                        {productCell(r)}
                                                        <TableCell className="text-right tabular-nums">
                                                            {r.ordered?.toString() ?? "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {l.qty.toString()}
                                                            <div className="flex justify-end">
                                                                <QtyNote ordered={r.ordered} qty={l.qty} />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                                            {l.expected ? formatMoney(l.expected) : "-"}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">{formatMoney(l.rate)}</TableCell>
                                                        <TableCell
                                                            className={cn(
                                                                "text-right tabular-nums",
                                                                l.diff?.gt(0) && "text-red-600",
                                                                l.diff?.lt(0) && "text-emerald-600"
                                                            )}
                                                        >
                                                            {l.diff && !l.diff.isZero()
                                                                ? `${l.diff.gt(0) ? "+" : ""}${formatMoney(l.diff)}${
                                                                      l.diffPct ? ` (${l.diffPct.toFixed(1)}%)` : ""
                                                                  }`
                                                                : "Same"}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatMoney(l.unitCostWithVat)}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">{formatMoney(l.lineValue)}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>

                                {changedCount > 0 && (
                                    <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                        <p>
                                            {changedCount} item{changedCount > 1 ? "s were" : " was"} bought at a different rate than
                                            the expected cost. Cost price and selling price (keeping each product&apos;s margin) will
                                            be updated and a price history entry added. For added products, the expected cost is the
                                            product&apos;s current cost.
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
                                    <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <p>
                                        {qtyDiffCount > 0 &&
                                            `${qtyDiffCount} item${qtyDiffCount > 1 ? "s differ" : " differs"} from the ordered quantity. `}
                                        The purchase quantities are added to stock. The purchase order will be marked{" "}
                                        <strong>{willBePartial ? "Partial" : "Received"}</strong>.
                                    </p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-1.5 rounded-xl border p-4">
                                        <Info label="Bill no" value={form.supplier_bill_no} />
                                        <Info label="Purchase date" value={form.purchase_date} />
                                        <Info label="Due date" value={form.due_date} />
                                        <Info label="Paid now" value={`${formatMoney(paid)} (${form.payment_method})`} />
                                        <Info label="Due on this bill" value={formatMoney(calc.total.sub(paid))} />
                                        <Separator className="my-1" />
                                        <Info label="Supplier balance now" value={formatMoney(toDecimal(supplier.balance))} />
                                        <Info label="Supplier balance after" value={formatMoney(balanceAfter)} />
                                        <Info label="Note" value={form.note} />
                                    </div>
                                    <div className="rounded-xl border p-4">
                                        <BillSummary calc={calc} />
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
                                <AlertCircle className="size-4" /> {error}
                            </p>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {step === "form" ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button onClick={goReview} disabled={isLoading || isError}>
                                Review
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setStep("form")} disabled={pending}>
                                <ArrowLeft className="mr-1.5 size-4" /> Back
                            </Button>
                            <Button onClick={submit} disabled={pending}>
                                {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                                Confirm purchase
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}