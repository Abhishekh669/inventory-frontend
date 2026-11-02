
import { getAllUnits} from "@/utils/action/settings/setting.get";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const fetchUnits = async () => {
    return getAllUnits();
};

export const useGetAllUnits = () => {
  return useQuery({
    queryKey: ["get-all-units"],
    queryFn: () => fetchUnits(),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,     // ✅ data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 10,
  });
};