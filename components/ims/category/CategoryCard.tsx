'use client'

import Link from 'next/link'
import { ArrowUpRight, CalendarDays, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Category } from '@/utils/types/category.types'

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

type CategoryCardProps = {
  category: Category
  selected: boolean
  onSelectChange: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export function CategoryCard({ category, selected, onSelectChange, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 motion-reduce:transition-none',
        'hover:shadow-md',
        selected ? 'border-primary bg-primary/[0.03] ring-1 ring-primary' : 'hover:border-primary/40'
      )}
    >
      {/* Top row: checkbox + actions menu */}
      <div className="flex items-center justify-between gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={(value) => onSelectChange(value === true)}
          aria-label={`Select ${category.name}`}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label={`Actions for ${category.name}`}
              />
            }
          >
            <MoreVertical aria-hidden="true" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category info */}
      <div className="mt-4 min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold tracking-tight" title={category.name}>
          {category.name}
        </h3>
        <p
          className="mt-2 inline-block max-w-full truncate rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
          title={category.slug}
        >
          /{category.slug}
        </p>
      </div>

      {/* Footer: date + visit */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{formatDate(category.created_at)}</span>
        </p>

        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/categories/${category.slug}`} />}
        >
          Visit
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}