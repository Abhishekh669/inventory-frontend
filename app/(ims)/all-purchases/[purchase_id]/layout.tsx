import React, { Suspense } from "react"
import { Loader2 } from "lucide-react"
import PurchaseIdWrapper from "@/components/ims/purchase/purchase_id/PurchaseIdWrapper"

function PurchaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading purchase page...</p>
        </div>
      }
    >
      <PurchaseIdWrapper>{children}</PurchaseIdWrapper>
    </Suspense>
  )
}

export default PurchaseLayout