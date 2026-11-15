import { AlertCircle, CheckCircle2, Receipt, Undo2, Wallet } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toDecimal } from "@/utils/helper/purchase-cal"
import { money } from "@/utils/helper/purchase-format"
import type { PurchaseDetail } from "@/utils/types/purchase.types"

export function PurchaseKpiCards({ purchase }: { purchase: PurchaseDetail }) {
  const due = toDecimal(purchase.due_amount)
  const items = [
    { label: "Total", value: money(purchase.total), icon: Receipt, tone: "bg-primary/10 text-primary" },
    { label: "Paid", value: money(purchase.paid_amount), icon: Wallet, tone: "bg-emerald-500/10 text-emerald-600" },
    { label: "Returned", value: money(purchase.returned_amount), icon: Undo2, tone: "bg-amber-500/10 text-amber-600" },
    {
      label: "Due",
      value: money(purchase.due_amount),
      icon: due.gt(0) ? AlertCircle : CheckCircle2,
      tone: due.gt(0) ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label} className="shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tone)}>
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="truncate text-lg font-semibold tabular-nums">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}