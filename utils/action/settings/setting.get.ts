"use server"

import { get_cookies } from "@/utils/helper/get-cookies"
import { getErrorMessage } from "@/utils/helper/get.error.message"
import { Setting } from "@/utils/types/settings.types"
import axios from "axios"

export const getSetting = async () => {
    try {
        const user_token = await get_cookies("user_token")
        if(!user_token){
            throw new Error("unauthorized user")
        }
        const {data} = await axios.get(`${process.env.NEXT_BACKEND_URL}/api/v1/setting-service/get-setting`, {
            headers: {
                Authorization: `Bearer ${user_token}`
            }
        })
        const payload : Setting = data?.payload
        console.log(payload)
        return {
            setting : payload as Setting, 
            success : true,
        }
    } catch (error) {
        throw new Error(getErrorMessage(error))
        
    }
}