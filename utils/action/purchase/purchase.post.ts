"use server";

import axios from "axios";

import type {CreatePurchaseInput,CreatePurchaseResult,} from "@/utils/types/purchase.types";

import { get_cookies } from "@/utils/helper/get-cookies";
import { getErrorMessage } from "@/utils/helper/get.error.message";

export const createPurchase = async (input: CreatePurchaseInput): Promise<CreatePurchaseResult> => {
  try {
    console.log("this is data : ", input)
    if (!input) throw new Error("Purchase data is required");

    const user_token = await get_cookies("user_token");
    if (!user_token) throw new Error("unauthorized user");

    const { data } = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/v1/purchase-service/create-purchase`,
      input,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    );

    return {
      success: true,
      message: data?.message as string,
      purchase_id: data?.purchase_id,
    };
  } catch (error) {
    console.log("error in createPurchase:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};