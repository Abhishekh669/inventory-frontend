"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type {
  CreateAdvancePaymentRequestType,
  SupplierPaymentActionResult,
} from "@/utils/types/supplier-payment.types"

export const createAdvancePayment = async (
  payload: CreateAdvancePaymentRequestType
): Promise<SupplierPaymentActionResult> => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-payment-service/create-advance-payment`,
      payload,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    return { success: true, message: data?.message }
  } catch (error) {
    console.log("error in createAdvancePayment : ", error)
    return { success: false, error: getErrorMessage(error) }
  }
}