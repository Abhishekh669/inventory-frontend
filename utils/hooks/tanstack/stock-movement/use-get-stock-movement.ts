// NEW FILE: hooks/stock-movement/use-get-stock-movements.ts
import { getStockMovements } from "@/utils/action/stock-movement/stock.movement.get"
import { StockMovementFilterValues } from "@/utils/types/stock.movement.types"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const STOCK_MOVEMENTS_KEY = "get-stock-movements"
export const STOCK_MOVEMENTS_PAGE_SIZE = 20

// One page per query: the cursor is part of the key, so going back to a page is served from cache.
export const useGetStockMovements = (
  filters: StockMovementFilterValues,
  cursor: string | undefined
) =>
  useQuery({
    queryKey: [STOCK_MOVEMENTS_KEY, filters, cursor ?? null],
    queryFn: () => getStockMovements({ ...filters, limit: STOCK_MOVEMENTS_PAGE_SIZE, cursor }),
    placeholderData: keepPreviousData,
  })