'use server'

import { get_cookies } from "@/utils/helper/get-cookies";
import { getErrorMessage } from "@/utils/helper/get.error.message";
import { UpdateSettingRequest, UpdateUnit } from "@/utils/types/settings.types";
import axios from "axios";



export const updateSetting = async (newSetting : UpdateSettingRequest) => {
    try {
      const user_token = await get_cookies("user_token");
      if (!user_token) {
        throw new Error("unauthorized user");
      }
  
      const res = await axios.put(
        `${process.env.NEXT_BACKEND_URL}/api/v1/setting-service/update-setting`,
        newSetting,
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
          withCredentials: true,
        }
      );
  
      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.error || "failed to update setting");
      }
  
      return {
        success: true,
        message: "succesfully updated setting",
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  };
  
  

  export const updateUnit = async (newUnit : UpdateUnit) => {
    try {
      const user_token = await get_cookies("user_token");
      if (!user_token) {
        throw new Error("unauthorized user");
      }
  
      const res = await axios.put(
        `${process.env.NEXT_BACKEND_URL}/api/v1/setting-service/update-unit`,
        newUnit,
        {
          headers: {
            Authorization: `Bearer ${user_token}`,
          },
          withCredentials: true,
        }
      );
  
      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.error || "failed to update units");
      }
  
      return {
        success: true,
        message: "succesfully updated units",
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  };
  
  
  