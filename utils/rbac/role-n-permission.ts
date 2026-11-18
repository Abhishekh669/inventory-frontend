/* -------------------------------------------------------------------------- */
/*                                    Roles                                   */
/* -------------------------------------------------------------------------- */

export type RoleType = "admin" | "manager" | "cashier";

/* -------------------------------------------------------------------------- */
/*                              Available Routes                              */
/* -------------------------------------------------------------------------- */

export const AvailableRoutes = {
  DASHBOARD: "/dashboard",

  PRODUCTS: "/products",

  CATEGORIES: "/categories",

  SUPPLIERS: "/suppliers",

  PURCHASES: "/all-purchases",

  STOCK_MOVEMENT : "/stock-movements",
  SETTINGS: "/settings",
} as const;

/* -------------------------------------------------------------------------- */
/*                            Dynamic Application Routes                     */
/* -------------------------------------------------------------------------- */

export const AppRoutePaths = {
  CATEGORY_DETAILS: (slug: string) => `/categories/${slug}`,

  PURCHASE_DETAILS: (purchaseId: string) =>
    `/all-purchases/${purchaseId}`,

  SUPPLIER_DETAILS: (supplierId: string) =>
    `/suppliers/${supplierId}`,

  SUPPLIER_LEDGER: (supplierId: string) =>
    `/suppliers/${supplierId}/ledger`,

  SUPPLIER_PAYMENTS: (supplierId: string) =>
    `/suppliers/${supplierId}/payments`,

  SUPPLIER_PURCHASES: (supplierId: string) =>
    `/suppliers/${supplierId}/purchases`,

  SUPPLIER_RETURNS: (supplierId: string) =>
    `/suppliers/${supplierId}/returns`,
};

/* -------------------------------------------------------------------------- */
/*                             Permission Actions                             */
/* -------------------------------------------------------------------------- */

export const DashboardManagementAction = {
  VIEW_DASHBOARD: "view:dashboard",
} as const;

export const ProductManagementAction = {
  VIEW_PRODUCTS: "view:products",
  CREATE_PRODUCTS: "create:products",
  UPDATE_PRODUCTS: "update:products",
  DELETE_PRODUCTS: "delete:products",
} as const;

export const CategoryManagementAction = {
  VIEW_CATEGORIES: "view:categories",
  CREATE_CATEGORIES: "create:categories",
  UPDATE_CATEGORIES: "update:categories",
  DELETE_CATEGORIES: "delete:categories",
} as const;

export const SupplierManagementAction = {
  VIEW_SUPPLIERS: "view:suppliers",
  CREATE_SUPPLIERS: "create:suppliers",
  UPDATE_SUPPLIERS: "update:suppliers",
  DELETE_SUPPLIERS: "delete:suppliers",

  VIEW_SUPPLIER_LEDGER: "view:supplier_ledger",

  VIEW_SUPPLIER_PAYMENTS: "view:supplier_payments",
  CREATE_SUPPLIER_PAYMENTS: "create:supplier_payments",
  UPDATE_SUPPLIER_PAYMENTS: "update:supplier_payments",
  DELETE_SUPPLIER_PAYMENTS: "delete:supplier_payments",

  VIEW_SUPPLIER_PURCHASES: "view:supplier_purchases",

  VIEW_SUPPLIER_RETURNS: "view:supplier_returns",
} as const;

export const PurchaseManagementAction = {
  VIEW_PURCHASES: "view:purchases",
  CREATE_PURCHASES: "create:purchases",
  UPDATE_PURCHASES: "update:purchases",
  DELETE_PURCHASES: "delete:purchases",

  VIEW_PURCHASE_ORDERS: "view:purchase_orders",
  CREATE_PURCHASE_ORDERS: "create:purchase_orders",
  UPDATE_PURCHASE_ORDERS: "update:purchase_orders",
  DELETE_PURCHASE_ORDERS: "delete:purchase_orders",
} as const;

export const StockManagementAction = {
  VIEW_STOCK: "view:stock",
  CREATE_STOCK: "create:stock",
  UPDATE_STOCK: "update:stock",
  DELETE_STOCK: "delete:stock",
} as const;

export const SettingsManagementAction = {
  VIEW_SETTINGS: "view:settings",
  UPDATE_SETTINGS: "update:settings",
} as const;

/* -------------------------------------------------------------------------- */
/*                              Route Permissions                              */
/* -------------------------------------------------------------------------- */

/**
 * These permissions control which frontend pages a role can access.
 *
 * Dynamic supplier routes use :supplier_id as a parameter.
 */

export const routePermissions: Record<RoleType, string[]> = {
  admin: ["*"],

  manager: [
    AvailableRoutes.DASHBOARD,
    AvailableRoutes.PRODUCTS,
    AvailableRoutes.CATEGORIES,
    AvailableRoutes.SUPPLIERS,
    AvailableRoutes.PURCHASES,
    AvailableRoutes.SETTINGS,

    "/suppliers/:supplier_id",
    "/suppliers/:supplier_id/ledger",
    "/suppliers/:supplier_id/payments",
    "/suppliers/:supplier_id/purchases",
    "/suppliers/:supplier_id/returns",
  ],

  cashier: [
    AvailableRoutes.DASHBOARD,
    AvailableRoutes.PRODUCTS,
    AvailableRoutes.CATEGORIES,
    AvailableRoutes.SETTINGS,
  ],
};

/* -------------------------------------------------------------------------- */
/*                             Role Action Permissions                         */
/* -------------------------------------------------------------------------- */

export const rolePermissions: Record<RoleType, string[]> = {
  admin: ["*"],

  manager: [
    ...Object.values(DashboardManagementAction),

    ...Object.values(ProductManagementAction),

    ...Object.values(CategoryManagementAction),

    ...Object.values(SupplierManagementAction),

    ...Object.values(PurchaseManagementAction),

    ...Object.values(StockManagementAction),

    ...Object.values(SettingsManagementAction),
  ],

  cashier: [
    DashboardManagementAction.VIEW_DASHBOARD,

    ProductManagementAction.VIEW_PRODUCTS,

    CategoryManagementAction.VIEW_CATEGORIES,

    StockManagementAction.VIEW_STOCK,

    SettingsManagementAction.VIEW_SETTINGS,
  ],
};

/* -------------------------------------------------------------------------- */
/*                             Route Matching                                  */
/* -------------------------------------------------------------------------- */

/**
 * Matches:
 *
 * /suppliers/:supplier_id/payments
 *
 * With:
 *
 * /suppliers/123/payments
 */

const matchesRoute = (
  routePattern: string,
  currentRoute: string
): boolean => {
  const patternParts = routePattern.split("/");
  const currentParts = currentRoute.split("/");

  if (patternParts.length !== currentParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    if (part.startsWith(":")) {
      return currentParts[index].length > 0;
    }

    return part === currentParts[index];
  });
};

/* -------------------------------------------------------------------------- */
/*                            Check Route Access                               */
/* -------------------------------------------------------------------------- */

/**
 * Checks whether a user role can access a particular frontend route.
 *
 * Example:
 *
 * canAccessRoute("manager", "/suppliers/123/payments")
 */

export const canAccessRoute = (
  role: RoleType,
  route: string
): boolean => {
  const allowedRoutes = routePermissions[role];

  if (!allowedRoutes) {
    return false;
  }

  if (allowedRoutes.includes("*")) {
    return true;
  }

  return allowedRoutes.some((allowedRoute) => {
    // Exact match
    if (allowedRoute === route) {
      return true;
    }

    // Dynamic route match
    if (allowedRoute.includes(":")) {
      return matchesRoute(allowedRoute, route);
    }

    // Parent route access
    return route.startsWith(`${allowedRoute}/`);
  });
};

/* -------------------------------------------------------------------------- */
/*                           Check Action Permission                           */
/* -------------------------------------------------------------------------- */

/**
 * Checks whether a role has permission to perform an action.
 *
 * Example:
 *
 * hasPermission("manager", "create:supplier_payments")
 */

export const hasPermission = (
  role: RoleType,
  permission: string
): boolean => {
  const permissions = rolePermissions[role];

  if (!permissions) {
    return false;
  }

  return permissions.includes("*") || permissions.includes(permission);
};