import { useQuery } from "@tanstack/react-query"
import { getPurchaseById } from "@/utils/action/purchase/purchase.get"

export const useGetPurchaseById = (purchaseId: string) => {
  return useQuery({
    queryKey: ["get-purchase", purchaseId],
    enabled: !!purchaseId,
    queryFn: async () => {
      const res = await getPurchaseById(purchaseId)
      return res.purchase
    },
  })
}