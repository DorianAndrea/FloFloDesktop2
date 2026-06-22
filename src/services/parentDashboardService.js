import api from "./api";

export const getMyDashboard = async () => {
  const response = await api.get("/parent-dashboard/me");
  return response.data;
};

export const getChildDashboard = async (childId) => {
  const response = await api.get(`/parent-dashboard/children/${childId}`);
  return response.data;
};