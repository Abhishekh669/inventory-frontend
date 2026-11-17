"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PurchaseByIdResponse } from "@/utils/types/purchase.types"
import { DeletePurchaseDialog } from "./DeletePurchaseDialog"
import { EditPurchaseDialog } from "./EditPurchaseDialog"

export function PurchaseHeaderActions({ data }: { data: PurchaseByIdResponse }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <Button size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className="mr-2 size-4" /> Edit
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="mr-2 size-4" /> Delete
      </Button>

      {editOpen && <EditPurchaseDialog open={editOpen} onOpenChange={setEditOpen} data={data} />}
      {deleteOpen && <DeletePurchaseDialog open={deleteOpen} onOpenChange={setDeleteOpen} data={data} />}
    </>
  )
}