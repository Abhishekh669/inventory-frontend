// utils/action/products/products.delete.ts
"use server";

import axios from "axios";
import { get_cookies } from "@/utils/helper/get-cookies";
import { getErrorMessage } from "@/utils/helper/get.error.message";

export const deleteProducts = async (ids: string[]) => {
  try {
    if (!ids?.length) throw new Error("At least one product id is required");

    const user_token = await get_cookies("user_token");
    if (!user_token) throw new Error("unauthorized user");

    const { data } = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/v1/product-service/delete-products`,
      { ids },
      {
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    );

    return { success: true, message: data?.message as string };
  } catch (error) {
    console.log("error in deleteProducts : ", error);
    return {
    success : false,
    error : getErrorMessage(error)
   }
  }
};