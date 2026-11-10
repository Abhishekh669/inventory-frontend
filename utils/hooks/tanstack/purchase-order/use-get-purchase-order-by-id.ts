import { getPurchaseOrderById } from "@/utils/action/purchases-order/purchase-order.get"
import { useQuery } from "@tanstack/react-query"

export const fetchPurchaseOrder = async (id: string) => {
  return getPurchaseOrderById(id)
}

export const useGetPurchaseOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["get-purchase-order", id],
    queryFn: () => fetchPurchaseOrder(id),
    enabled: enabled && Boolean(id),
    // always load the latest version before editing
    staleTime: 0,
    gcTime: 0,
  })
}