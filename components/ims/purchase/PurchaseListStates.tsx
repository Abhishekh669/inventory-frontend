import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function PurchaseListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading purchases">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-2 h-3 w-32" />
          <Skeleton className="mt-4 h-10 w-full max-w-md" />
        </div>
      ))}
    </div>
  )
}

export function PurchaseListError({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-6 py-16 text-center shadow-sm">
      <AlertCircle className="size-6 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">Couldn&apos;t load purchases</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {message ?? "Check your connection and try again."}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCcw data-icon="inline-start" /> Try again
      </Button>
    </div>
  )
}

export function PurchaseListEmpty({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <p className="text-sm font-medium">
        {hasFilters ? "No purchases match these filters" : "No purchase orders yet"}
      </p>
      <p className="text-sm text-muted-foreground">
        {hasFilters ? "Try a different status or date range." : "Orders will show up here once created."}
      </p>
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset filters
        </Button>
      )}
    </div>
  )
}