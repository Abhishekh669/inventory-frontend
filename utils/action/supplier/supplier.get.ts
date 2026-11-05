'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { GetSuppliersParams, Supplier } from "@/utils/types/suppliers.types"
import axios from "axios"
export const getSuppliers = async () => {
  try {
    const user_token = await get_cookies("user_token")
    if (!user_token) {
      throw new Error("unauthorized user")
    }

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-service/get-suppliers`,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    )

    const payload: Supplier[] = data?.payload ?? []
    return {
      success: true,
      suppliers: payload,
    }
  } catch (error) {
    console.log("error in getSuppliers : ", error)
    throw new Error(getErrorMessage(error))
  }
}
export const getSupplierById = async (id: string) => {
  try {
    if (!id?.trim()) throw new Error("supplier id is required")

    const user_token = await get_cookies("user_token")
    if (!user_token) {
      throw new Error("unauthorized user")
    }

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-service/get-supplier/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    )

    const payload: Supplier = data?.payload
    return {
      success: true,
      supplier: payload,
    }
  } catch (error) {
    console.log("error in getSupplierById : ", error)
    throw new Error(getErrorMessage(error))
  }
}