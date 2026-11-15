
"use client";

import { useState } from "react";
import Link from "next/link";
import Decimal from "decimal.js";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  Copy,
  Hash,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatMoney } from "@/utils/helper/format";
import { getInitials } from "@/utils/helper/supplier";
import type { Supplier } from "@/utils/types/suppliers.types";

function toDecimal(value: string | null | undefined) {
  try {
    return new Decimal(value || 0);
  } catch {
    return new Decimal(0);
  }
}

function getBalanceTone(supplier: Supplier) {
  const balance = toDecimal(supplier.balance);

  if (!supplier.is_active) {
    return {
      label: "Account balance",
      status: "Inactive",
      amount: balance.abs(),
      color: "text-muted-foreground",
      background: "bg-muted/40",
      badge: "bg-muted text-muted-foreground border-border",
      icon: Wallet,
    };
  }

  if (balance.gt(0)) {
    return {
      label: "Outstanding balance",
      status: "Payment due",
      amount: balance,
      color: "text-red-600 dark:text-red-400",
      background: "bg-red-50/70 dark:bg-red-950/20",
      badge:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
      icon: CircleAlert,
    };
  }

  if (balance.lt(0)) {
    return {
      label: "Advance paid",
      status: "Advance",
      amount: balance.abs(),
      color: "text-blue-600 dark:text-blue-400",
      background: "bg-blue-50/70 dark:bg-blue-950/20",
      badge:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
      icon: Wallet,
    };
  }

  return {
    label: "Outstanding balance",
    status: "Settled",
    amount: balance,
    color: "text-emerald-600 dark:text-emerald-400",
    background: "bg-emerald-50/70 dark:bg-emerald-950/20",
    badge:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
    icon: Check,
  };
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-emerald-500" : "bg-muted-foreground"
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);

      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-7 shrink-0 text-muted-foreground"
      onClick={copy}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </Button>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: typeof Phone;
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="break-words text-sm font-medium">{value}</div>
      </div>

      {action}
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
  color = "text-foreground",
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
        <Icon className="size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-semibold tabular-nums",
            color
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

const notProvided = (
  <span className="font-normal text-muted-foreground">
    Not provided
  </span>
);

export function SupplierHeaderCard({
  supplier,
}: {
  supplier: Supplier;
}) {
  const tone = getBalanceTone(supplier);
  const BalanceIcon = tone.icon;

  const openingBalance = toDecimal(supplier.opening_balance);
  const creditBalance = toDecimal(supplier.credit_balance);

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <Link
          href="/suppliers"
          className="flex size-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to suppliers"
        >
          <ArrowLeft className="size-4" />
        </Link>

        <Avatar
          className={cn(
            "size-10 shrink-0 rounded-xl border",
            !supplier.is_active && "opacity-60 grayscale"
          )}
        >
          <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(supplier.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold tracking-tight">
              {supplier.name}
            </h1>

            <StatusChip active={supplier.is_active} />
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3" />
              {supplier.contact_person || "No contact person"}
            </span>

            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" />
              Since {formatDate(supplier.created_at)}
            </span>
          </div>
        </div>
      </div>

      {!supplier.is_active && (
        <div className="border-b bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
          This supplier is inactive. Supplier account operations may be restricted.
        </div>
      )}

      {/* Main content */}
      <div className="grid divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {/* Contact details */}
        <div className="p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              icon={Phone}
              label="Phone number"
              value={
                supplier.phone ? (
                  <a
                    href={`tel:${supplier.phone.replace(/\s+/g, "")}`}
                    className="tabular-nums hover:text-primary hover:underline"
                  >
                    {supplier.phone}
                  </a>
                ) : (
                  notProvided
                )
              }
              action={
                supplier.phone ? (
                  <CopyButton
                    value={supplier.phone}
                    label="Phone number"
                  />
                ) : undefined
              }
            />

            <DetailItem
              icon={Hash}
              label="PAN number"
              value={
                supplier.pan_no ? (
                  <span className="tabular-nums">
                    {supplier.pan_no}
                  </span>
                ) : (
                  notProvided
                )
              }
              action={
                supplier.pan_no ? (
                  <CopyButton
                    value={supplier.pan_no}
                    label="PAN number"
                  />
                ) : undefined
              }
            />

            <div className="sm:col-span-2">
              <DetailItem
                icon={MapPin}
                label="Address"
                value={supplier.address || notProvided}
              />
            </div>
          </div>
        </div>

        {/* Account overview */}
        <div className="p-4">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account overview
          </h2>

          <div className="space-y-3">
            {/* Current balance */}
            <div
              className={cn(
                "flex min-w-0 items-center justify-between gap-3 rounded-xl border p-4",
                tone.background
              )}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  {tone.label}
                </p>

                <p
                  className={cn(
                    "mt-1 truncate text-2xl font-bold tracking-tight tabular-nums",
                    tone.color
                  )}
                >
                  {formatMoney(tone.amount.toFixed(2))}
                </p>

                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    tone.badge
                  )}
                >
                  <BalanceIcon className="size-3" />
                  {tone.status}
                </span>
              </div>

              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background/70">
                <BalanceIcon className={cn("size-5", tone.color)} />
              </div>
            </div>

            {/* Account statistics */}
            <div className="grid grid-cols-2 gap-2">
              <StatItem
                icon={Wallet}
                label="Opening balance"
                value={formatMoney(openingBalance.toFixed(2))}
              />

              <StatItem
                icon={Wallet}
                label="Available advance"
                value={formatMoney(creditBalance.abs().toFixed(2))}
                color="text-emerald-600 dark:text-emerald-400"
              />

              <StatItem
                icon={CalendarDays}
                label="Registered on"
                value={formatDate(supplier.created_at)}
              />

              <StatItem
                icon={Wallet}
                label="Account status"
                value={
                  supplier.is_active ? "Active" : "Inactive"
                }
                color={
                  supplier.is_active
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
