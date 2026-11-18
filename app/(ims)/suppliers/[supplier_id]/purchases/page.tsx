


import RoutePageWrapper from "@/components/ims/RoutePageWrapper";
import { SupplierPurchasesTable } from "@/components/ims/supplier/purchase/SupplierPurchaseTable";

export const instant = false;

export default function Page() {
  return <RoutePageWrapper Page={SupplierPurchasesTable} />;
}