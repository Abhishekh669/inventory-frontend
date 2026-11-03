// utils/action/products/products.create.ts
"use server";

import axios from "axios";
import { get_cookies } from "@/utils/helper/get-cookies";
import { CreateProductRequestType } from "@/utils/types/product.types";
import { getErrorMessage } from "@/utils/helper/get.error.message";

export const createProducts = async (products: CreateProductRequestType[]) => {
  try {
    if (!products?.length) throw new Error("At least one product is required");

    const user_token = await get_cookies("user_token");
    if (!user_token) throw new Error("unauthorized user");

    const { data } = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/v1/product-service/create-products`,
      products,
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    );

    return { success: true, message: data?.message as string, payload: data?.payload };
  } catch (error) {
    console.log("error in createProducts : ", error);
   return {
    success : false,
    error : getErrorMessage(error)
   }
  }
};