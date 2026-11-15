import { formatMoney, toDecimal } from "@/utils/helper/purchase-cal"

// money amounts arrive from the API as strings
export const money = (v: string | null | undefined) => formatMoney(toDecimal(v))