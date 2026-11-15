import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  shown: number
  total: number
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  onLoadMore: () => void
}

export function PurchaseListPagination({
  shown,
  total,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {isFetchNextPageError && !isFetchingNextPage && (
        <p className="text-sm text-destructive" role="alert">
          Couldn&apos;t load more purchases.
        </p>
      )}
      {hasNextPage && (
        <Button variant="outline" onClick={onLoadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isFetchingNextPage ? "Loading..." : isFetchNextPageError ? "Try again" : "Load more"}
        </Button>
      )}
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {shown} of {total}
      </p>
    </div>
  )
}