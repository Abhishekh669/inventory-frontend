import { Separator } from "@/components/ui/separator"
import { toDecimal } from "@/utils/helper/purchase-cal"
import { money } from "@/utils/helper/purchase-format"
import type { PurchaseDetail } from "@/utils/types/purchase.types"
import { DetailRow, SectionCard } from "./PurchaseDetailsParts"

export function PurchaseBillSummaryCard({ purchase }: { purchase: PurchaseDetail }) {
  const due = toDecimal(purchase.due_amount)
  return (
    <SectionCard title="Bill summary">
      <div className="flex flex-col gap-2">
        <DetailRow label="Gross amount" value={money(purchase.gross_amount)} />
        <DetailRow label="+ Excise duty" value={money(purchase.excise_duty)} />
        <DetailRow label="− Special discount" value={money(purchase.special_discount)} />
        <DetailRow label="− Discount" value={money(purchase.discount)} />
        <Separator />
        <DetailRow label="Taxable amount" value={money(purchase.taxable_amount)} />
        <DetailRow label={`VAT (${toDecimal(purchase.vat_rate).toString()}%)`} value={money(purchase.vat_amount)} />
        <DetailRow label="+ Freight" value={money(purchase.freight_charge)} />
        <Separator />
        <DetailRow label="Total" value={<strong>{money(purchase.total)}</strong>} />
        <DetailRow label="Paid" value={money(purchase.paid_amount)} />
        <DetailRow label="Returned" value={money(purchase.returned_amount)} />
        <DetailRow
          label="Due"
          value={<strong className={due.gt(0) ? "text-red-600" : "text-emerald-600"}>{money(purchase.due_amount)}</strong>}
        />
        {purchase.note && (
          <>
            <Separator />
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">Note</p>
              <p className="whitespace-pre-wrap">{purchase.note}</p>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  )
}