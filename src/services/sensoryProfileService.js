import api from "./api";

export const getMySensoryProfile = async () => {
  const response = await api.get("/sensory-profile/me");
  return response.data;
};

export const saveMySensoryProfile = async (data) => {
  const response = await api.post("/sensory-profile/me", data);
  return response.data;
};

export const updateMySensoryProfile = async (data) => {
  const response = await api.put("/sensory-profile/me", data);
  return response.data;
};

export const getChildSensoryProfile = async (childId) => {
  const response = await api.get(`/sensory-profile/children/${childId}`);
  return response.data;
};