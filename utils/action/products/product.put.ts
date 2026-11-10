// utils/action/products/products.update.ts
"use server";

import axios from "axios";
import { get_cookies } from "@/utils/helper/get-cookies";
import { ProductPriceResult, UpdateProductPrice, UpdateProductRequestType } from "@/utils/types/product.types";
import { getErrorMessage } from "@/utils/helper/get.error.message";

export const updateProduct = async (product: UpdateProductRequestType) => {
  try {
    if (!product?.id) throw new Error("Product id is required");

    const user_token = await get_cookies("user_token");
    if (!user_token) throw new Error("unauthorized user");

    const { data } = await axios.put(
      `${process.env.NEXT_BACKEND_URL}/api/v1/product-service/update-product`,
      product,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    );

    return { success: true, message: data?.message as string, payload: data?.payload };
  } catch (error) {
    console.log("error in updateProduct : ", error);
    return {
    success : false,
    error : getErrorMessage(error)
   }
  }
};



export const updateProductPrice = async (input: UpdateProductPrice) => {
  try {
    const newPrice = Number(input.new_price)
    const vat = Number(input.current_vat)
    const margin = Number(input.current_margin)

    if (!input.id?.trim()) throw new Error("product id is required")
    if (!Number.isFinite(newPrice) || newPrice <= 0) throw new Error("new price must be greater than 0")
    if (!Number.isFinite(vat) || vat < 0 || vat > 100) throw new Error("VAT must be between 0 and 100")
    if (!Number.isFinite(margin) || margin < 0 || margin > 1000) throw new Error("margin must be between 0 and 1000")

    const user_token = await get_cookies("user_token")
    if (!user_token) {
      throw new Error("unauthorized user")
    }

    const res = await axios.put(
      `${process.env.NEXT_BACKEND_URL}/api/v1/product-service/update-product-price`,
      {
        id: input.id,
        old_price: String(input.old_price),
        new_price: String(input.new_price),
        current_vat: String(input.current_vat),
        current_margin: String(input.current_margin),
      },
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    )

    const data = res.data
    if (!data?.success) {
      throw new Error(data?.error || "failed to update product price")
    }

    return {
      success: true,
      message: data?.message || "product price updated successfully",
      product: data?.payload as ProductPriceResult,
    }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    }
  }
}