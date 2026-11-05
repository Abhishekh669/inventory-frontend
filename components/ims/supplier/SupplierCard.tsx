import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, getSupplierTone } from "@/utils/helper/supplier";
import { SupplierStatusBadge } from "./SupplierTable";
import { SupplierRowActions } from "./SupplierRowActions";
import { MapPin, Phone, FileText } from "lucide-react";
import { Supplier } from "@/utils/types/suppliers.types";
import { SupplierBalance } from "./SupplyBalance";

interface Props {
  supplier: Supplier;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SupplierCard({ supplier: s, selected, onToggle, onEdit, onDelete }: Props) {
  const tone = getSupplierTone(s);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border shadow-sm transition-colors",
        tone.row,
        selected && "border-primary/50 bg-primary/10 hover:bg-primary/10"
      )}
    >
      {/* left color bar: red = balance to pay, green = nothing due */}
      <span className={cn("absolute inset-y-0 left-0 w-1", tone.bar)} />

      <CardContent className="space-y-3 p-4 pl-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <Checkbox
              checked={selected}
              onCheckedChange={onToggle}
              aria-label={`Select ${s.name}`}
            />
            <Avatar className={cn("h-10 w-10", tone.inactive && "opacity-60 grayscale")}>
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

          <div className="flex shrink-0 items-center gap-1">
            <SupplierStatusBadge active={s.is_active} />
            <SupplierRowActions onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">{s.phone || "-"}</span>
          </p>
          <p className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">PAN: {s.pan_no || "-"}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-2">{s.address || "-"}</span>
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10">
          <span className="text-sm text-muted-foreground">Balance</span>
          <SupplierBalance value={s.balance} className="items-end" />
        </div>
      </CardContent>
    </Card>
  );
}