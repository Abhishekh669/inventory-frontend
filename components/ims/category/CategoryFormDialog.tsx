'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/utils/types/category.types'
import { updateCategory } from '@/utils/action/categories/categories.put'
import { createCategory } from '@/utils/action/categories/categories.post'

const CATEGORIES_QUERY_KEY = ['get-all-categories']

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pass a category to edit it; leave empty to create a new one. */
  category?: Category | null
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const isEdit = Boolean(category)
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset the form each time the dialog opens
  useEffect(() => {
    if (!open) return
    setName(category?.name ?? '')
    setSlug(category?.slug ?? '')
    setSlugTouched(false)
  }, [open, category, isEdit])

  function handleNameChange(value: string) {
    setName(value)
    // Keep the slug in sync until the user edits it by hand
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    const cleanName = name.trim()
    const cleanSlug = slugify(slug)

    if (!cleanName || !cleanSlug) {
      toast.error('Name and slug are required.')
      return
    }

    setIsSaving(true)
    try {
      const res = category
        ? await updateCategory({ id: category.id, name: cleanName, slug: cleanSlug })
        : await createCategory({ name: cleanName, slug: cleanSlug })

      if (!res.success) {
        toast.error(
          ('error' in res && typeof res.error === 'string' && res.error) ||
            `Failed to ${isEdit ? 'update' : 'create'} category.`
        )
        return
      }

      toast.success(res.message || `Category ${isEdit ? 'updated' : 'created'}.`)
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update the name or slug of this category.' : 'Add a category to organize your products.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">
              Name <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Beverages"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category-slug">
              Slug <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Input
              id="category-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              placeholder="e.g. beverages"
              required
            />
            <p className="text-xs text-muted-foreground">Lowercase letters, numbers and hyphens only.</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isSaving ? 'Saving...' : isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}