import api from "./api";

export const getExperienceTemplates = async () => {
  const { data } = await api.get("/experience-templates");
  return data;
};

export const getExperienceTemplate = async (id) => {
  const { data } = await api.get(`/experience-templates/${id}`);
  return data;
};

export const getExperienceCategories = async () => {
  const { data } = await api.get("/experience-templates/categories");
  return data;
};