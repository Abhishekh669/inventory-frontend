'use client'

import { useMemo, useState } from 'react'
import { Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { Category } from '@/utils/types/category.types'
import { CategoryCard } from './CategoryCard'
import { CategoryFormDialog } from './CategoryFormDialog'
import { DeleteCategoryDialog } from './DeleteCategory'

export function CategoryList({ categories }: { categories: Category[] }) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category[]>([])

  // Search happens locally on the already fetched list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    )
  }, [categories, search])

  // Ignore selected ids that no longer exist (e.g. after a delete/refetch)
  const selected = useMemo(
    () => categories.filter((c) => selectedIds.has(c.id)),
    [categories, selectedIds]
  )

  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAllFiltered(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filtered.forEach((c) => (checked ? next.add(c.id) : next.delete(c.id)))
      return next
    })
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or slug"
            aria-label="Search categories"
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {filtered.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={allFilteredSelected}
              onCheckedChange={(v) => toggleAllFiltered(v === true)}
              aria-label="Select all shown categories"
            />
            Select all
          </label>
        )}

        <p className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {categories.length}
        </p>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3 shadow-sm">
          <p className="text-sm font-medium">{selected.length} selected</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleting(selected)}>
              <Trash2 data-icon="inline-start" /> Delete selected
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-background px-6 py-12 text-center text-sm text-muted-foreground">
          {categories.length === 0
            ? 'No categories yet. Create your first one.'
            : `No categories match "${search}".`}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <li key={category.id}>
              <CategoryCard
                category={category}
                selected={selectedIds.has(category.id)}
                onSelectChange={(checked) => toggleOne(category.id, checked)}
                onEdit={() => setEditing(category)}
                onDelete={() => setDeleting([category])}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Dialogs live here, outside the dropdown menus, to avoid focus/pointer-events issues */}
      <CategoryFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        category={editing}
      />
      <DeleteCategoryDialog
        open={deleting.length > 0}
        onOpenChange={(open) => !open && setDeleting([])}
        categories={deleting}
        onDeleted={(ids) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            ids.forEach((id) => next.delete(id))
            return next
          })
        }
      />
    </section>
  )
}