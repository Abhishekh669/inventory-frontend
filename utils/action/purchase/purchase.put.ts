"use server"

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { CreatePurchaseReturnInput, PurchaseActionResult, UpdatePurchaseInput, UpdatePurchasePaymentInput } from "@/utils/types/purchase.types"
import axios from "axios"


const url = (path: string) => `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-service/${path}`

async function authConfig() {
  const user_token = await get_cookies("user_token")
  if (!user_token) throw new Error("unauthorized user")
  return { headers: { Authorization: `Bearer ${user_token}` }, withCredentials: true }
}

export const updatePurchase = async (
  purchaseId: string,
  input: UpdatePurchaseInput
): Promise<PurchaseActionResult> => {
  try {
    const config = await authConfig()
    const { data } = await axios.put(url(`update-purchase/${encodeURIComponent(purchaseId)}`), input, config)
    return { success: true, message: data?.message ?? "Purchase updated" }
  } catch (error) {
    console.log("error in updatePurchase : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export const updatePurchaseReturn = async (
  purchaseId: string,
  returnId: string,
  input: CreatePurchaseReturnInput
): Promise<PurchaseActionResult> => {
  try {
    const config = await authConfig()
    const { data } = await axios.put(
      url(`update-purchase-return/${encodeURIComponent(purchaseId)}/${encodeURIComponent(returnId)}`),
      input,
      config
    )
    return { success: true, message: data?.message ?? "Return updated" }
  } catch (error) {
    console.log("error in updatePurchaseReturn : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export const updatePurchasePayment = async (
  purchaseId: string,
  paymentId: string,
  input: UpdatePurchasePaymentInput
): Promise<PurchaseActionResult> => {
  try {
    const config = await authConfig()
    const { data } = await axios.put(
      url(`update-purchase-payment/${encodeURIComponent(purchaseId)}/${encodeURIComponent(paymentId)}`),
      input,
      config
    )
    return { success: true, message: data?.message ?? "Payment updated" }
  } catch (error) {
    console.log("error in updatePurchasePayment : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}