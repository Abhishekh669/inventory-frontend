// NEW FILE: utils/action/stock-movement/stock-movement.get.ts
"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { GetStockMovementsParams, GetStockMovementsResponse } from "@/utils/types/stock.movement.types"


export const getStockMovements = async (params: GetStockMovementsParams = {}) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/stock-movement-service/get-stock-movements`,
      {
        params: {
          limit: params.limit,
          cursor: params.cursor || undefined,
          product_id: params.product_id || undefined,
          type: params.type || undefined,
          from_date: params.from_date || undefined,
          to_date: params.to_date || undefined,
        },
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: GetStockMovementsResponse = data?.payload

    return {
      success: true,
      items: payload?.items ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
    }
  } catch (error) {
    console.log("error in getStockMovements : ", error)
    throw new Error(getErrorMessage(error))
  }
}