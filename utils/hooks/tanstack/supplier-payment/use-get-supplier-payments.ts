import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import type { SupplierPaymentFilterValues } from "@/utils/types/supplier-payment.types"
import { getSupplierPayments } from "@/utils/action/supplier-payment/supplier-payment.get"

// cursor based: every page is requested with the next_cursor of the page before it
export const useGetSupplierPayments = (
  supplierId: string,
  filters: SupplierPaymentFilterValues = {},
  limit = 10
) => {
  return useInfiniteQuery({
    queryKey: ["get-supplier-payments", supplierId, filters, limit],
    queryFn: ({ pageParam }) =>
      getSupplierPayments({
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