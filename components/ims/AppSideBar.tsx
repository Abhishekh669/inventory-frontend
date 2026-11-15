"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  ShoppingCart,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  BookOpen,
  Wallet,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { cn } from "cn";

import type { UserPropsTypes } from "./IMSWrapper";

import {
  AvailableRoutes,
  AppRoutePaths,
  canAccessRoute,
} from "@/utils/rbac/role-n-permission";

import { lastRoute } from "@/utils/helper/last-route";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: UserPropsTypes;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SupplierNavItem {
  label: string;
  icon: LucideIcon;
  getHref: (supplierId: string) => string;
}

/* -------------------------------------------------------------------------- */
/*                              Navigation Items                              */
/* -------------------------------------------------------------------------- */

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: AvailableRoutes.DASHBOARD,
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        label: "Products",
        href: AvailableRoutes.PRODUCTS,
        icon: Package,
      },
      {
        label: "Categories",
        href: AvailableRoutes.CATEGORIES,
        icon: Tags,
      },
      {
        label: "All Purchases",
        href: AvailableRoutes.PURCHASES,
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Settings",
        href: AvailableRoutes.SETTINGS,
        icon: Settings,
      },
    ],
  },
];

const supplierNavItems: SupplierNavItem[] = [
  {
    label: "Supplier Ledger",
    icon: BookOpen,
    getHref: AppRoutePaths.SUPPLIER_LEDGER,
  },
  {
    label: "Supplier Payments",
    icon: Wallet,
    getHref: AppRoutePaths.SUPPLIER_PAYMENTS,
  },
  {
    label: "Supplier Purchases",
    icon: ShoppingCart,
    getHref: AppRoutePaths.SUPPLIER_PURCHASES,
  },
  {
    label: "Purchase Returns",
    icon: RotateCcw,
    getHref: AppRoutePaths.SUPPLIER_RETURNS,
  },
];

/* -------------------------------------------------------------------------- */
/*                                App Sidebar                                 */
/* -------------------------------------------------------------------------- */

export default function AppSidebar({
  collapsed,
  onToggle,
  user,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const supplierMatch = pathname.match(
  /^\/suppliers\/([^/]+)(?:\/|$)/
);

const supplierId = supplierMatch?.[1];

const isSupplierRoute =
  pathname === AvailableRoutes.SUPPLIERS ||
  pathname.startsWith(`${AvailableRoutes.SUPPLIERS}/`);

const [supplierOpen, setSupplierOpen] = useState(isSupplierRoute);

useEffect(() => {
  if (isSupplierRoute) {
    setSupplierOpen(true);
  }
}, [isSupplierRoute]);


  /* ------------------------------- User Role -------------------------------- */

  const userRole = user.role;

  const canViewSuppliers = canAccessRoute(
    userRole,
    AvailableRoutes.SUPPLIERS
  );

  /* ------------------------------ Active Route ------------------------------ */

  const isActive = (href: string) => {
    if (href === AvailableRoutes.DASHBOARD) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* ---------------------------- Filter Navigation -------------------------- */

  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canAccessRoute(userRole, item.href)
      ),
    }))
    .filter((group) => group.items.length > 0);

  /* -------------------------------- Logout --------------------------------- */

  const handleLogout = () => {
    lastRoute.clear();
    router.replace("/login");
  };

  /* ------------------------------ User Details ------------------------------ */

  const userName = user.name || user.email || "User";

  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* -------------------------------------------------------------------------- */
  /*                                   Render                                   */
  /* -------------------------------------------------------------------------- */

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* -------------------------------- Header -------------------------------- */}

      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link
            href={AvailableRoutes.DASHBOARD}
            className="truncate text-lg font-bold"
          >
            Inventory
          </Link>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      {/* --------------------------------- Nav ---------------------------------- */}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {filteredNavGroups.map((group) => (
          <div key={group.title} className="mt-5 first:mt-0">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </p>
            )}

            <div className="space-y-1">
              {/* ------------------------- Normal Nav Items ------------------------ */}

              {group.items.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}

              {/* ------------------------ Supplier Navigation ---------------------- */}

            {group.title === "Inventory" && canViewSuppliers && (
  <Collapsible
    open={!collapsed && supplierOpen}
    onOpenChange={setSupplierOpen}
    className="space-y-1"
  >
    {/* Supplier navigation header */}
    <div className="flex items-center gap-1">
      <Link
        href={AvailableRoutes.SUPPLIERS}
        title={collapsed ? "Suppliers" : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
          isSupplierRoute
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Truck className="size-4 shrink-0" />

        {!collapsed && <span>Suppliers</span>}
      </Link>

      {!collapsed && (
        <CollapsibleTrigger
          aria-label={
            supplierOpen
              ? "Collapse supplier navigation"
              : "Expand supplier navigation"
          }
          className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              supplierOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
      )}
    </div>

    {/* Supplier nested routes */}
    <CollapsibleContent className="overflow-hidden">
      {!collapsed && (
        <div className="ml-5 space-y-1 border-l pl-3 pt-1">
          {supplierId ? (
            supplierNavItems
              .filter((item) =>
                canAccessRoute(userRole, item.getHref(supplierId))
              )
              .map((item) => {
                const href = item.getHref(supplierId);

                const active = pathname === href;

                return (
                  <Link
                    key={item.label}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />

                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })
          ) : (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              Select a supplier to view details
            </p>
          )}
        </div>
      )}
    </CollapsibleContent>
  </Collapsible>
)}
            </div>
          </div>
        ))}
      </nav>

      {/* -------------------------------- Footer -------------------------------- */}

      <div className="border-t p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {userInitials}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs capitalize text-muted-foreground">
                {userRole}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="size-4 shrink-0" />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}