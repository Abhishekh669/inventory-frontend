import RoutePageWrapper from "@/components/ims/RoutePageWrapper";
import SupplierPaymentManagement from "@/components/ims/supplier/payments/SupplierPaymentManagement";

export const instant = false;

export default function Page() {
  return <RoutePageWrapper Page={SupplierPaymentManagement} />;
}