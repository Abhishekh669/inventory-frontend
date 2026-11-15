"use client"

import React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AlertCircle, ArrowLeft, Loader2, Receipt, RefreshCw } from "lucide-react"
import { useGetPurchaseById } from "@/utils/hooks/tanstack/purchase/use-get-purchase-by-id"
import { PurchaseProvider } from "./PurchaseContext"

function StateContainer({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">{children}</div>
}

function BackButton() {
  return (
    <Link
      href="/all-purchases"
      className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Purchases
    </Link>
  )
}

function PurchaseIdWrapper({ children }: { children: React.ReactNode }) {
  const params = useParams<{ purchase_id: string }>()
  const purchaseId = params?.purchase_id

  const { data, isLoading, isError, error, refetch, isFetching } = useGetPurchaseById(purchaseId ?? "")

  if (!purchaseId) {
    return (
      <StateContainer>
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Invalid Purchase ID</h2>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          The purchase ID in the URL is invalid.
        </p>
        <BackButton />
      </StateContainer>
    )
  }

  if (isLoading) {
    return (
      <StateContainer>
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
          <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="font-semibold">Loading Purchase</h2>
          <p className="text-sm text-muted-foreground">Please wait while we fetch the purchase...</p>
        </div>
      </StateContainer>
    )
  }

  if (isError && !data) {
    return (
      <StateContainer>
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-lg font-semibold">Failed to Load Purchase</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong while fetching the purchase."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Retry
          </button>
          <BackButton />
        </div>
      </StateContainer>
    )
  }

  if (!data) {
    return (
      <StateContainer>
        <div className="rounded-full bg-muted p-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Purchase Not Found</h2>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          This purchase doesn&apos;t exist or may have been removed.
        </p>
        <BackButton />
      </StateContainer>
    )
  }

  return (
    <PurchaseProvider purchase={data}>
      <div className="relative">
        {isFetching && (
          <div className="absolute right-0 top-0 z-50 flex items-center gap-2 rounded-md bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing purchase...
          </div>
        )}

        {isError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Unable to refresh the purchase. Showing previous data.</span>
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
    </PurchaseProvider>
  )
}

export default PurchaseIdWrapper