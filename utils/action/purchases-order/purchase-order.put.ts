"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type {
  PurchaseOrderActionResult,
  PurchaseOrderDetail,
  UpdatePurchaseOrderRequestType,
} from "@/utils/types/purchase-order.types"

export const updatePurchaseOrder = async (
  payload: UpdatePurchaseOrderRequestType
): Promise<PurchaseOrderActionResult> => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { id, ...body } = payload

    const { data } = await axios.put(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-order-service/update-purchase-order/${encodeURIComponent(id)}`,
      body,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    return {
      success: true,
      message: data?.message,
      purchase_order: data?.payload as PurchaseOrderDetail,
    }
  } catch (error) {
    console.log("error in updatePurchaseOrder : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}