import api from "./api";

export const getExperienceFavorites = async () => {
  const { data } = await api.get("/experience-favorites");
  return data;
};

export const addExperienceFavorite = async (templateId) => {
  const { data } = await api.post(
    `/experience-favorites/${templateId}`
  );
  return data;
};

export const removeExperienceFavorite = async (templateId) => {
  const { data } = await api.delete(
    `/experience-favorites/${templateId}`
  );
  return data;
};