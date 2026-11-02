"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteUnits } from "@/utils/action/settings/setting.delete"
import type { Unit } from "@/utils/types/settings.types"
import { getActionError } from "@/utils/helper/setting-validation"

const UNITS_QUERY_KEY = ["get-all-units"]

export function DeleteUnitsDialog({
  open,
  onOpenChange,
  units,
  onDeleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  units: Unit[]
  onDeleted?: (ids: string[]) => void
}) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const count = units.length

  async function handleDelete() {
    if (isDeleting || count === 0) return
    const ids = units.map((u) => u.id)

    setIsDeleting(true)
    try {
      const res = await deleteUnits(ids)

      if (!res.success) {
        toast.error(getActionError(res, "Failed to delete."))
        return
      }

      toast.success(("message" in res && res.message) || `Deleted ${count} ${count === 1 ? "unit" : "units"}.`)
      await queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY })
      onDeleted?.(ids)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete units:", error)
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {count === 1 ? `Delete "${units[0].name}"?` : `Delete ${count} units?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Units that are used by products can&apos;t be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {count > 1 && (
          <ul className="max-h-40 list-disc overflow-y-auto pl-5 text-sm text-muted-foreground">
            {units.map((u) => (
              <li key={u.id} className="truncate">
                {u.name}
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} aria-busy={isDeleting}>
            {isDeleting && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}