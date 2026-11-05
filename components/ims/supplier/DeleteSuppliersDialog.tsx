"use client";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/utils/types/suppliers.types";
import { deleteSuppliers } from "@/utils/action/supplier/supplier.delete";

interface Props {
  suppliers: Supplier[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteSuppliersDialog({ suppliers, open, onOpenChange, onDeleted }: Props) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  const count = suppliers.length;
  const label = count === 1 ? "supplier" : "suppliers";
  const preview = suppliers.slice(0, 5);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteSuppliers(suppliers.map((s) => s.id));
    setDeleting(false);

    if (!res.success) {
      toast.error(res.error || `Failed to delete ${label}`);
      return;
    }
    toast.success(res.message);
    await queryClient.invalidateQueries({ queryKey: ["get-all-suppliers"] });
    onDeleted?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !deleting && onOpenChange(v)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count} {label}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. Suppliers that already have purchases or payments cannot be deleted. Mark
            them as inactive instead.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ul className="space-y-1 rounded-md border bg-muted/30 p-3 text-sm">
          {preview.map((s) => (
            <li key={s.id} className="truncate">
              {s.name}
            </li>
          ))}
          {count > preview.length && (
            <li className="text-muted-foreground">and {count - preview.length} more</li>
          )}
        </ul>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete {label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}