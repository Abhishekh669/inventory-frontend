"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGetCategories } from '@/utils/hooks/tanstack/categories/use-get-all-categories'
import type { Category } from '@/utils/types/category.types'
import type { User } from '@/utils/types/user.types'
import { CategoryList } from './CategoryList'
import { CreateCategoryDialog } from './CreateCategoryDialog'

function CategoryManagementPage({ user }: { user: User }) {
  const { data, isLoading, isError, error } = useGetCategories()
  const [createOpen, setCreateOpen] = useState(false)

  if (!user) return null

  const categories: Category[] = data?.categories ?? []

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Inventory</p>
            <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
            <p className="max-w-2xl text-muted-foreground">
              Create, edit and remove the categories used to organize your products.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" /> New category
          </Button>
        </header>

        {isLoading && <p className="text-sm text-muted-foreground">Loading categories...</p>}
        {(!isLoading && isError) && (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : 'Failed to load categories.'}
          </p>
        )}
        {!isLoading && !isError && <CategoryList categories={categories} />}
      </div>

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} categories={categories} />
    </main>
  )
}

export default CategoryManagementPage