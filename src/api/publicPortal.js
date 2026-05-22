import axios from "axios";
import { API_URL } from "../../config";

const publicClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getCounselingLevels = async () => {
  const response = await publicClient.get("/public/counseling-levels");
  return response.data;
};
