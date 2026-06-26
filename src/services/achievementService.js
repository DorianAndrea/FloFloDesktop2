import api from "./api";

export const getAchievements = async () => {
  const response = await api.get("/achievements");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data.achievements)) {
    return response.data.achievements;
  }

  return [];
};