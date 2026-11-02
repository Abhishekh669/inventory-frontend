'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { Category } from "@/utils/types/category.types"
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