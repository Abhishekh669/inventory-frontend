"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatMoney, isZero } from "@/utils/helper/ledger-fromat"
import type { SupplierLedgerResponse } from "@/utils/types/supplier-payment.types"

type Props = {
  ledger: SupplierLedgerResponse | null
  isLoading: boolean
}

function StatCard({
  title,
  value,
  hint,
  valueClassName,
}: {
  title: string
  value: string
  hint?: string
  valueClassName?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-semibold tabular-nums ${valueClassName ?? ""}`}>{value}</div>
        {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
      </CardContent>
    </Card>
  )
}

export function SupplierLedgerSummary({ ledger, isLoading }: Props) {
  if (isLoading || !ledger) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  const hasOpeningAdvance = !isZero(ledger.opening_credit)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Opening (we owe)"
        value={formatMoney(ledger.opening_balance)}
        hint={hasOpeningAdvance ? `Advance held: ${formatMoney(ledger.opening_credit)}` : undefined}
      />
      <StatCard title="Total purchases" value={formatMoney(ledger.total_purchases)} />
      <StatCard
        title="Advance paid"
        value={formatMoney(ledger.total_advances)}
        hint="Original advance transfers"
      />
      <StatCard
        title="Total payments"
        value={formatMoney(ledger.total_payments)}
        hint="Regular payments + advance applied"
      />
      <StatCard title="Total returns" value={formatMoney(ledger.total_returns)} />
      <StatCard
        title="Closing (we owe)"
        value={formatMoney(ledger.closing_balance)}
        valueClassName={isZero(ledger.closing_balance) ? "" : "text-red-600"}
      />
      <StatCard
        title="Remaining advance"
        value={formatMoney(ledger.closing_credit)}
        hint="Supplier owes us"
        valueClassName="text-emerald-600"
      />
    </div>
  )
}