// NEW FILE: app/(your-group)/stock-movements/page.tsx

import { StockMovementTable } from "./StockMovementTable"

function StockMovementManagementPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stock movements</h1>
        <p className="text-sm text-muted-foreground">
          Every change to product stock, newest first.
        </p>
      </div>
      <StockMovementTable />
    </div>
  )
}

export default StockMovementManagementPage