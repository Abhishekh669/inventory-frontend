"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SupplierLedgerFilterValues } from "@/utils/types/supplier-payment.types"

type Props = {
  value: SupplierLedgerFilterValues
  onChange: (value: SupplierLedgerFilterValues) => void
}

export function SupplierLedgerFilters({ value, onChange }: Props) {
  const hasFilters = Boolean(value.from_date || value.to_date)

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="ledger-from">From date</Label>
        <Input
          id="ledger-from"
          type="date"
          className="w-44"
          value={value.from_date ?? ""}
          max={value.to_date || undefined}
          onChange={(e) => onChange({ ...value, from_date: e.target.value || undefined })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="ledger-to">To date</Label>
        <Input
          id="ledger-to"
          type="date"
          className="w-44"
          value={value.to_date ?? ""}
          min={value.from_date || undefined}
          onChange={(e) => onChange({ ...value, to_date: e.target.value || undefined })}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={() => onChange({})}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}