"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type { GetAllPurchasesParams, GetAllPurchasesResponse, GetSupplierPurchasesParams, GetSupplierPurchasesResponse, GetSupplierReturnsParams, GetSupplierReturnsResponse, PurchaseByIdResponse } from "@/utils/types/purchase.types"

export const getAllPurchases = async (params: GetAllPurchasesParams) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-service/get-purchases`,
      {
        params: {
          limit: params.limit,
          cursor: params.cursor || undefined,
          purchase_order_status: params.purchase_order_status || undefined,
          po_number: params.po_number || undefined,
          purchase_status: params.purchase_status || undefined,
          payment_status: params.payment_status || undefined,
          search: params.search || undefined,
          from_date: params.from_date || undefined,
          to_date: params.to_date || undefined,
        },
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: GetAllPurchasesResponse = data?.payload

    return {
      success: true,
      items: payload?.items ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
    }
  } catch (error) {
    console.log("error in getAllPurchases : ", error)
    throw new Error(getErrorMessage(error))
  }
}



export const getPurchaseById = async (purchaseId: string) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-service/get-purchase/${encodeURIComponent(purchaseId)}`,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    // backend sends gin.H{"purchase": ...} inside `payload`
    const purchase: PurchaseByIdResponse | undefined = data?.payload?.purchase
    if (!purchase) throw new Error("purchase not found")

    return {
      success: true,
      purchase,
    }
  } catch (error) {
    console.log("error in getPurchaseById : ", error)
    throw new Error(getErrorMessage(error))
  }
}















const url = (path: string) => `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-service/${path}`

export const getSupplierPurchases = async (params: GetSupplierPurchasesParams) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      url(`get-supplier-purchases/${encodeURIComponent(params.supplier_id)}`),
      {
        params: {
          limit: params.limit,
          cursor: params.cursor || undefined,
          payment_status: params.payment_status || undefined,
          purchase_status: params.purchase_status || undefined,
          from_date: params.from_date || undefined,
          to_date: params.to_date || undefined,
        },
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: GetSupplierPurchasesResponse = data?.payload
    return {
      success: true,
      items: payload?.items ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
    }
  } catch (error) {
    console.log("error in getSupplierPurchases : ", error)
    throw new Error(getErrorMessage(error))
  }
}

export const getSupplierReturns = async (params: GetSupplierReturnsParams) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      url(`get-supplier-returns/${encodeURIComponent(params.supplier_id)}`),
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

    const payload: GetSupplierReturnsResponse = data?.payload
    return {
      success: true,
      items: payload?.items ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
    }
  } catch (error) {
    console.log("error in getSupplierReturns : ", error)
    throw new Error(getErrorMessage(error))
  }
}