"use client";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SupplierFields } from "./SupplierFields";
import { formatMoney } from "@/utils/helper/supplier";
import {
  SupplierErrors,
  SupplierFormValues,
  hasErrors,
  validateSupplier,
} from "@/utils/helper/supperlier-validation";
import { Supplier } from "@/utils/types/suppliers.types";
import { updateSupplier } from "@/utils/action/supplier/supplier.update";

const toValues = (s: Supplier): SupplierFormValues => ({
  name: s.name,
  contact_person: s.contact_person ?? "",
  phone: s.phone ?? "",
  pan_no: s.pan_no ?? "",
  address: s.address ?? "",
  opening_balance: s.opening_balance,
});

interface Props {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: Supplier[];
}

export function EditSupplierDialog({ supplier, open, onOpenChange, existing }: Props) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SupplierFormValues | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && supplier) {
      setValues(toValues(supplier));
      setIsActive(supplier.is_active);
      setSubmitted(false);
      setSaving(false);
    }
  }, [open, supplier]);

  if (!supplier || !values) return null;

  const computeErrors = (): SupplierErrors => {
    const e = validateSupplier(values);
    const others = existing.filter((s) => s.id !== supplier.id);
    const name = values.name.trim().toLowerCase();
    const pan = values.pan_no.trim();

    if (name && !e.name && others.some((s) => s.name.trim().toLowerCase() === name)) {
      e.name = "A supplier with this name already exists";
    }
    if (pan && !e.pan_no && others.some((s) => s.pan_no === pan)) {
      e.pan_no = "This PAN already belongs to another supplier";
    }
    return e;
  };

  const errors = submitted ? computeErrors() : {};

  const openingChanged =
    Number(values.opening_balance || 0) !== Number(supplier.opening_balance);

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasErrors(computeErrors())) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    const res = await updateSupplier({
      id: supplier.id,
      name: values.name.trim(),
      contact_person: values.contact_person.trim(),
      phone: values.phone.trim(),
      pan_no: values.pan_no.trim(),
      address: values.address.trim(),
      // only send when changed, because it also adjusts the current balance
      ...(openingChanged ? { opening_balance: values.opening_balance.trim() || "0" } : {}),
      is_active: isActive,
    });
    setSaving(false);

    if (!res.success) {
      toast.error(res.error || "Failed to update supplier");
      return;
    }
    toast.success(res.message);
    await queryClient.invalidateQueries({ queryKey: ["get-all-suppliers"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
     <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit supplier</DialogTitle>
          <DialogDescription>
            Current balance: <span className="font-medium text-foreground">{formatMoney(supplier.balance)}</span>
          </DialogDescription>
        </DialogHeader>

        <SupplierFields
          idPrefix="edit"
          values={values}
          errors={errors}
          onChange={(f, v) => setValues((prev) => (prev ? { ...prev, [f]: v } : prev))}
          openingBalanceHint="Changing this adjusts the current balance by the same difference"
          disabled={saving}
        />

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="edit-active" className="text-sm font-medium">
              Active supplier
            </Label>
            <p className="text-xs text-muted-foreground">
              Inactive suppliers are kept for history but can be hidden from new purchases.
            </p>
          </div>
          <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} disabled={saving} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}