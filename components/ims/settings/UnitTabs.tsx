"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Pencil, Plus, RotateCcw, Ruler, Search, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Unit } from "@/utils/types/settings.types"
import { useGetAllUnits } from "@/utils/hooks/tanstack/settings/use-get-units"
import { StatePanel } from "./SettingStatePannel"
import { CreateUnitsDialog } from "./CreateUnitsDialog"
import { EditUnitDialog } from "./EditUnitDialog"
import { DeleteUnitsDialog } from "./DeleteUnitsDialog"

export function UnitsTab() {
  const { data, isLoading, isError, refetch } = useGetAllUnits()
  const units: Unit[] = useMemo(() => data?.setting ?? [], [data])

  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Unit | null>(null)
  const [deleting, setDeleting] = useState<Unit[]>([])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? units.filter((u) => u.name.toLowerCase().includes(q)) : units
  }, [units, search])

  const selected = useMemo(() => units.filter((u) => selectedIds.has(u.id)), [units, selectedIds])

  const selectedInView = filtered.filter((u) => selectedIds.has(u.id)).length
  const allSelected = filtered.length > 0 && selectedInView === filtered.length
  const someSelected = selectedInView > 0 && !allSelected

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      filtered.forEach((u) => (checked ? next.add(u.id) : next.delete(u.id)))
      return next
    })
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search units"
            aria-label="Search units"
            className="h-10 pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Badge variant="secondary" className="tabular-nums">
          {filtered.length} of {units.length}
        </Badge>

        <Button className="ml-auto h-10" onClick={() => setCreateOpen(true)}>
          <Plus data-icon="inline-start" /> Add units
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5">
          <p className="text-sm font-medium">{selected.length} selected</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleting(selected)}>
              <Trash2 data-icon="inline-start" /> Delete selected
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <UnitsSkeleton />
      ) : isError && units.length === 0 ? (
        <StatePanel
          icon={AlertCircle}
          title="Couldn't load units"
          description="Check your connection and try again."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RotateCcw data-icon="inline-start" /> Try again
            </Button>
          }
        />
      ) : units.length === 0 ? (
        <StatePanel
          icon={Ruler}
          title="No units yet"
          description="Add units like pcs, kg or meter to use on your products."
          action={
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus data-icon="inline-start" /> Add units
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center text-sm text-muted-foreground">
          No units match &quot;{search}&quot;.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 pl-4">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(v) => toggleAll(v === true)}
                    aria-label="Select all units"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quantity type</TableHead>
                <TableHead className="w-28 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((unit) => (
                <TableRow key={unit.id} data-state={selectedIds.has(unit.id) ? "selected" : undefined}>
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={selectedIds.has(unit.id)}
                      onCheckedChange={(v) => toggleOne(unit.id, v === true)}
                      aria-label={`Select ${unit.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-xs font-semibold text-primary"
                        aria-hidden="true"
                      >
                        {unit.name.slice(0, 2)}
                      </span>
                      <span className="font-medium">{unit.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={unit.allow_decimal ? "secondary" : "outline"} className="gap-1.5">
                      <span
                        className={
                          unit.allow_decimal
                            ? "size-1.5 rounded-full bg-emerald-500"
                            : "size-1.5 rounded-full bg-muted-foreground/50"
                        }
                        aria-hidden="true"
                      />
                      {unit.allow_decimal ? "Decimals allowed" : "Whole numbers"}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg"
                        onClick={() => setEditing(unit)}
                        aria-label={`Edit ${unit.name}`}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting([unit])}
                        aria-label={`Delete ${unit.name}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateUnitsDialog open={createOpen} onOpenChange={setCreateOpen} units={units} />
      <EditUnitDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        unit={editing}
        units={units}
      />
      <DeleteUnitsDialog
        open={deleting.length > 0}
        onOpenChange={(open) => !open && setDeleting([])}
        units={deleting}
        onDeleted={(ids) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            ids.forEach((id) => next.delete(id))
            return next
          })
        }
      />
    </section>
  )
}

function UnitsSkeleton() {
  return (
    <div className="divide-y overflow-hidden rounded-2xl border bg-card shadow-sm" aria-busy="true" aria-label="Loading units">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="size-4 animate-pulse rounded bg-muted" />
          <div className="size-9 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}