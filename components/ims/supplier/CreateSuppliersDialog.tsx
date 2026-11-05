"use client";
import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SupplierFields } from "./SupplierFields";
import { Supplier } from "@/utils/types/suppliers.types";
import {
  SupplierErrors,
  SupplierFormValues,
  emptySupplier,
  hasErrors,
  toCreatePayload,
  validateSupplier,
} from "@/utils/helper/supperlier-validation";
import { createSuppliers } from "@/utils/action/supplier/supplier.post";

const MAX_ROWS = 20;

interface Row {
  key: string;
  values: SupplierFormValues;
}

const newRow = (): Row => ({ key: crypto.randomUUID(), values: emptySupplier() });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: Supplier[]; // used to catch duplicates
}

export function CreateSuppliersDialog({ open, onOpenChange, existing }: Props) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrollToNew = useRef(false);
  const lastRowRef = useRef<HTMLDivElement>(null);

  // reset every time the dialog closes
  useEffect(() => {
    if (!open) {
      setRows([newRow()]);
      setSubmitted(false);
      setSaving(false);
    }
  }, [open]);

  // after adding a row: scroll it into view and focus its first input
  useEffect(() => {
    if (!scrollToNew.current) return;
    scrollToNew.current = false;
    const el = lastRowRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    el.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  }, [rows.length]);

  const addRow = () => {
    if (rows.length >= MAX_ROWS) return;
    scrollToNew.current = true;
    setRows((prev) => [...prev, newRow()]);
  };

  const removeRow = (key: string) => setRows((prev) => prev.filter((r) => r.key !== key));

  const updateField = (key: string, field: keyof SupplierFormValues, value: string) =>
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, values: { ...r.values, [field]: value } } : r))
    );

  // field rules + duplicates (inside this list and against saved suppliers)
  const computeErrors = (list: Row[]): SupplierErrors[] => {
    const savedNames = new Set(existing.map((s) => s.name.trim().toLowerCase()));
    const savedPans = new Set(existing.map((s) => s.pan_no).filter(Boolean) as string[]);
    const seenNames = new Map<string, number>();
    const seenPans = new Map<string, number>();

    return list.map((row, i) => {
      const e = validateSupplier(row.values);
      const name = row.values.name.trim().toLowerCase();
      const pan = row.values.pan_no.trim();

      if (name && !e.name) {
        if (savedNames.has(name)) e.name = "A supplier with this name already exists";
        else if (seenNames.has(name)) e.name = `Same name as supplier ${seenNames.get(name)! + 1} in this list`;
        else seenNames.set(name, i);
      }
      if (pan && !e.pan_no) {
        if (savedPans.has(pan)) e.pan_no = "This PAN already belongs to a supplier";
        else if (seenPans.has(pan)) e.pan_no = `Same PAN as supplier ${seenPans.get(pan)! + 1} in this list`;
        else seenPans.set(pan, i);
      }
      return e;
    });
  };

  const errors = submitted ? computeErrors(rows) : rows.map(() => ({}) as SupplierErrors);
  const errorRowCount = errors.filter(hasErrors).length;

  const handleSubmit = async () => {
    setSubmitted(true);
    const result = computeErrors(rows);
    const firstBad = result.findIndex(hasErrors);
    if (firstBad !== -1) {
      toast.error("Please fix the highlighted fields");
      document
        .getElementById(`supplier-row-${rows[firstBad].key}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSaving(true);
    const res = await createSuppliers(rows.map((r) => toCreatePayload(r.values)));
    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Failed to create suppliers");
      return;
    }
    toast.success(res.message);
    await queryClient.invalidateQueries({ queryKey: ["get-all-suppliers"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] flex-col gap-0 p-0 sm:max-w-5xl">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="text-lg">Add suppliers</DialogTitle>
          <DialogDescription>
            Fill in one or more suppliers. Only the name is required.
          </DialogDescription>
        </DialogHeader>

        {/* scrollable list */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-muted/20 px-6 py-6">
          {rows.map((row, i) => (
            <div
              key={row.key}
              id={`supplier-row-${row.key}`}
              ref={i === rows.length - 1 ? lastRowRef : undefined}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {row.values.name.trim() || `Supplier ${i + 1}`}
                  </span>
                </div>
                {rows.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.key)}
                    disabled={saving}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>

              <SupplierFields
                idPrefix={`create-${row.key}`}
                variant="wide"
                values={row.values}
                errors={errors[i]}
                onChange={(f, v) => updateField(row.key, f, v)}
                disabled={saving}
              />
            </div>
          ))}
        </div>

        {/* fixed footer: add button is always visible */}
        <DialogFooter className="flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={addRow}
              disabled={saving || rows.length >= MAX_ROWS}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another supplier
            </Button>
            <span className="text-sm text-muted-foreground">
              {rows.length} of {MAX_ROWS}
              {submitted && errorRowCount > 0 && (
                <span className="ml-2 text-destructive">
                  · {errorRowCount} with errors
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save {rows.length} {rows.length > 1 ? "suppliers" : "supplier"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}