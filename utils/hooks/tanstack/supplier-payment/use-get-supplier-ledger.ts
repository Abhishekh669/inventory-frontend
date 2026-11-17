import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import type { SupplierLedgerFilterValues } from "@/utils/types/supplier-payment.types"
import { getSupplierLedger } from "@/utils/action/supplier-payment/supplier-payment.get"

// cursor based: every page is requested with the next_cursor of the page before it
export const useGetSupplierLedger = (
  supplierId: string,
  filters: SupplierLedgerFilterValues = {},
  limit = 20
) => {
  return useInfiniteQuery({
    queryKey: ["get-supplier-ledger", supplierId, filters, limit],
    queryFn: ({ pageParam }) =>
      getSupplierLedger({
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