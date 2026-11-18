import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type {
  SupplierPurchaseFilterValues,
  SupplierReturnFilterValues,
} from "@/utils/types/purchase.types"
import { getSupplierPurchases } from "@/utils/action/purchase/purchase.get"

export const SUPPLIER_PURCHASES_KEY = "get-supplier-purchases"
export const SUPPLIER_RETURNS_KEY = "get-supplier-returns"
export const SUPPLIER_LIST_PAGE_SIZE = 20

// One page per query: the cursor is part of the key, so going back to a page is served from cache.
export const useGetSupplierPurchases = (
  supplierId: string,
  filters: SupplierPurchaseFilterValues,
  cursor: string | undefined
) =>
  useQuery({
    queryKey: [SUPPLIER_PURCHASES_KEY, supplierId, filters, cursor ?? null],
    queryFn: () =>
      getSupplierPurchases({ supplier_id: supplierId, ...filters, limit: SUPPLIER_LIST_PAGE_SIZE, cursor }),
    enabled: !!supplierId,
    placeholderData: keepPreviousData,
  })
