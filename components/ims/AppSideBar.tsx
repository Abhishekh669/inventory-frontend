"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  CreditCard,
  Users,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import type { UserPropsTypes } from "./IMSWrapper"; // adjust path/name to where the wrapper lives
import { AvailableRoutes, canAccessRoute } from "@/utils/rbac/role-n-permission";
import { lastRoute } from "@/utils/helper/last-route";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: AvailableRoutes.DASHBOARD, icon: LayoutDashboard },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Products", href: AvailableRoutes.PRODUCTS, icon: Package },
      { label: "Categories", href: AvailableRoutes.CATEGORIES, icon: Tags },
      { label: "Stock", href: AvailableRoutes.STOCK, icon: Boxes },
      { label: "Suppliers", href: AvailableRoutes.SUPPLIERS, icon: Truck },
      { label: "Purchases", href: AvailableRoutes.PURCHASES, icon: ShoppingCart },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Billing", href: AvailableRoutes.BILLING, icon: CreditCard },
      { label: "Sales", href: AvailableRoutes.SALES, icon: Receipt },
      { label: "Customers", href: AvailableRoutes.CUSTOMERS, icon: Users },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Reports", href: AvailableRoutes.REPORTS, icon: BarChart3 },
      { label: "Users", href: AvailableRoutes.USERS, icon: UserCog },
      { label: "Settings", href: AvailableRoutes.SETTINGS, icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  user: UserPropsTypes;
}

export function AppSidebar({ collapsed, onToggle, user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Keep only the links this role can open, and drop groups that end up empty.
  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessRoute(user.role, item.href)),
  })).filter((group) => group.items.length > 0);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = () => {
    // Replace with your real logout (call the API / clear the token / clear the query cache).
    lastRoute.clear();
    router.replace("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200/80 bg-white",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-18" : "w-65"
      )}
    >
      {/* Floating collapse button on the sidebar edge */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-5 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-3 border-b border-gray-100 px-4",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white shadow-sm">
          <Hammer size={18} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-gray-900">Hardware IMS</p>
            <p className="truncate text-xs text-gray-500">Inventory manager</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin]">
        {visibleGroups.map((group, index) => (
          <div key={group.title} className={cn(index > 0 && "mt-5")}>
            {collapsed ? (
              // thin divider instead of the title when collapsed
              index > 0 && <div className="mx-3 mb-3 border-t border-gray-100" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={() => router.prefetch(item.href)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon
                      size={18}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-white" : "text-gray-400 group-hover:text-gray-700"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-gray-50 p-2.5",
            collapsed && "justify-center bg-transparent p-0"
          )}
        >
          <div
            title={collapsed ? `${user.name} (${user.role})` : undefined}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white"
          >
            {initials || "U"}
          </div>

          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
                <p className="truncate text-xs capitalize text-gray-500">{user.role}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
                className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={17} />
              </button>
            </>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="mt-2 flex w-full justify-center rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}

export default AppSidebar;