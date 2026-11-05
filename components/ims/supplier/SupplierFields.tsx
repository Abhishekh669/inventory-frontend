import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  PAN_LENGTH,
  SupplierErrors,
  SupplierFormValues,
} from "@/utils/helper/supperlier-validation";

interface Props {
  idPrefix: string;
  values: SupplierFormValues;
  errors: SupplierErrors;
  onChange: (field: keyof SupplierFormValues, value: string) => void;
  openingBalanceHint?: string;
  disabled?: boolean;
  variant?: "default" | "wide";
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor} className="text-sm">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function SupplierFields({
  idPrefix,
  values,
  errors,
  onChange,
  openingBalanceHint,
  disabled,
  variant = "default",
}: Props) {
  const wide = variant === "wide";
  const id = (f: string) => `${idPrefix}-${f}`;
  const invalid = (f: keyof SupplierFormValues) =>
    errors[f] ? "border-destructive focus-visible:ring-destructive/30" : "";

  return (
    <div className={cn("grid gap-x-4 gap-y-5 sm:grid-cols-2", wide && "lg:grid-cols-12")}>
      <Field
        label="Supplier name"
        htmlFor={id("name")}
        error={errors.name}
        required
        className={wide ? "sm:col-span-2 lg:col-span-5" : "sm:col-span-2"}
      >
        <Input
          id={id("name")}
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="e.g. Ram Traders"
          disabled={disabled}
          className={invalid("name")}
        />
      </Field>

      <Field
        label="Contact person"
        htmlFor={id("contact")}
        error={errors.contact_person}
        className={wide ? "lg:col-span-4" : ""}
      >
        <Input
          id={id("contact")}
          value={values.contact_person}
          onChange={(e) => onChange("contact_person", e.target.value)}
          placeholder="Optional"
          disabled={disabled}
          className={invalid("contact_person")}
        />
      </Field>

      <Field
        label="Phone"
        htmlFor={id("phone")}
        error={errors.phone}
        className={wide ? "lg:col-span-3" : ""}
      >
        <Input
          id={id("phone")}
          type="tel"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="98XXXXXXXX"
          disabled={disabled}
          className={invalid("phone")}
        />
      </Field>

      <Field
        label="PAN no"
        htmlFor={id("pan")}
        error={errors.pan_no}
        hint={`${values.pan_no.length}/${PAN_LENGTH} digits`}
        className={wide ? "lg:col-span-3" : ""}
      >
        <Input
          id={id("pan")}
          inputMode="numeric"
          maxLength={PAN_LENGTH}
          value={values.pan_no}
          onChange={(e) => onChange("pan_no", e.target.value.replace(/\D/g, "").slice(0, PAN_LENGTH))}
          placeholder="9 digit PAN"
          disabled={disabled}
          className={invalid("pan_no")}
        />
      </Field>

      <Field
        label="Opening balance (Rs.)"
        htmlFor={id("balance")}
        error={errors.opening_balance}
        hint={openingBalanceHint ?? "Amount you already owe"}
        className={wide ? "lg:col-span-3" : ""}
      >
        <Input
          id={id("balance")}
          inputMode="decimal"
          value={values.opening_balance}
          onChange={(e) => onChange("opening_balance", e.target.value)}
          placeholder="0"
          disabled={disabled}
          className={invalid("opening_balance")}
        />
      </Field>

      <Field
        label="Address"
        htmlFor={id("address")}
        error={errors.address}
        className={wide ? "sm:col-span-2 lg:col-span-6" : "sm:col-span-2"}
      >
        {wide ? (
          <Input
            id={id("address")}
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Optional"
            disabled={disabled}
            className={invalid("address")}
          />
        ) : (
          <Textarea
            id={id("address")}
            value={values.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Optional"
            rows={2}
            disabled={disabled}
            className={invalid("address")}
          />
        )}
      </Field>
    </div>
  );
}