"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Truck,
} from "lucide-react";

import { useGetSupplier } from "@/utils/hooks/tanstack/suppliers/use-get-supplier-by-id";
import { SupplierProvider } from "./supplier/SupplierContext";

function SupplierIdWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ supplier_id: string }>();
  const supplierId = params?.supplier_id;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetSupplier(supplierId ?? "");

  // 1. Invalid supplier ID
  if (!supplierId) {
    return (
      <StateContainer>
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <h2 className="text-lg font-semibold">
          Invalid Supplier ID
        </h2>

        <p className="max-w-sm text-center text-sm text-muted-foreground">
          The supplier ID provided in the URL is invalid.
        </p>

        <BackButton />
      </StateContainer>
    );
  }

  // 2. Initial loading
  if (isLoading) {
    return (
      <StateContainer>
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
        </div>

        <div className="space-y-1 text-center">
          <h2 className="font-semibold">Loading Supplier</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch supplier information...
          </p>
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      </StateContainer>
    );
  }

  // 3. Initial API error
  if (isError && !data?.supplier) {
    return (
      <StateContainer>
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold">
            Failed to Load Supplier
          </h2>

          <p className="max-w-md text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Something went wrong while fetching supplier information."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            Retry
          </button>

          <BackButton />
        </div>
      </StateContainer>
    );
  }

  // 4. Supplier not found
  if (!data?.supplier) {
    return (
      <StateContainer>
        <div className="rounded-full bg-muted p-4">
          <Truck className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-semibold">
          Supplier Not Found
        </h2>

        <p className="max-w-sm text-center text-sm text-muted-foreground">
          The supplier you're looking for doesn't exist or may have
          been removed.
        </p>

        <BackButton />
      </StateContainer>
    );
  }

  // 5. Successfully loaded
  return (
    <SupplierProvider supplier={data.supplier}>
      <div className="relative">
        {/* Background refetch indicator */}
        {isFetching && (
          <div className="absolute right-0 top-0 z-50 flex items-center gap-2 rounded-md bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing supplier...
          </div>
        )}

        {/* Background refetch error */}
        {isError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                Unable to refresh supplier information. Showing previous data.
              </span>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="shrink-0 text-sm font-medium text-destructive hover:underline disabled:opacity-50"
            >
              Retry
            </button>
          </div>
        )}

        {children}
      </div>
    </SupplierProvider>
  );
}

// Reusable state layout
function StateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      {children}
    </div>
  );
}

// Reusable back button
function BackButton() {
  return (
    <Link
      href="/suppliers"
      className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Suppliers
    </Link>
  );
}

export default SupplierIdWrapper;