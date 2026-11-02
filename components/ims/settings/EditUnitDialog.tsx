"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
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
import { Label } from "@/components/ui/label"
import { updateUnit } from "@/utils/action/settings/setting.put"
import type { Unit } from "@/utils/types/settings.types"
import { UNIT_NAME_MAX, getActionError, validateUnitName } from "@/utils/helper/setting-validation"

const UNITS_QUERY_KEY = ["get-all-units"]

export function EditUnitDialog({
  open,
  onOpenChange,
  unit,
  units,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: Unit | null
  units: Unit[]
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")
  const [allowDecimal, setAllowDecimal] = useState(false)
  const [touched, setTouched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open || !unit) return
    setName(unit.name)
    setAllowDecimal(unit.allow_decimal)
    setTouched(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, unit?.id])

  const error = useMemo(() => validateUnitName(name, units, { ignoreId: unit?.id }), [name, units, unit?.id])
  const isUnchanged = unit ? name.trim() === unit.name && allowDecimal === unit.allow_decimal : true

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!unit || isSaving) return

    setTouched(true)
    if (error) return
    if (isUnchanged) {
      onOpenChange(false)
      return
    }

    setIsSaving(true)
    try {
      const res = await updateUnit({ id: unit.id, name: name.trim(), allow_decimal: allowDecimal })

      if (!res.success) {
        toast.error(getActionError(res, "Failed to update unit."))
        return
      }

      toast.success(res.message || "Unit updated.")
      await queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY })
      onOpenChange(false)
    } catch (err) {
      console.error("Failed to update unit:", err)
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const showError = touched ? error : undefined

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Edit unit</DialogTitle>
            <DialogDescription>Update the name or quantity type of this unit.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-unit-name">
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="edit-unit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={UNIT_NAME_MAX}
              disabled={isSaving}
              autoFocus
              aria-invalid={Boolean(showError)}
            />
            {showError && (
              <p role="alert" className="text-xs text-destructive">
                {showError}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={allowDecimal}
              onCheckedChange={(v) => setAllowDecimal(v === true)}
              disabled={isSaving}
            />
            Allow decimal quantities
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUnchanged} aria-busy={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}