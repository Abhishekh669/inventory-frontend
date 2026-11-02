'use server'

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import axios from "axios"


export const deleteCategories = async (ids: string[]) => {
    try {
        if (ids.length < 1) throw new Error("please select at least one category")
        const user_token = await get_cookies("user_token")
        if (!user_token) {
            throw new Error("unauthorized user")
        }
        const res = await axios.post(`${process.env.NEXT_BACKEND_URL}/api/v1/category-service/delete-categories`,
            {
                ids
            },
            {
                headers: {
                    Authorization: `Bearer ${user_token}`,
                },
                withCredentials: true
            }
        )
        const data = res.data;
        if (!data?.success) {
            throw new Error(data?.error || `failed to delete ${ids.length > 0 ? "categories" : "category"}`)
        }

        return {
            success: true,
            message: data?.message || ` deleted ${ids.length} ${ids.length > 0 ? "categoreis" : "category"} successfully`
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error)
        }

    }
}