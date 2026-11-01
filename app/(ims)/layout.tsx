// app/dashboard/layout.tsx
import IMSWrapper from "@/components/ims/IMSWrapper";
import { Suspense } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <IMSWrapper>{children}</IMSWrapper>
    </Suspense>
  );
}