"use client";
import React, { useMemo, useState } from "react";
import { User } from "@/utils/types/user.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, AlertCircle, Plus, Trash2, X } from "lucide-react";
import { StatusFilter, SupplierToolbar } from "./SupplierToolbar";
import { Supplier } from "@/utils/types/suppliers.types";
import { useGetSuppliers } from "@/utils/hooks/tanstack/suppliers/use-get-all-suppliers";
import { SupplierSkeleton } from "./SupplierSkeleton";
import { SupplierStats } from "./SupplierStats";
import { SupplierEmptyState } from "./SupplierEmptyState";
import { SupplierTable } from "./SupplierTable";
import { SupplierCard } from "./SupplierCard";
import { CreateSuppliersDialog } from "./CreateSuppliersDialog";
import { EditSupplierDialog } from "./EditSupplierDialog";
import { DeleteSuppliersDialog } from "./DeleteSuppliersDialog";

function SupplierManagementPage({ user }: { user: User }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useGetSuppliers();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState<Supplier[]>([]);

  const all = data?.suppliers ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((s) => {
      if (status === "active" && !s.is_active) return false;
      if (status === "inactive" && s.is_active) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q) ||
        (s.contact_person ?? "").toLowerCase().includes(q) ||
        (s.pan_no ?? "").toLowerCase().includes(q)
      );
    });
  }, [all, search, status]);

  // only count selected suppliers that still exist
  const selectedSuppliers = useMemo(
    () => all.filter((s) => selectedIds.has(s.id)),
    [all, selectedIds]
  );

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // select all applies to the rows currently visible
  const toggleAll = (checked: boolean) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((s) => (checked ? next.add(s.id) : next.delete(s.id)));
      return next;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suppliers</h1>
          <p className="text-sm text-muted-foreground">
            Manage your suppliers and see what you owe each of them.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add suppliers
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SupplierSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-medium">Could not load suppliers</p>
              <p className="text-sm text-muted-foreground">
                {(error as Error)?.message || "Something went wrong."}
              </p>
            </div>
            <Button size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <SupplierStats suppliers={all} />

          <SupplierToolbar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            shown={filtered.length}
            total={all.length}
          />

          {selectedSuppliers.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
              <p className="text-sm font-medium">{selectedSuppliers.length} selected</p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                  <X className="mr-1.5 h-4 w-4" />
                  Clear
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleting(selectedSuppliers)}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete selected
                </Button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <SupplierEmptyState filtered={all.length > 0} />
          ) : (
            <>
              <div className="hidden md:block">
                <SupplierTable
                  suppliers={filtered}
                  selectedIds={selectedIds}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                  onEdit={setEditing}
                  onDelete={(s) => setDeleting([s])}
                />
              </div>
              <div className="grid gap-3 md:hidden">
                {filtered.map((s) => (
                  <SupplierCard
                    key={s.id}
                    supplier={s}
                    selected={selectedIds.has(s.id)}
                    onToggle={() => toggle(s.id)}
                    onEdit={() => setEditing(s)}
                    onDelete={() => setDeleting([s])}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <CreateSuppliersDialog open={createOpen} onOpenChange={setCreateOpen} existing={all} />

      <EditSupplierDialog
        supplier={editing}
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        existing={all}
      />

      <DeleteSuppliersDialog
        suppliers={deleting}
        open={deleting.length > 0}
        onOpenChange={(v) => !v && setDeleting([])}
        onDeleted={() =>
          setSelectedIds((prev) => {
            const next = new Set(prev);
            deleting.forEach((s) => next.delete(s.id));
            return next;
          })
        }
      />
    </div>
  );
}

export default SupplierManagementPage;