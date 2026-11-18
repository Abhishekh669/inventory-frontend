"use client"

import { useState } from "react"
import { Pencil, Plus, Trash2, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/utils/helper/format"
import { toDecimal } from "@/utils/helper/purchase-cal"
import { money } from "@/utils/helper/purchase-format"
import type { PurchaseByIdResponse, PurchasePayment } from "@/utils/types/purchase.types"
import { AddPaymentDialog } from "./AddPaymentDialog"
import { EditPaymentDialog } from "./EditPaymentDialog"
import { DeletePaymentDialog } from "./DeletePaymentDialog"
import { Pill, SectionCard } from "./PurchaseDetailsParts"

export function PurchasePaymentsCard({ data }: { data: PurchaseByIdResponse }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PurchasePayment | null>(null)
  const [deleting, setDeleting] = useState<PurchasePayment | null>(null)

  const payments = data.payments
  const due = toDecimal(data.purchase_data.due_amount)

  return (
    <>
      <SectionCard
        title="Payments"
        description="Payments recorded against this bill."
        action={
          <Button size="sm" variant="outline" disabled={!due.gt(0)} onClick={() => setOpen(true)}>
            <Plus className="mr-2 size-4" /> Add payment
          </Button>
        }
      >
        {payments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <Wallet className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[88px] text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {formatDate(p.payment_date)}
                    </TableCell>
                    <TableCell className="capitalize">{p.payment_method}</TableCell>
                    <TableCell>
                      {p.payment_type === "advance" ? (
                        <Pill className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                          From advance
                        </Pill>
                      ) : (
                        <span className="text-sm text-muted-foreground">Regular</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={p.note ?? undefined}>
                      {p.note || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.created_by_name || "—"}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{money(p.amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Edit payment"
                          onClick={() => setEditing(p)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive hover:text-destructive"
                          aria-label="Delete payment"
                          onClick={() => setDeleting(p)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {open && <AddPaymentDialog open={open} onOpenChange={setOpen} data={data} />}

      {editing && (
        <EditPaymentDialog
          key={editing.id}
          open
          onOpenChange={(v) => !v && setEditing(null)}
          data={data}
          payment={editing}
        />
      )}

      {deleting && (
        <DeletePaymentDialog
          key={deleting.id}
          open
          onOpenChange={(v) => !v && setDeleting(null)}
          data={data}
          payment={deleting}
        />
      )}
    </>
  )
}