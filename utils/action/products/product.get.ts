// utils/action/products/products.get.ts
"use server";

import axios from "axios";
import { get_cookies } from "@/utils/helper/get-cookies";
import { GetProductsParams, ProductsListTypeResponse } from "@/utils/types/product.types";
import { getErrorMessage } from "@/utils/helper/get.error.message";

export const getProducts = async (params: GetProductsParams = {}) => {
  try {
    const user_token = await get_cookies("user_token");
    if (!user_token) throw new Error("unauthorized user");

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/product-service/get-products`,
      {
        params: {
          page: params.page ?? 0,
          limit: params.limit,
          from_date: params.from_date,
          to_date: params.to_date,
          name: params.name?.trim() || undefined,
          current_stock: params.current_stock,
          greater_than: params.greater_than,
        },
        headers: { Authorization: `Bearer ${user_token}` },
        withCredentials: true,
      }
    );

    const payload: ProductsListTypeResponse = data?.payload;

    return {
      success: true,
      products: payload?.products ?? [],
      total: payload?.total ?? 0,
      has_more: payload?.has_more ?? false,
      next_offset: payload?.next_offset ?? 0,
    };
  } catch (error) {
    console.log("error in getProducts : ", error);
    throw new Error(getErrorMessage(error));
  }
};