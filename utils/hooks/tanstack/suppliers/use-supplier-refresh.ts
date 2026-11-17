import { useQueryClient } from "@tanstack/react-query"

// call after anything that changes a supplier's balance or advance credit
export function useSupplierRefresh(supplierId: string) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ["get-supplier", supplierId] })
    queryClient.invalidateQueries({ queryKey: ["get-suppliers"] })
    queryClient.invalidateQueries({ queryKey: ["get-supplier-payments", supplierId] })
    queryClient.invalidateQueries({ queryKey: ["get-all-purchases"] })
  }
}