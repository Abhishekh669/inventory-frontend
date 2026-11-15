"use client";

import type { User } from "@/utils/types/user.types";
import { SupplierPurchaseOrdersView } from "./SupplierPurchasesOrderView";
import { useSupplier } from "../supplier/SupplierContext";

function SupplierDetailManagementPage({
  user,
}: {
  user: User;
}) {
  const { supplier } = useSupplier();

  if (!user) return null;

  return (
    <SupplierPurchaseOrdersView supplier={supplier} />
  );
}

export default SupplierDetailManagementPage;