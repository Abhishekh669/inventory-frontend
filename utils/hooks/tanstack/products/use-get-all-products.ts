// hooks/products/use-products.ts
import { getProducts } from "@/utils/action/products/product.get";
import { GetProductsParams } from "@/utils/types/product.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

// invalidates every products list, including the by-category ones

export const fetchProducts = async (params: GetProductsParams = {}) => {
  return getProducts(params);
};

export const useGetProducts = (params: GetProductsParams = {}) => {
  return useQuery({
    queryKey: ["get-products", params],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });
};

