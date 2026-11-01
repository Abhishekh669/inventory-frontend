"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetUserFromToken } from "@/utils/hooks/tanstack/users/use-get-user-from-token";
import { RoleType } from "@/utils/types/user.types";
import { cn } from "cn";
import { AppSidebar } from "./AppSideBar";


export interface UserPropsTypes {
    id: string;
    name: string;
    email: string;
    role: RoleType;
}



function IMSWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isLoading } = useGetUserFromToken();
  const user = data ?? null;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  const sidebarUser: UserPropsTypes | null = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    : null;

  return (
    <div className="min-h-screen">
      {sidebarUser ? (
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          user={sidebarUser}
        />
      ) : (
        <SidebarSkeleton />
      )}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen p-8",
          collapsed ? "ml-18" : "ml-65"
        )}
      >
        {children}
      </main>
    </div>
  );
}



function SidebarSkeleton() {
  return (
    <div className="fixed top-0 left-0 w-65 min-h-screen bg-white border-r border-gray-100 flex flex-col gap-4 p-4 shrink-0">
      <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}


export default IMSWrapper;