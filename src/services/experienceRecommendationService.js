import api from "./api";

export const getExperienceRecommendations = async () => {
  const { data } = await api.get("/experience-recommendations");
  return data;
};