import { Wallet } from "lucide-react"
import { formatDate } from "@/utils/helper/format"
import { money } from "@/utils/helper/purchase-format"
import type { PurchasePayment } from "@/utils/types/purchase.types"
import { Pill, SectionCard } from "./PurchaseDetailsParts"

export function PurchasePaymentsCard({ payments }: { payments: PurchasePayment[] }) {
  return (
    <SectionCard title="Payments" description="Payments recorded against this bill.">
      {payments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
          <Wallet className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y">
          {payments.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{formatDate(p.payment_date)}</span>
                  <Pill className="capitalize text-muted-foreground">{p.payment_method}</Pill>
                </div>
                {p.note && <p className="truncate text-xs text-muted-foreground">{p.note}</p>}
                {p.created_by_name && <p className="text-xs text-muted-foreground">by {p.created_by_name}</p>}
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{money(p.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}