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
} from '@/utils/helper/category-validation'
import { Category } from '@/utils/types/category.types'
import { updateCategory } from '@/utils/action/categories/categories.put'
import { CategoryFields } from './CategoryField'

// Must match the key used inside useGetCategories
const CATEGORIES_QUERY_KEY = ['get-all-categories']

type EditCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
  /** Already fetched categories, used to catch duplicate slugs. */
  categories: Category[]
}

export function EditCategoryDialog({ open, onOpenChange, category, categories }: EditCategoryDialogProps) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  // true once the user has typed in the name field (then the slug follows the name)
  const [nameChanged, setNameChanged] = useState(false)
  // a slug the user typed by hand; null means "not overridden"
  const [slugOverride, setSlugOverride] = useState<string | null>(null)
  const [touched, setTouched] = useState({ name: false, slug: false })
  const [isSaving, setIsSaving] = useState(false)

  // Reset when the dialog opens or a different category is selected
  useEffect(() => {
    if (!open || !category) return
    setName(category.name)
    setNameChanged(false)
    setSlugOverride(null)
    setTouched({ name: false, slug: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category?.id])

  // Derived slug, always consistent with the name:
  // 1. hand-typed slug wins
  // 2. otherwise, once the name was edited, follow the name
  // 3. otherwise show the saved slug
  const slug = slugOverride ?? (nameChanged ? slugify(name) : category?.slug ?? '')

  const nameError = useMemo(() => validateName(name), [name])
  // Ignore the category being edited so its own slug is not flagged as a duplicate
  const slugError = useMemo(
    () => validateSlug(slug, categories, category?.id),
    [slug, categories, category?.id]
  )

  const isUnchanged = category ? name.trim() === category.name && slug === category.slug : true

  function handleNameChange(value: string) {
    setName(value)
    setNameChanged(true)
  }

  function handleSlugChange(value: string) {
    setSlugOverride(sanitizeSlugInput(value))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!category || isSaving) return

    setTouched({ name: true, slug: true })
    if (nameError || slugError) return
    if (isUnchanged) {
      onOpenChange(false)
      return
    }

    setIsSaving(true)
    try {
      const res = await updateCategory({ id: category.id, name: name.trim(), slug })

      if (!res.success) {
        toast.error(getActionError(res, 'Failed to update category.'))
        return
      }

      toast.success(res.message || 'Category updated.')
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update category:', error)
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
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>Update the name or slug of this category.</DialogDescription>
          </DialogHeader>

          <CategoryFields
            idPrefix="edit-category"
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
            <Button type="submit" disabled={isSaving || isUnchanged} aria-busy={isSaving}>
              {isSaving && <Loader2 data-icon="inline-start" className="animate-spin" />}
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}