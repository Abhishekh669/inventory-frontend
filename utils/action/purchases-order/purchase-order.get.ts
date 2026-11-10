"use server"

import axios from "axios"
import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import type {
  GetPurchaseOrdersBySupplierParams,
  PurchaseOrderDetail,
  PurchaseOrderItemsResponse,
  PurchaseOrdersBySupplierResponse,
} from "@/utils/types/purchase-order.types"

export const getPurchaseOrdersBySupplier = async (params: GetPurchaseOrdersBySupplierParams) => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-order-service/get-purchase-orders-by-supplier/${encodeURIComponent(params.supplier_id)}`,
      {
       params: {
  limit: params.limit,
  cursor: params.cursor || undefined,
  status: params.status || undefined,
  search: params.search || undefined,
  from_date: params.from_date || undefined,
  to_date: params.to_date || undefined,
},
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: PurchaseOrdersBySupplierResponse = data?.payload

    return {
      success: true,
      purchase_orders: payload?.purchase_orders ?? [],
      total: payload?.total ?? 0,
      next_cursor: payload?.next_cursor ?? null,
      has_more: payload?.has_more ?? false,
    }
  } catch (error) {
    console.log("error in getPurchaseOrdersBySupplier : ", error)
    throw new Error(getErrorMessage(error))
  }
}

export const getPurchaseOrderById = async (id: string) => {
  try {
    if (!id?.trim()) throw new Error("purchase order id is required")

    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-order-service/get-purchase-order/${encodeURIComponent(id)}`,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: PurchaseOrderDetail = data?.payload

    return {
      success: true,
      purchase_order: payload,
    }
  } catch (error) {
    console.log("error in getPurchaseOrderById : ", error)
    throw new Error(getErrorMessage(error))
  }
}

export const getPurchaseOrderItems = async (purchaseOrderId: string) => {
  try {
    if (!purchaseOrderId?.trim()) throw new Error("purchase order id is required")

    const user_token = await get_cookies("user_token")
    if (!user_token) throw new Error("unauthorized user")

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-order-service/get-purchase-order-items/${encodeURIComponent(purchaseOrderId)}`,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    )

    const payload: PurchaseOrderItemsResponse = data?.payload

    return {
      success: true,
      items: payload?.items ?? [],
    }
  } catch (error) {
    console.log("error in getPurchaseOrderItems : ", error)
    throw new Error(getErrorMessage(error))
  }
}