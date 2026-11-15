import RoutePageWrapper from "@/components/ims/RoutePageWrapper";
import SupplierIdManagementPage from "@/components/ims/purchase-order/SupplierIdManagementPage";

export const instant = false;

export default function Page() {
  return <RoutePageWrapper Page={SupplierIdManagementPage} />;
}