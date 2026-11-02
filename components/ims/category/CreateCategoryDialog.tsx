'use client'

import { useEffect, useMemo, useState } from 'react'
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
import {
  getActionError,
  sanitizeSlugInput,
  slugify,
  validateName,
  validateSlug,
} from "@/utils/helper/category-validation"
import { Category } from '@/utils/types/category.types'
import { createCategory } from '@/utils/action/categories/categories.post'
import { CategoryFields } from './CategoryField'

// Adjust to the key used inside useGetCategories
const CATEGORIES_QUERY_KEY = ['get-all-categories']

type CreateCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Already fetched categories, used to catch duplicate slugs. */
  categories: Category[]
}

export function CreateCategoryDialog({ open, onOpenChange, categories }: CreateCategoryDialogProps) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [touched, setTouched] = useState({ name: false, slug: false })
  const [isSaving, setIsSaving] = useState(false)

  // Fresh form every time the dialog opens
  useEffect(() => {
    if (!open) return
    setName('')
    setSlug('')
    setSlugEdited(false)
    setTouched({ name: false, slug: false })
  }, [open])

  const nameError = useMemo(() => validateName(name), [name])
  const slugError = useMemo(() => validateSlug(slug, categories), [slug, categories])

  function handleNameChange(value: string) {
    setName(value)
    // Auto-fill the slug until the user edits it by hand
    if (!slugEdited) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true)
    setSlug(sanitizeSlugInput(value))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSaving) return

    setTouched({ name: true, slug: true })
    if (nameError || slugError) return

    setIsSaving(true)
    try {
      const res = await createCategory({ name: name.trim(), slug })

      if (!res.success) {
        toast.error(getActionError(res, 'Failed to create category.'))
        return
      }

      toast.success(res.message || 'Category created.')
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create category:', error)
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>Add a category to organize your products.</DialogDescription>
          </DialogHeader>

          <CategoryFields
            idPrefix="create-category"
            name={name}
            slug={slug}
            onNameChange={handleNameChange}
            onSlugChange={handleSlugChange}
            onNameBlur={() => setTouched((t) => ({ ...t, name: true }))}
            onSlugBlur={() => setTouched((t) => ({ ...t, slug: true }))}
            nameError={touched.name ? nameError : undefined}
            slugError={touched.slug ? slugError : undefined}
            disabled={isSaving}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} aria-busy={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isSaving ? 'Creating...' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}