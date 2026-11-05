'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { Supplier, UpdateSupplier } from "@/utils/types/suppliers.types"
import axios from "axios"

export const updateSupplier = async (supplier: UpdateSupplier) => {
  try {
    const { id, ...body } = supplier
    if (!id?.trim()) throw new Error("supplier id is required")
    if (body.name !== undefined && body.name.trim() === "") {
      throw new Error("supplier name cannot be empty")
    }

    const user_token = await get_cookies("user_token")
    if (!user_token) {
      throw new Error("unauthorized user")
    }

    const res = await axios.put(
      `${process.env.NEXT_BACKEND_URL}/api/v1/supplier-service/update-supplier/${encodeURIComponent(id)}`,
      body, // undefined fields are dropped from the JSON, so they stay unchanged
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    )

    const data = res.data
    if (!data?.success) {
      throw new Error(data?.error || "failed to update supplier")
    }

    return {
      success: true,
      message: data?.message || "supplier updated successfully",
      supplier: data?.payload as Supplier,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}