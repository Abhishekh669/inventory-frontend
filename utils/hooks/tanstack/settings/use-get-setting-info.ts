
import { getSetting } from "@/utils/action/settings/setting.get";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const fetchSettingInfo = async () => {
    return getSetting();
};

export const useGetSettingInfo = () => {
  return useQuery({
    queryKey: ["get-setting-info"],
    queryFn: () => fetchSettingInfo(),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,     // ✅ data stays fresh for 5 minutes
    gcTime: 1000 * 60 * 10,
  });
};