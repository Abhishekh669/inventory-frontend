import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Supplier } from "@/utils/types/suppliers.types";
import { formatMoney } from "@/utils/helper/supplier";
import { Users, UserCheck, Wallet, type LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  iconClass: string; // icon tile colors
  progress?: number; // 0-100, optional bar
  barClass?: string;
}

export function SupplierStats({ suppliers }: { suppliers: Supplier[] }) {
  const total = suppliers.length;
  const active = suppliers.filter((s) => s.is_active).length;
  const inactive = total - active;

  // only positive balances count as money we owe
  const owing = suppliers.filter((s) => (Number(s.balance) || 0) > 0);
  const payable = owing.reduce((sum, s) => sum + (Number(s.balance) || 0), 0);

  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

  const items: StatItem[] = [
    {
      label: "Total suppliers",
      value: total,
      hint: total === 0 ? "No suppliers added yet" : "All registered suppliers",
      icon: Users,
      iconClass: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    },
    {
      label: "Active suppliers",
      value: active,
      hint: inactive > 0 ? `${inactive} inactive` : "All suppliers are active",
      icon: UserCheck,
      iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      progress: activePercent,
      barClass: "bg-emerald-500",
    },
    {
      label: "Total payable",
      value: formatMoney(payable),
      hint:
        owing.length > 0
          ? `Across ${owing.length} ${owing.length === 1 ? "supplier" : "suppliers"}`
          : "Nothing to pay right now",
      icon: Wallet,
      iconClass: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ label, value, hint, icon: Icon, iconClass, progress, barClass }) => (
        <Card key={label} className="shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="truncate text-2xl font-semibold tabular-nums tracking-tight">
                  {value}
                </p>
              </div>
              <div className={cn("shrink-0 rounded-xl p-2.5", iconClass)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {progress !== undefined && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", barClass)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <p className={cn("text-xs text-muted-foreground", progress !== undefined ? "mt-2" : "mt-4")}>
              {hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}