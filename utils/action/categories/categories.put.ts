'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { UpdateCategory } from "@/utils/types/category.types"
import axios from "axios"


export const updateCategory = async(category : UpdateCategory) =>{
    try {

        if(category.id == "" || category.name === "" || category.slug === "") throw new  Error("all the fields are necessary")  
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("unauthorized user")
        }

       
      
        const res = await axios.put(`${process.env.NEXT_BACKEND_URL}/api/v1/category-service/update-category`,
            category,
            {
            headers: {
                Authorization: `Bearer ${user_token}`,
            },
            withCredentials: true
        }
        )
        const data =res.data;
        if(!data?.success){
            throw new Error(data?.error || "failed to update category")
        }

        return {
            success : true,
            message : data?.message ||  " category updated successfully"
        }
    } catch (error) {
        error = getErrorMessage(error);
        return {
            success : false, 
            error 
        }

    }
}

