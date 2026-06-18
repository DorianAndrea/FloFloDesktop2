import api from "./api";

export const getParentDashboard = async (userId) => {
  const response = await api.get(`/parent-dashboard/${userId}`);
  return response.data;
};