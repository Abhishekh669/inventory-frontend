import Decimal from "decimal.js"
import { Badge } from "@/components/ui/badge"
import { toDecimal } from "@/utils/helper/format"

export function StockBadge({ stock, reOrderLevel }: { stock: string; reOrderLevel: string }) {
  const s: Decimal = toDecimal(stock)
  const r: Decimal = toDecimal(reOrderLevel)

  if (s.lte(0)) {
    return <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">No Stock</Badge>
  }
  if (s.lte(r)) {
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Low</Badge>
  }
  return <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">OK</Badge>
}