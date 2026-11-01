import { RoleType } from "../types/user.types";


export const DashboardAction = {
  VIEW_DASHBOARD: "view:dashboard",
} as const;

export const ProductManagementAction = {
  VIEW_PRODUCTS: "view:products",
  CREATE_PRODUCTS: "create:products",
  UPDATE_PRODUCTS: "update:products",
  DELETE_PRODUCTS: "delete:products",
  VIEW_CATEGORY: "view:category",
  CREATE_CATEGORY: "create:category",
  UPDATE_CATEGORY: "update:category",
  DELETE_CATEGORY: "delete:category",
} as const;

export const StockManagementAction = {
  VIEW_STOCK: "view:stock",
  ADJUST_STOCK: "adjust:stock", // manual corrections, damage, write-offs
  VIEW_STOCK_HISTORY: "view:stock_history",
  VIEW_LOW_STOCK: "view:low_stock",
} as const;

export const SupplierManagementAction = {
  VIEW_SUPPLIERS: "view:suppliers",
  CREATE_SUPPLIERS: "create:suppliers",
  UPDATE_SUPPLIERS: "update:suppliers",
  DELETE_SUPPLIERS: "delete:suppliers",
} as const;

export const PurchaseManagementAction = {
  VIEW_PURCHASES: "view:purchases",
  CREATE_PURCHASES: "create:purchases", // stock-in from suppliers
  UPDATE_PURCHASES: "update:purchases",
  DELETE_PURCHASES: "delete:purchases",
} as const;

export const SalesManagementAction = {
  VIEW_SALES: "view:sales",
  CREATE_SALES: "create:sales", // billing / POS
  UPDATE_SALES: "update:sales",
  DELETE_SALES: "delete:sales",
  APPLY_DISCOUNT: "apply:discount",
  PRINT_BILL: "print:bill",
} as const;

export const CustomerManagementAction = {
  VIEW_CUSTOMERS: "view:customers",
  CREATE_CUSTOMERS: "create:customers",
  UPDATE_CUSTOMERS: "update:customers",
  DELETE_CUSTOMERS: "delete:customers",
} as const;

export const ReportManagementAction = {
  VIEW_REPORTS: "view:reports",
  EXPORT_REPORTS: "export:reports",
  VIEW_ANALYSIS: "view:analysis",
} as const;

export const UserManagementAction = {
  VIEW_USERS: "view:users",
  CREATE_USERS: "create:users",
  UPDATE_USERS: "update:users",
  DELETE_USERS: "delete:users",
} as const;

export const EditDialogBoxAction = {
  EDIT_EMAIL: "edit:email",
  EDIT_PHONE: "edit:phone",
  EDIT_ROLE_ADMIN: "edit:role_admin",
  EDIT_ROLE_MANAGER: "edit:role_manager",
  EDIT_ROLE_CASHIER: "edit:role_cashier",
} as const;

export const SettingManagementAction = {
  VIEW_SETTINGS: "view:settings",
  UPDATE_SETTINGS: "update:settings", // VAT rate, PAN/VAT no, bill footer, low-stock default
} as const;

/* -------------------------------------------------------------------------- */
/*  Routes                                                                    */
/* -------------------------------------------------------------------------- */

export const AvailableRoutes = {
  DASHBOARD: "/dashboard",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  STOCK: "/stock",
  SUPPLIERS: "/suppliers",
  PURCHASES: "/purchases",
  SALES: "/sales",
  BILLING: "/billing",
  CUSTOMERS: "/customers",
  REPORTS: "/report-and-analysis",
  USERS: "/users",
  SETTINGS: "/settings",
} as const;

export type AppRoute = (typeof AvailableRoutes)[keyof typeof AvailableRoutes];
export type RouteAccess = AppRoute | "*";

export const routePermissions: Record<RoleType, RouteAccess[]> = {

  admin: ["*"],

  manager: [
    AvailableRoutes.DASHBOARD,
    AvailableRoutes.PRODUCTS,
    AvailableRoutes.CATEGORIES,
    AvailableRoutes.STOCK,
    AvailableRoutes.SUPPLIERS,
    AvailableRoutes.PURCHASES,
    AvailableRoutes.SALES,
    AvailableRoutes.BILLING,
    AvailableRoutes.CUSTOMERS,
    AvailableRoutes.REPORTS,
    AvailableRoutes.USERS,
    AvailableRoutes.SETTINGS,
  ],

  cashier: [
    AvailableRoutes.DASHBOARD,
    AvailableRoutes.PRODUCTS,
    AvailableRoutes.STOCK,
    AvailableRoutes.SALES,
    AvailableRoutes.BILLING,
    AvailableRoutes.CUSTOMERS,
    AvailableRoutes.SETTINGS,
  ],
};

/* -------------------------------------------------------------------------- */
/*  Role permissions                                                          */
/* -------------------------------------------------------------------------- */

export const rolePermissions: Record<RoleType, string[]> = {
  admin: ["*"],

  manager: [
    DashboardAction.VIEW_DASHBOARD,

    // Products & categories
    ProductManagementAction.VIEW_PRODUCTS,
    ProductManagementAction.CREATE_PRODUCTS,
    ProductManagementAction.UPDATE_PRODUCTS,
    ProductManagementAction.DELETE_PRODUCTS,
    ProductManagementAction.VIEW_CATEGORY,
    ProductManagementAction.CREATE_CATEGORY,
    ProductManagementAction.UPDATE_CATEGORY,
    ProductManagementAction.DELETE_CATEGORY,

    // Stock
    StockManagementAction.VIEW_STOCK,
    StockManagementAction.ADJUST_STOCK,
    StockManagementAction.VIEW_STOCK_HISTORY,
    StockManagementAction.VIEW_LOW_STOCK,

    // Suppliers
    SupplierManagementAction.VIEW_SUPPLIERS,
    SupplierManagementAction.CREATE_SUPPLIERS,
    SupplierManagementAction.UPDATE_SUPPLIERS,
    SupplierManagementAction.DELETE_SUPPLIERS,

    // Purchases
    PurchaseManagementAction.VIEW_PURCHASES,
    PurchaseManagementAction.CREATE_PURCHASES,
    PurchaseManagementAction.UPDATE_PURCHASES,
    PurchaseManagementAction.DELETE_PURCHASES,

    // Sales
    SalesManagementAction.VIEW_SALES,
    SalesManagementAction.CREATE_SALES,
    SalesManagementAction.UPDATE_SALES,
    SalesManagementAction.DELETE_SALES,
    SalesManagementAction.APPLY_DISCOUNT,
    SalesManagementAction.PRINT_BILL,

    // Customers
    CustomerManagementAction.VIEW_CUSTOMERS,
    CustomerManagementAction.CREATE_CUSTOMERS,
    CustomerManagementAction.UPDATE_CUSTOMERS,
    CustomerManagementAction.DELETE_CUSTOMERS,

    // Reports
    ReportManagementAction.VIEW_REPORTS,
    ReportManagementAction.EXPORT_REPORTS,
    ReportManagementAction.VIEW_ANALYSIS,

    // Users: can manage cashiers only (no admin/manager role changes, no delete)
    UserManagementAction.VIEW_USERS,
    UserManagementAction.CREATE_USERS,
    UserManagementAction.UPDATE_USERS,
    EditDialogBoxAction.EDIT_PHONE,
    EditDialogBoxAction.EDIT_ROLE_CASHIER,

    // Settings
    SettingManagementAction.VIEW_SETTINGS,
    SettingManagementAction.UPDATE_SETTINGS,
  ],

  cashier: [
    DashboardAction.VIEW_DASHBOARD,

    // Read-only product and stock lookup
    ProductManagementAction.VIEW_PRODUCTS,
    ProductManagementAction.VIEW_CATEGORY,
    StockManagementAction.VIEW_STOCK,
    StockManagementAction.VIEW_LOW_STOCK,

    // Billing
    SalesManagementAction.VIEW_SALES,
    SalesManagementAction.CREATE_SALES,
    SalesManagementAction.PRINT_BILL,

    // Customers
    CustomerManagementAction.VIEW_CUSTOMERS,
    CustomerManagementAction.CREATE_CUSTOMERS,

    // Settings: view only
    SettingManagementAction.VIEW_SETTINGS,
  ],
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export function hasPermission(role: RoleType | undefined, action: string): boolean {
  if (!role) return false;
  const perms = rolePermissions[role];
  return perms.includes("*") || perms.includes(action);
}

export function canAccessRoute(role: RoleType | undefined, pathname: string): boolean {
  if (!role) return false;
  const routes = routePermissions[role];
  if (routes.includes("*")) return true;
  return routes.some((r) => r !== "*" && (pathname === r || pathname.startsWith(r + "/")));
}