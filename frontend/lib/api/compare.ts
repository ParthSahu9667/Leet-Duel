import { api } from "./axios";
import { RankedUser } from "@/types/type";

export const compareUsers = async (userList: string): Promise<RankedUser[]> => {
  try {
    const res = await api.get(`/compare?users=${encodeURIComponent(userList)}`);
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to fetch comparison data");
  }
};