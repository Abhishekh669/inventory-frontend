"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type {
  GetSupplierLedgerParams,
  GetSupplierPaymentsParams,
  SupplierLedgerResponse,
  SupplierPaymentsResponse,
} from "@/utils/types/supplier-payment.types"

export const getSupplierPayments = async (params: GetSupplierPaymentsParams) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-payment-service/get-supplier-payments/${encodeURIComponent(params.supplier_id)}`,
      {
        params: {
          limit: params.limit,
          cursor: params.cursor || undefined,
          status: params.status || undefined,
          from_date: params.from_date || undefined,
          to_date: params.to_date || undefined,
        },
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: SupplierPaymentsResponse = data?.payload

    return {
      success: true,
      payments: payload?.payments ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
      summary: payload?.summary ?? null,
    }
  } catch (error) {
    console.log("error in getSupplierPayments : ", error)
    throw new Error(getErrorMessage(error))
  }
}

export const getSupplierLedger = async (params: GetSupplierLedgerParams) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-payment-service/get-supplier-ledger/${encodeURIComponent(params.supplier_id)}`,
      {
        params: {
          limit: params.limit,
          cursor: params.cursor || undefined,
          from_date: params.from_date || undefined,
          to_date: params.to_date || undefined,
        },
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: SupplierLedgerResponse = data?.payload

    return {
      success: true,
      ledger: payload ?? null,
      entries: payload?.entries ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
    }
  } catch (error) {
    console.log("error in getSupplierLedger : ", error)
    throw new Error(getErrorMessage(error))
  }
}