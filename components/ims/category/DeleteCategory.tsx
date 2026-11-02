'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { Category } from '@/utils/types/category.types'
import { deleteCategories } from '@/utils/action/categories/categories.delete'

// Adjust to the key used inside useGetCategories
const CATEGORIES_QUERY_KEY = ['get-all-categories']

type DeleteCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onDeleted?: (ids: string[]) => void
}

export function DeleteCategoryDialog({ open, onOpenChange, categories, onDeleted }: DeleteCategoryDialogProps) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const count = categories.length

  async function handleDelete() {
    if (isDeleting || count === 0) return
    const ids = categories.map((c) => c.id)

    setIsDeleting(true)
    try {
      // Same action for one or many
      const res = await deleteCategories(ids)

      if (!res.success) {
        toast.error(('error' in res && res.error) || 'Failed to delete.')
        return
      }

      toast.success(
        ('message' in res && res.message) || `Deleted ${count} ${count === 1 ? 'category' : 'categories'}.`
      )
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      onDeleted?.(ids)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete categories:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {count === 1 ? `Delete "${categories[0].name}"?` : `Delete ${count} categories?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.{' '}
            {count === 1
              ? 'The category will be permanently removed.'
              : 'All selected categories will be permanently removed.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {count > 1 && (
          <ul className="max-h-40 list-disc overflow-y-auto pl-5 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.id} className="truncate">
                {c.name}
              </li>
            ))}
          </ul>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {/* A plain Button (not AlertDialogAction) so the dialog stays open while deleting */}
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} aria-busy={isDeleting}>
            {isDeleting && <Loader2 data-icon="inline-start" className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}