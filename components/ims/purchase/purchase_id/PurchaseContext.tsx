"use client"

import { createContext, useContext } from "react"
import type { PurchaseByIdResponse } from "@/utils/types/purchase.types"

const PurchaseContext = createContext<PurchaseByIdResponse | null>(null)

export function PurchaseProvider({
  purchase,
  children,
}: {
  purchase: PurchaseByIdResponse
  children: React.ReactNode
}) {
  return <PurchaseContext.Provider value={purchase}>{children}</PurchaseContext.Provider>
}

export function usePurchase() {
  const ctx = useContext(PurchaseContext)
  if (!ctx) throw new Error("usePurchase must be used inside PurchaseProvider")
  return ctx
}