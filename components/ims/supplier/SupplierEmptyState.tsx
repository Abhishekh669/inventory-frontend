import { PackageSearch } from "lucide-react";

export function SupplierEmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="mb-3 rounded-full bg-muted p-3">
        <PackageSearch className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">
        {filtered ? "No suppliers match your search" : "No suppliers yet"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered
          ? "Try a different name, phone number or status."
          : "Suppliers you add will show up here."}
      </p>
    </div>
  );
}