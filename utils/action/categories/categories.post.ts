'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { CreateCategory } from "@/utils/types/category.types"
import axios from "axios"



export const createCategory = async (newCategory : CreateCategory) => {
    try {
        const token = await get_cookies("user_token")
        const res = await axios.post(`${process.env.NEXT_BACKEND_URL}/api/v1/category-service/create-category`, newCategory, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            withCredentials: true
        })

        const data = res.data;
        if (!data.success) throw new Error(data?.error || "failed to create category")
        return {
            success: data.success,
            message: data?.message || "created category successfully"
        }
    } catch (error) {

        return {
            success : false,
            error : getErrorMessage(error)
        }
    }
}
