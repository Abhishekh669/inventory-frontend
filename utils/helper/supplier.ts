export const formatMoney = (value: string | number) =>
  `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)}`;

export const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export const getSupplierTone = (s: { balance: string; is_active: boolean }) => {
  const owes = (Number(s.balance) || 0) > 0;
  return {
    owes,
    inactive: !s.is_active,
    // left indicator bar
    bar: owes ? "bg-red-500" : "bg-emerald-500",
    // row background
    row: !s.is_active
      ? "bg-gray-100 text-muted-foreground hover:bg-gray-200/70 dark:bg-muted/40 dark:hover:bg-muted/60"
      : owes
        ? "bg-red-50 hover:bg-red-100/70 dark:bg-red-500/10 dark:hover:bg-red-500/15"
        : "bg-emerald-50/70 hover:bg-emerald-100/60 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15",
  };
};