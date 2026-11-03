import { getProductsByCategory } from "@/utils/action/categories/categories.get";
import { GetProductsParams } from "@/utils/types/product.types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const fetchProductsByCategory = async (
  slug: string,
  params: GetProductsParams = {}
) => {
  return getProductsByCategory(slug, params);
};

export const useGetProductsByCategory = (
  slug: string,
  params: GetProductsParams = {}
) => {
  return useQuery({
    // slug and params are in the key, so each category/filter/page is cached separately
    queryKey: ["get-products-by-category", slug, params],
    queryFn: () => fetchProductsByCategory(slug, params),
    enabled: !!slug, // slug is compulsory, so don't fetch without it
    placeholderData: keepPreviousData,
  });
};