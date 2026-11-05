'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { CreateSupplier, Supplier } from "@/utils/types/suppliers.types"
import axios from "axios"

export const createSuppliers = async (newSuppliers: CreateSupplier[]) => {
  try {
    if (newSuppliers.length < 1) throw new Error("please add at least one supplier")
    if (newSuppliers.some((s) => !s.name?.trim())) throw new Error("supplier name is required")

    const user_token = await get_cookies("user_token")
    if (!user_token) {
      throw new Error("unauthorized user")
    }

    const res = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-service/create-suppliers`,
      newSuppliers,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    )

    const data = res.data
    if (!data?.success) {
      throw new Error(data?.error || "failed to create suppliers")
    }

    return {
      success: true,
      message:
        data?.message ||
        `created ${newSuppliers.length} ${newSuppliers.length > 1 ? "suppliers" : "supplier"} successfully`,
      suppliers: (data?.payload ?? []) as Supplier[],
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}