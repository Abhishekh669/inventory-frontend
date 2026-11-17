import { useQueryClient } from "@tanstack/react-query"

// a purchase change touches the purchase, the supplier's balances, product stock and the lists
export function usePurchaseRefresh(purchaseId: string, supplierId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ["get-purchase", purchaseId] })
    queryClient.invalidateQueries({ queryKey: ["get-supplier", supplierId] })
    queryClient.invalidateQueries({ queryKey: ["get-suppliers"] })
    queryClient.invalidateQueries({ queryKey: ["get-supplier-payments", supplierId] })
    queryClient.invalidateQueries({ queryKey: ["get-products"] })
    queryClient.invalidateQueries({ queryKey: ["get-all-purchases"] })
    queryClient.invalidateQueries({ queryKey: ["get-purchase-orders-by-supplier", supplierId] })
  }
}