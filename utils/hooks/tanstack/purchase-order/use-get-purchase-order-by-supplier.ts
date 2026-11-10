import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import type {
  GetPurchaseOrdersBySupplierParams,
  PurchaseOrderFilterValues,
} from "@/utils/types/purchase-order.types"
import { getPurchaseOrdersBySupplier } from "@/utils/action/purchases-order/purchase-order.get"

export const fetchPurchaseOrdersBySupplier = async (params: GetPurchaseOrdersBySupplierParams) => {
  return getPurchaseOrdersBySupplier(params)
}

// cursor based: every page is requested with the next_cursor of the page before it
export const useGetPurchaseOrdersBySupplier = (
  supplierId: string,
  filters: PurchaseOrderFilterValues = {},
  limit = 10
) => {
  return useInfiniteQuery({
    queryKey: ["get-purchase-orders-by-supplier", supplierId, filters, limit],
    queryFn: ({ pageParam }) =>
      fetchPurchaseOrdersBySupplier({
        supplier_id: supplierId,
        cursor: pageParam,
        limit,
        ...filters,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    placeholderData: keepPreviousData,
    enabled: Boolean(supplierId),
  })
}