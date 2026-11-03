// utils/action/products/products.update.ts
"use server";

import axios from "axios";
import { get_cookies } from "@/utils/helper/get-cookies";
import { UpdateProductRequestType } from "@/utils/types/product.types";
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