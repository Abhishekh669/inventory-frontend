"use client"

import { useState } from "react"
import { PackageX, Pencil, Trash2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatQuantity } from "@/utils/helper/format"
import { toDecimal } from "@/utils/helper/purchase-cal"
import { money } from "@/utils/helper/purchase-format"
import type { PurchaseByIdResponse, PurchaseReturnDetail } from "@/utils/types/purchase.types"
import { CreateReturnDialog } from "./CreateReturnDialog"
import { EditReturnDialog } from "./EditReturnDialog"
import { DeleteReturnDialog } from "./DeleteReturnDialog"
import { SectionCard } from "./PurchaseDetailsParts"

export function PurchaseReturnsCard({ data }: { data: PurchaseByIdResponse }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PurchaseReturnDetail | null>(null)
  const [deleting, setDeleting] = useState<PurchaseReturnDetail | null>(null)

  const returns = data.returns
  const canReturn = data.purchase_items.some((i) => toDecimal(i.qty).sub(toDecimal(i.returned_qty)).gt(0))

  return (
    <>
      <SectionCard
        title="Returns"
        description="Items sent back to the supplier."
        action={
          <Button size="sm" variant="outline" disabled={!canReturn} onClick={() => setOpen(true)}>
            <Undo2 className="mr-2 size-4" /> New return
          </Button>
        }
      >
        {returns.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center">
            <PackageX className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No items have been returned.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {returns.map((ret) => (
              <div key={ret.id} className="overflow-hidden rounded-xl border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/30 px-4 py-2.5">
                  <div>
                    <p className="font-mono text-sm font-medium">{ret.return_no}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ret.return_date)}
                      {ret.created_by_name && <> · by {ret.created_by_name}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="mr-2 font-semibold tabular-nums">{money(ret.total)}</p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      aria-label={`Edit ${ret.return_no}`}
                      onClick={() => setEditing(ret)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:text-destructive"
                      aria-label={`Delete ${ret.return_no}`}
                      onClick={() => setDeleting(ret)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ret.items.map((it) => (
                        <TableRow key={it.id}>
                          <TableCell>
                            <p className="font-medium">{it.product_name}</p>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatQuantity(it.qty, it.allow_decimal)} {it.unit_name}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{money(it.amount)}</TableCell>
                          <TableCell className="text-muted-foreground">{it.reason || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {ret.note && <p className="border-t px-4 py-2 text-xs text-muted-foreground">{ret.note}</p>}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {open && <CreateReturnDialog open={open} onOpenChange={setOpen} data={data} />}

      {editing && (
        <EditReturnDialog
          key={editing.id}
          open
          onOpenChange={(v) => !v && setEditing(null)}
          data={data}
          ret={editing}
        />
      )}

      {deleting && (
        <DeleteReturnDialog
          key={deleting.id}
          open
          onOpenChange={(v) => !v && setDeleting(null)}
          data={data}
          ret={deleting}
        />
      )}
    </>
  )
}