"use client";

import { Supplier } from "@/utils/types/suppliers.types";
import { createContext, useContext, type ReactNode } from "react";

interface SupplierContextType {
  supplier: Supplier;
}

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

export function SupplierProvider({
  supplier,
  children,
}: {
  supplier: Supplier;
  children: ReactNode;
}) {
  return (
    <SupplierContext.Provider value={{ supplier }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const context = useContext(SupplierContext);

  if (!context) {
    throw new Error(
      "useSupplier must be used within a SupplierProvider"
    );
  }

  return context;
}