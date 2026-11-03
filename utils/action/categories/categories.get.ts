'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { Category } from "@/utils/types/category.types"
import { GetProductsParams, ProductsListTypeResponse } from "@/utils/types/product.types"
import axios from "axios"

export const getCategories = async () =>{
    try {
     const user_token = await get_cookies("user_token")   
     if(!user_token){
        throw new Error("unauthorized user")
     }
    
    const {data} = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/category-service/get-categories`,
      {
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    );
    const payload: Category[] = data?.payload;
    console.log("this is hte payload : ", payload)
    return {
        categories : payload,
        success :true
    }
    } catch (error) {
      console.log("error in categoreis : ", error)
        throw new Error(getErrorMessage(error))
    }
}


export const getProductsByCategory = async (
  slug: string,
  params: GetProductsParams = {}
) => {
  try {
    const cleanSlug = slug?.trim().toLowerCase();
    if (!cleanSlug) {
      throw new Error("Category slug is required");
    }

    const user_token = await get_cookies("user_token");
    if (!user_token) {
      throw new Error("unauthorized user");
    }

    const { data } = await axios.get(
      `${process.env.NEXT_BACKEND_URL}/api/v1/product-service/get-products/category/${encodeURIComponent(cleanSlug)}`,
      {
        // axios drops undefined values, so only the filters you pass are sent
        params: {
          page: params.page ?? 0,
          limit: params.limit,
          from_date: params.from_date,
          to_date: params.to_date,
          name: params.name?.trim() || undefined,
          current_stock: params.current_stock,
          greater_than: params.greater_than,
        },
        headers: {
          Authorization: `Bearer ${user_token}`,
        },
        withCredentials: true,
      }
    );

    const payload: ProductsListTypeResponse = data?.payload;

    return {
      success: true,
      products: payload?.products ?? [],
      total: payload?.total ?? 0,
      has_more: payload?.has_more ?? false,
      next_offset: payload?.next_offset ?? 0, // next page number
    };
  } catch (error) {
    console.log("error in getProductsByCategory : ", error);
    throw new Error(getErrorMessage(error));
  }
};



