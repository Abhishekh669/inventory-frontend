import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import type { PurchaseListFilterValues } from "@/utils/types/purchase.types"
import { getAllPurchases } from "@/utils/action/purchase/purchase.get"

export const ALL_PURCHASES_KEY = "get-all-purchases"
const PAGE_SIZE = 20

export const useGetAllPurchases = (filters: PurchaseListFilterValues) => {
  return useInfiniteQuery({
    queryKey: [ALL_PURCHASES_KEY, filters],
    queryFn: ({ pageParam }) =>
      getAllPurchases({ ...filters, limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? (lastPage.next_cursor ?? undefined) : undefined,
    placeholderData: keepPreviousData,
  })
}