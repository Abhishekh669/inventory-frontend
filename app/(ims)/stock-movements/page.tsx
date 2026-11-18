import RoutePageWrapper from "@/components/ims/RoutePageWrapper";
import StockMovementManagementPage from "@/components/ims/stock-movements/StockMovementManagementPage";

export default function Page() {
  return <RoutePageWrapper Page={StockMovementManagementPage} />;
}
