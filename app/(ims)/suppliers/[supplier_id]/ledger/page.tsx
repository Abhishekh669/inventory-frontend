import RoutePageWrapper from "@/components/ims/RoutePageWrapper";
import SupplierLedgerManagementPage from "@/components/ims/supplier/ledger/SupplierLedgerManagementPage";

export const instant = false;

export default function Page() {
  return <RoutePageWrapper Page={SupplierLedgerManagementPage} />;
}