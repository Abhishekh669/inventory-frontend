import PurchaseIdManagementPage from "@/components/ims/purchase/purchase_id/PurchaseIdManagementPage"
import RoutePageWrapper from "@/components/ims/RoutePageWrapper"

export const instant = false

export default function Page() {
  return <RoutePageWrapper Page={PurchaseIdManagementPage} />
}