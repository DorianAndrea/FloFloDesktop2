import api from "./api";

export const getLearningContexts = async () => {
  const response = await api.get("/learning-contexts");
  return response.data;
};