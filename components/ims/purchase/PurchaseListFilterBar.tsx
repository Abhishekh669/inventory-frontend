"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type {
    PaymentStatus,
    PurchaseListFilterValues,
    PurchaseOrderStatus,
    PurchaseStatus,
} from "@/utils/types/purchase.types"

export interface PurchaseListFilterDraft {
    search: string
    purchase_order_status: PurchaseOrderStatus | "all"
    purchase_status: PurchaseStatus | "all"
    payment_status: PaymentStatus | "all"
    from_date: string
    to_date: string
}

export const DEFAULT_PURCHASE_LIST_FILTER_DRAFT: PurchaseListFilterDraft = {
    search: "",
    purchase_order_status: "all",
    purchase_status: "all",
    payment_status: "all",
    from_date: "",
    to_date: "",
}

export function draftToFilters(draft: PurchaseListFilterDraft): PurchaseListFilterValues {
    return {
        search: draft.search.trim() || undefined,
        purchase_order_status:
            draft.purchase_order_status === "all" ? undefined : draft.purchase_order_status,
        purchase_status: draft.purchase_status === "all" ? undefined : draft.purchase_status,
        payment_status: draft.payment_status === "all" ? undefined : draft.payment_status,
        from_date: draft.from_date || undefined,
        to_date: draft.to_date || undefined,
    }
}

interface Props {
    value: PurchaseListFilterDraft
    onChange: (next: PurchaseListFilterDraft) => void
    onApply: () => void
    onClear: () => void
}

export function PurchaseListFilterBar({ value, onChange, onApply, onClear }: Props) {
    const set = <K extends keyof PurchaseListFilterDraft>(key: K, v: PurchaseListFilterDraft[K]) =>
        onChange({ ...value, [key]: v })

    return (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    className="pl-9"
                    placeholder="Search PO number, title or bill number"
                    value={value.search}
                    onChange={(e) => set("search", e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onApply()}
                    maxLength={100}
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Select
                    value={value.purchase_order_status}
                    onValueChange={(v) => set("purchase_order_status", v as PurchaseListFilterDraft["purchase_order_status"])}
                >
                    <SelectTrigger><SelectValue placeholder="Order status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All order statuses</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={value.purchase_status}
                    onValueChange={(v) => set("purchase_status", v as PurchaseListFilterDraft["purchase_status"])}
                >
                    <SelectTrigger><SelectValue placeholder="Purchase status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All purchase statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={value.payment_status}
                    onValueChange={(v) => set("payment_status", v as PurchaseListFilterDraft["payment_status"])}
                >
                    <SelectTrigger><SelectValue placeholder="Payment status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All payment statuses</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    type="date"
                    aria-label="From date"
                    value={value.from_date}
                    max={value.to_date || undefined}
                    onChange={(e) => set("from_date", e.target.value)}
                />
                <Input
                    type="date"
                    aria-label="To date"
                    value={value.to_date}
                    min={value.from_date || undefined}
                    onChange={(e) => set("to_date", e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onClear}>
                    <X data-icon="inline-start" /> Clear
                </Button>
                <Button size="sm" onClick={onApply}>Apply filters</Button>
            </div>
        </div>
    )
}