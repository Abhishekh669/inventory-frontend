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

// Static class strings so Tailwind can see them. Picked by a stable hash of the name,
// so a category always keeps the same colour.
const TILE_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
]

function tileColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TILE_COLORS[hash % TILE_COLORS.length]
}

type CategoryCardProps = {
  category: Category
  selected: boolean
  onSelectChange: (checked: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

export function CategoryCard({ category, selected, onSelectChange, onEdit, onDelete }: CategoryCardProps) {
  const initial = category.name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-4 shadow-xs',
        'transition-all duration-200 motion-reduce:transition-none',
        'hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0',
        selected ? 'border-primary bg-primary/[0.03] ring-1 ring-primary' : 'hover:border-primary/40'
      )}
    >
      {/* Header: tile + name/slug, with checkbox and menu pinned to the corner */}
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg text-lg font-semibold',
            tileColor(category.name)
          )}
        >
          {initial}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          {/* The ::after stretches this link over the whole card, so the card is one big click target.
              Checkbox and menu sit above it with relative z-10. */}
          <h3 className="truncate text-base font-semibold leading-tight tracking-tight" title={category.name}>
            <Link
              href={`/categories/${category.slug}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring"
            >
              {category.name}
            </Link>
          </h3>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={category.slug}>
            /{category.slug}
          </p>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1">
          <Checkbox
            checked={selected}
            onCheckedChange={(value) => onSelectChange(value === true)}
            aria-label={`Select ${category.name}`}
            className={cn(
              'transition-opacity',
              // stay visible when selected, on touch devices, and while keyboard focused
              selected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100 focus-visible:opacity-100'
            )}
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
      </div>

      {/* Footer: date + visit affordance */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t pt-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">Added {formatDate(category.created_at)}</span>
        </p>

        <span
          aria-hidden="true"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary"
        >
          View products
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
        </span>
      </div>
    </div>
  )
}