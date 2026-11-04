"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Plus, Ruler, X } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createUnits } from "@/utils/action/settings/setting.post"
import type { Unit } from "@/utils/types/settings.types"
import { MAX_CREATE_UNITS, UNIT_NAME_MAX, getActionError, validateUnitName } from "@/utils/helper/setting-validation"

const UNITS_QUERY_KEY = ["get-all-units"]

type Row = { key: number; name: string; allowDecimal: boolean }

export function CreateUnitsDialog({
  open,
  onOpenChange,
  units,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  units: Unit[]
}) {
  const queryClient = useQueryClient()
  const nextKey = useRef(1)
  const newRow = (): Row => ({ key: nextKey.current++, name: "", allowDecimal: false })

  const [rows, setRows] = useState<Row[]>(() => [newRow()])
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setRows([newRow()])
    setSubmitted(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const errors = useMemo(
    () =>
      rows.map((row, i) =>
        validateUnitName(row.name, units, {
          otherNames: rows.filter((_, j) => j !== i).map((r) => r.name),
        })
      ),
    [rows, units]
  )

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => (prev.length >= MAX_CREATE_UNITS ? prev : [...prev, newRow()]))
  }

  function removeRow(key: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    setSubmitted(true)
    if (errors.some(Boolean)) return

    setIsSaving(true)
    try {
      const res = await createUnits(
        rows.map((r) => ({ name: r.name.trim(), allow_decimal: r.allowDecimal }))
      )

      if (!res.success) {
        toast.error(getActionError(res, "Failed to create units."))
        return
      }

      toast.success(res.message || `Created ${rows.length} ${rows.length === 1 ? "unit" : "units"}.`)
      await queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create units:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Ruler className="size-5" aria-hidden="true" />
            </div>
            <DialogTitle>Add units</DialogTitle>
            <DialogDescription>
              Add up to {MAX_CREATE_UNITS} units at once. Tick &quot;Decimals&quot; for units that can be
              fractional, like kg or litre.
            </DialogDescription>
          </DialogHeader>

          <ul className="flex max-h-[50vh] flex-col gap-2.5 overflow-y-auto pr-1">
            {rows.map((row, i) => {
              const error = submitted ? errors[i] : undefined
              return (
                <li
                  key={row.key}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border bg-muted/30 p-2.5 transition-colors",
                    error && "border-destructive/40 bg-destructive/5"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-xs font-medium text-muted-foreground shadow-sm"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(row.key, { name: e.target.value })}
                      placeholder="e.g. kg"
                      maxLength={UNIT_NAME_MAX}
                      disabled={isSaving}
                      aria-label={`Unit ${i + 1} name`}
                      aria-invalid={Boolean(error)}
                      autoFocus={i === 0}
                      className="h-9 min-w-[7rem] flex-1 bg-background"
                    />
                    <label
                      className={cn(
                        "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-accent",
                        row.allowDecimal && "border-primary/40 bg-primary/5 text-primary"
                      )}
                    >
                      <Checkbox
                        checked={row.allowDecimal}
                        onCheckedChange={(v) => updateRow(row.key, { allowDecimal: v === true })}
                        disabled={isSaving}
                      />
                      Decimals
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 rounded-lg"
                      onClick={() => removeRow(row.key)}
                      disabled={isSaving || rows.length === 1}
                      aria-label={`Remove unit ${i + 1}`}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  </div>
                  {error && (
                    <p role="alert" className="pl-9 text-xs text-destructive">
                      {error}
                    </p>
                  )}
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
              disabled={isSaving || rows.length >= MAX_CREATE_UNITS}
              className="border-dashed"
            >
              <Plus data-icon="inline-start" /> Add another
            </Button>
            <p className="text-xs tabular-nums text-muted-foreground">
              {rows.length} / {MAX_CREATE_UNITS}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isSaving ? "Creating..." : `Create ${rows.length === 1 ? "unit" : `${rows.length} units`}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}