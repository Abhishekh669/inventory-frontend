'use client'

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSupplier } from '../SupplierContext'
import { SupplierHeaderCard } from '../SupplierHeaderCard'
import { AdvancePaymentDialog } from './SupplierAdvancePaymentDialog'

function SupplierPaymentManagement() {
  const { supplier } = useSupplier()
  const [advanceOpen, setAdvanceOpen] = useState(false)

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Supplier payments</h2>
          <p className="mt-1 text-sm text-muted-foreground">Money paid to {supplier.name}.</p>
        </div>
        <Button onClick={() => setAdvanceOpen(true)}>
          <Wallet data-icon="inline-start" />
          Advance payment
        </Button>
      </div>

      <SupplierHeaderCard supplier={supplier} />

      <main className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
        <p className="text-sm font-medium">Payment history</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Payments recorded for this supplier will appear here.
        </p>
      </main>

      <AdvancePaymentDialog open={advanceOpen} onOpenChange={setAdvanceOpen} supplier={supplier} />
    </div>
  )
}

export default SupplierPaymentManagement