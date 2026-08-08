import api from "./api";

export const getExperienceLibrary = async () => {
  const { data } = await api.get("/experience-library");
  return data;
};