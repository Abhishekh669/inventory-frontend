'use server'

import { get_cookies } from "@/utils/helper/get-cookies";
import { getErrorMessage } from "@/utils/helper/get.error.message";
import { Unit } from "@/utils/types/settings.types";
import axios from "axios";



export const createUnits = async (newUnits: {name : string, allow_decimal : boolean}[]) => {
    try {
        if (newUnits.length === 0) throw new Error("please add at least one unit")
        const token = await get_cookies("user_token")
        if (!token) throw new Error("unauthorized user")

        const payload = newUnits.map((u) => ({ name: u.name.trim(), allow_decimal: u.allow_decimal }))
        const res = await axios.post(
            `${process.env.NEXT_BACKEND_URL}/api/v1/setting-service/create-units`,
            payload,
            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        )

        const data = res.data;
        if (!data.success) throw new Error(data?.error || "failed to create units")
        return {
            success: data.success,
            message: data?.message || "created units successfully"
        }
    } catch (error) {

        return {
            success: false,
            error: getErrorMessage(error)
        }
    }
}
