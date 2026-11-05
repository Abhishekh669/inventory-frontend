"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { lastRoute } from "@/utils/helper/last-route";

export default function RestoreLastRoute() {
  const router = useRouter();

  useEffect(() => {
    router.replace(lastRoute.get() ?? "/dashboard");
  }, [router]);

  return null;
}