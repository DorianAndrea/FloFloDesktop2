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

export const getMySensoryProfileHistory = async () => {
  const response = await api.get("/sensory-profile/me/history");
  return response.data;
};

export const getChildSensoryProfileHistory = async (childId) => {
  const response = await api.get(`/sensory-profile/children/${childId}/history`);
  return response.data;
};

export const saveChildSensoryProfile = async (childId, data) => {
  const response = await api.post(`/sensory-profile/children/${childId}`, data);
  return response.data;
};

export const updateChildSensoryProfile = async (childId, data) => {
  const response = await api.put(`/sensory-profile/children/${childId}`, data);
  return response.data;
};