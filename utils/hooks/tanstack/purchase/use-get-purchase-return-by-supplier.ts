import { SupplierReturnFilterValues } from "@/utils/types/purchase.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SUPPLIER_LIST_PAGE_SIZE, SUPPLIER_RETURNS_KEY } from "./use-get-all-purchse-by-supplier";
import { getSupplierReturns } from "@/utils/action/purchase/purchase.get";

export const useGetSupplierReturns = (
  supplierId: string,
  filters: SupplierReturnFilterValues,
  cursor: string | undefined
) =>
  useQuery({
    queryKey: [SUPPLIER_RETURNS_KEY, supplierId, filters, cursor ?? null],
    queryFn: () =>
      getSupplierReturns({ supplier_id: supplierId, ...filters, limit: SUPPLIER_LIST_PAGE_SIZE, cursor }),
    enabled: !!supplierId,
    placeholderData: keepPreviousData,
  })
