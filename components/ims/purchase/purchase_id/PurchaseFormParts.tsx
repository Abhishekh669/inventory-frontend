import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatMoney, type CalcResult } from "@/utils/helper/purchase-cal"
import { DetailRow } from "./PurchaseDetailsParts"

export const todayStr = () => new Date().toISOString().slice(0, 10)
export const dateOnly = (v: string | null | undefined) => (v ? v.slice(0, 10) : "")

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

export function BillTotals({ calc }: { calc: CalcResult }) {
  return (
    <div className="flex flex-col gap-1.5">
      <DetailRow label="Gross amount" value={formatMoney(calc.gross)} />
      <DetailRow label="+ Excise duty" value={formatMoney(calc.excise)} />
      <DetailRow label="− Special discount" value={formatMoney(calc.special)} />
      <DetailRow label="− Discount" value={formatMoney(calc.discount)} />
      <Separator />
      <DetailRow label="Taxable amount" value={formatMoney(calc.taxable)} />
      <DetailRow label={`VAT (${calc.vatRate.toString()}%)`} value={formatMoney(calc.vat)} />
      <DetailRow label="+ Freight" value={formatMoney(calc.freight)} />
      <Separator />
      <DetailRow label="Total" value={<strong>{formatMoney(calc.total)}</strong>} />
    </div>
  )
}