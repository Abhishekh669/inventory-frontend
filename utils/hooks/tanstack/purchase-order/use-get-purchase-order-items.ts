import { getPurchaseOrderItems } from "@/utils/action/purchases-order/purchase-order.get"
import { useQuery } from "@tanstack/react-query"

export const fetchPurchaseOrderItems = async (purchaseOrderId: string) => {
  return getPurchaseOrderItems(purchaseOrderId)
}

export const useGetPurchaseOrderItems = (purchaseOrderId: string, enabled = true) => {
  return useQuery({
    queryKey: ["get-purchase-order-items", purchaseOrderId],
    queryFn: () => fetchPurchaseOrderItems(purchaseOrderId),
    enabled: enabled && Boolean(purchaseOrderId),
    staleTime: 30_000,
  })
}