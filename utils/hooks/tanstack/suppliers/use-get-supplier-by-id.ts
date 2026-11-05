import { getSupplierById } from "@/utils/action/supplier/supplier.get";
import { useQuery } from "@tanstack/react-query";

export const useGetSupplier = (id: string) => {
  return useQuery({
    queryKey: ["get-supplier", id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
  });
};