"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  page: number // zero-indexed (API), shown 1-based in the UI
  limit: number
  total: number
  hasMore: boolean
  onPageChange: (page: number) => void
}

// at most 5 numbers with ellipsis: 1 ... 4 5 6 ... 20
function getPages(current: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i)

  const pages: (number | "...")[] = [0]
  const start = Math.max(1, current - 1)
  const end = Math.min(totalPages - 2, current + 1)

  if (start > 1) pages.push("...")
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPages - 2) pages.push("...")
  pages.push(totalPages - 1)
  return pages
}

export function TablePagination({ page, limit, total, hasMore, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const from = total === 0 ? 0 : page * limit + 1
  const to = Math.min((page + 1) * limit, total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing {from}-{to} of {total}
      </p>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
          Previous
        </Button>

        {getPages(page, totalPages).map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
            >
              {p + 1}
            </Button>
          )
        )}

        <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight className="size-4" />
        </Button>
      </nav>
    </div>
  )
}