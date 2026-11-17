"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type { PurchaseActionResult } from "@/utils/types/purchase.types"

const url = (path: string) => `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-service/${path}`

async function authConfig() {
  const user_token = await get_cookies("user_token")
  if (!user_token) throw new Error("unauthorized user")
  return { headers: { Authorization: `Bearer ${user_token}` }, withCredentials: true }
}

export const deletePurchase = async (purchaseId: string): Promise<PurchaseActionResult> => {
  try {
    const config = await authConfig()
    const { data } = await axios.delete(url(`delete-purchase/${encodeURIComponent(purchaseId)}`), config)
    return { success: true, message: data?.message ?? "Purchase deleted" }
  } catch (error) {
    console.log("error in deletePurchase : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export const deletePurchaseReturn = async (
  purchaseId: string,
  returnId: string
): Promise<PurchaseActionResult> => {
  try {
    const config = await authConfig()
    const { data } = await axios.delete(
      url(`delete-purchase-return/${encodeURIComponent(purchaseId)}/${encodeURIComponent(returnId)}`),
      config
    )
    return { success: true, message: data?.message ?? "Return deleted" }
  } catch (error) {
    console.log("error in deletePurchaseReturn : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export const deletePurchasePayment = async (
  purchaseId: string,
  paymentId: string
): Promise<PurchaseActionResult> => {
  try {
    const config = await authConfig()
    const { data } = await axios.delete(
      url(`delete-purchase-payment/${encodeURIComponent(purchaseId)}/${encodeURIComponent(paymentId)}`),
      config
    )
    return { success: true, message: data?.message ?? "Payment deleted" }
  } catch (error) {
    console.log("error in deletePurchasePayment : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}