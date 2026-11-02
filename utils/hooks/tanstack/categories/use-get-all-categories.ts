import { getCategories } from "@/utils/action/categories/categories.get";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const fetchCategories = async () => {
  return getCategories();
}

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["get-all-categories"],
    queryFn: () => fetchCategories(),
    placeholderData: keepPreviousData,
    meta : {
      persist : true
    }
  });
}