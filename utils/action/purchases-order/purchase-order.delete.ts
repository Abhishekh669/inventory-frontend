"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type {
  DeletePurchaseOrdersRequestType,
  PurchaseOrderActionResult,
} from "@/utils/types/purchase-order.types"

export const deletePurchaseOrders = async (
  payload: DeletePurchaseOrdersRequestType
): Promise<PurchaseOrderActionResult> => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-order-service/delete-purchase-orders`,
      payload,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    return { success: true, message: data?.message }
  } catch (error) {
    console.log("error in deletePurchaseOrders : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}