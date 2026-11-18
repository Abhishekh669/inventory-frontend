import RoutePageWrapper from "@/components/ims/RoutePageWrapper";
import { SupplierReturnsTable } from "@/components/ims/supplier/returns/SupplierReturnsTable";

export const instant = false;

export default function Page() {
  return <RoutePageWrapper Page={SupplierReturnsTable} />;
}