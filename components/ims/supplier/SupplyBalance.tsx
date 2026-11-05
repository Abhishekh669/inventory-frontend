import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/helper/supplier";

// positive = we owe the supplier, negative = advance paid, zero = settled
export function SupplierBalance({ value, className }: { value: string; className?: string }) {
  const n = Number(value) || 0;
  return (
    <div className={cn("flex flex-col", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          n > 0 && "text-red-600",
          n < 0 && "text-emerald-600",
          n === 0 && "text-muted-foreground"
        )}
      >
        {formatMoney(Math.abs(n))}
      </span>
      <span className="text-xs text-muted-foreground">
        {n > 0 ? "To pay" : n < 0 ? "Advance paid" : "Settled"}
      </span>
    </div>
  );
}