import api from "./api";

export const getUserProgress = async () => {
  const response = await api.get("/progress");
  return response.data;
};