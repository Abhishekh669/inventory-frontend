import { getSuppliers } from "@/utils/action/supplier/supplier.get";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const fetchSuppliers = async () => {
  return getSuppliers();
};

export const useGetSuppliers = () => {
  return useQuery({
    queryKey: ["get-all-suppliers"],
    queryFn: () => fetchSuppliers(),
    placeholderData: keepPreviousData,
  });
};