import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Supplier } from "@/utils/types/suppliers.types";
import { getInitials, getSupplierTone } from "@/utils/helper/supplier";
import { SupplierBalance } from "./SupplyBalance";
import { SupplierRowActions } from "./SupplierRowActions";

export function SupplierStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        active
          ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-400"
          : "border-gray-300 bg-gray-200 text-gray-600 dark:border-border dark:bg-muted dark:text-muted-foreground"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-gray-400")} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function SupplierLegend() {
  const items = [
    { label: "Balance to pay", dot: "bg-red-500" },
    { label: "No balance due", dot: "bg-emerald-500" },
    { label: "Inactive", dot: "bg-gray-400" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className={cn("h-2.5 w-2.5 rounded-sm", i.dot)} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

interface Props {
  suppliers: Supplier[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
}

const head = "h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function SupplierTable({ suppliers, selectedIds, onToggle, onToggleAll, onEdit, onDelete }: Props) {
  const selectedCount = suppliers.filter((s) => selectedIds.has(s.id)).length;
  const allSelected = suppliers.length > 0 && selectedCount === suppliers.length;

  return (
    <div className="space-y-3">
      <SupplierLegend />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead className={cn(head, "w-12 pl-5")}>
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onCheckedChange={(checked) => onToggleAll(checked)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className={head}>Supplier</TableHead>
              <TableHead className={head}>Phone</TableHead>
              <TableHead className={head}>PAN no</TableHead>
              <TableHead className={head}>Address</TableHead>
              <TableHead className={cn(head, "text-right")}>Balance</TableHead>
              <TableHead className={head}>Status</TableHead>
              <TableHead className={cn(head, "w-12")} />
            </TableRow>
          </TableHeader>

          <TableBody>
            {suppliers.map((s) => {
              const tone = getSupplierTone(s);
              const selected = selectedIds.has(s.id);

              return (
                <TableRow
                  key={s.id}
                  className={cn(
                    "border-b transition-colors last:border-b-0",
                    tone.row,
                    selected && "bg-primary/10 hover:bg-primary/10 dark:bg-primary/15"
                  )}
                >
                  {/* checkbox + left color bar */}
                  <TableCell className="relative w-12 py-3.5 pl-5">
                    <span className={cn("absolute inset-y-0 left-0 w-1", tone.bar)} />
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => onToggle(s.id)}
                      aria-label={`Select ${s.name}`}
                    />
                  </TableCell>

                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar className={cn("h-9 w-9", tone.inactive && "opacity-60 grayscale")}>
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {getInitials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate font-medium",
                            tone.inactive ? "text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {s.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.contact_person || "No contact person"}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 tabular-nums">{s.phone || "-"}</TableCell>
                  <TableCell className="py-3.5 tabular-nums">{s.pan_no || "-"}</TableCell>
                  <TableCell className="max-w-56 truncate py-3.5 text-muted-foreground">
                    {s.address || "-"}
                  </TableCell>

                  <TableCell className="py-3.5 text-right">
                    <SupplierBalance value={s.balance} className="items-end" />
                  </TableCell>

                  <TableCell className="py-3.5">
                    <SupplierStatusBadge active={s.is_active} />
                  </TableCell>

                  <TableCell className="py-3.5 pr-4">
                    <SupplierRowActions onEdit={() => onEdit(s)} onDelete={() => onDelete(s)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}